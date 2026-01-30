import { Router } from "express";
import { PayPalGateway } from "../services/payments/paypal-gateway";
import { storage } from "../storage/storage";
import { NotificationService } from "../services/notification.service";
import { emitNewOrder, emitPaymentUpdate } from "../services/socket";

const router = Router();
const paypalGateway = new PayPalGateway();

/**
 * POST /api/v1/webhooks/paypal
 * Public endpoint for PayPal Webhooks.
 * Securely verifies signatures and updates payment statuses.
 */
router.post("/paypal", async (req, res) => {
  const headers = req.headers;
  const body = req.body;

  console.log("[PayPal Webhook] Received notification");

  // 1. Verify Signature properly (SERVER-SIDE)
  const isValid = await paypalGateway.verifyWebhookSignature(headers, body);
  if (!isValid) {
    console.error("[PayPal Webhook] Signature verification failed. Possible fraud attempt.");
    return res.status(400).send("Verification failed");
  }

  const eventType = body.event_type;
  console.log(`[PayPal Webhook] Verified event: ${eventType}`);

  // 2. Handle successful payment capture
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const resource = body.resource;
    const customId = resource.custom_id; // Our internal TransactionId (TXN-...)

    if (!customId) {
      console.warn("[PayPal Webhook] Missing custom_id in PAYMENT.CAPTURE.COMPLETED event");
      return res.status(200).send("OK");
    }

    // 3. Find and Update local payment
    const payment = await storage.getPaymentByTransactionId(customId);
    if (!payment) {
      console.error(`[PayPal Webhook] Local payment not found for custom_id: ${customId}`);
      return res.status(200).send("OK");
    }

    if (payment.status === "paid" || payment.status === "completed") {
      console.log(`[PayPal Webhook] Payment ${customId} is already marked as paid. Skipping.`);
      return res.status(200).send("OK");
    }

    // Update Payment Status
    console.log(`[PayPal Webhook] Updating payment ${payment.id} to 'paid'`);
    await storage.updatePaymentStatus(payment.id, "paid");
    
    // Update all related Orders to 'processing'
    console.log(`[PayPal Webhook] Updating related orders for transaction ${customId} to 'processing'`);
    await storage.updateOrdersByTransactionId(customId, "processing");

    // 4. Notifications & Real-time updates
    const orders = await storage.getOrdersByTransactionId(customId);
    for (const order of orders) {
        // Trigger server-side logic (emails, system notifications)
        await NotificationService.notifyOrderCreated(order);
        // Trigger WebSocket updates for real-time dashboard refresh
        emitNewOrder(order);
    }
    
    // Notify admin panel specifically for the payment list update
    emitPaymentUpdate();

    console.log(`[PayPal Webhook] Payment confirmation successfully processed for ${customId}`);
  } 
  
  // 5. Handle denied payment
  else if (eventType === "PAYMENT.CAPTURE.DENIED") {
    const resource = body.resource;
    const customId = resource.custom_id;

    if (customId) {
      console.warn(`[PayPal Webhook] Payment ${customId} was DENIED by PayPal.`);
      const payment = await storage.getPaymentByTransactionId(customId);
      if (payment) {
        await storage.updatePaymentStatus(payment.id, "failed");
        // Revert orders back to pending_payment if they weren't already processed
        await storage.updateOrdersByTransactionId(customId, "pending_payment");
      }
    }
  }

  // 6. Handle refund
  else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
    const resource = body.resource;
    // For refunds, the parent_payment might contain the original custom_id or we look at the refund resource
    const customId = resource.custom_id || (resource.amount && resource.amount.details && resource.amount.details.custom_id);

    if (customId) {
      console.info(`[PayPal Webhook] Payment ${customId} was REFUNDED.`);
      const payment = await storage.getPaymentByTransactionId(customId);
      if (payment) {
        await storage.updatePaymentStatus(payment.id, "refunded");
        await storage.updateOrdersByTransactionId(customId, "cancelled");
      }
    }
  }

  // Always return 200 to PayPal to acknowledge receipt
  res.status(200).send("OK");
});

export default router;
