import { Router, Request, Response } from 'express';
import { db as prisma } from '../config/db';
import { PayoneerGateway } from '../services/payments/payoneer-gateway';
import { NotificationService } from '../services/notification.service';
import { emitNewOrder } from '../services/socket';

const router = Router();
const payoneerGateway = new PayoneerGateway();

/**
 * POST /api/payments/payoneer/create
 * Initiate a payment via Payoneer
 */
router.post('/payoneer/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.body; // Changed from amount/orderId to transactionId
    const userId = req.user!.id;

    // Validate inputs
    if (!transactionId) {
      res.status(400).json({ error: 'Missing transaction ID' });
      return;
    }

    // 1. Fetch Payment by Transaction ID
    const payment = await prisma.payment.findFirst({
        where: { transactionId, userId }
    });

    if (!payment) {
        res.status(404).json({ error: 'Payment record not found or access denied' });
        return;
    }

    // 2. Validate Payment Status
    if (payment.status === 'completed' || payment.status === 'paid') {
        res.status(400).json({ error: 'Payment already completed' });
        return;
    }

    // 3. Initiate Payment with Trusted Backend Amount
    try {
      // Use the amount from the DB record, NOT from the frontend
      const intent = await payoneerGateway.createPaymentIntent(
          payment.amount, 
          payment.currency || 'USD', 
          payment.transactionId!, // Use transaction ID as the reference
          req.user
      );
      res.json({ 
          success: true,
          redirectUrl: intent.url,
          transactionId: payment.transactionId
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  } catch (error) {
    console.error('Payment Create Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/payments/payoneer/verify
 * Verify a completed payment
 */
router.post('/payoneer/verify', async (req: Request, res: Response): Promise<void> => {
   try {
     const { transactionId } = req.body;
     
     // Check our database for the payment status
     const payment = await prisma.payment.findFirst({
         where: { transactionId }
     });
     
     if (payment && (payment.status === 'paid' || payment.status === 'completed')) {
        res.json({ success: true, status: 'paid' });
     } else {
        res.json({ success: false, status: payment?.status || 'not_found' });
     }
   } catch (error) {
     console.error('[Payment Verify] Error:', error);
     res.status(500).json({ error: 'Verification failed' });
   }
});

/**
 * GET /api/payments/payoneer/details/:transactionId
 * Fetch payment details for the mock checkout page
 */
router.get('/payoneer/details/:transactionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId } = req.params;
    
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // Safety check: only return public mock data
    res.json({
      amount: payment.amount,
      currency: payment.currency || 'USD',
      transactionId: payment.transactionId,
      customerName: payment.user?.name,
      status: payment.status
    });
  } catch (error) {
    console.error('[Payment Details] Error:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

/**
 * GET /api/payments/payoneer/callback
 * Handle redirect from Payoneer (or mock stub)
 */
router.get('/payoneer/callback', async (req: Request, res: Response): Promise<void> => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const { txId, refId, status } = req.query;

    if (status === 'success' && typeof refId === 'string') {
      try {
        // 1. Find Payment Record
        const payment = await prisma.payment.findFirst({
            where: { transactionId: refId }
        });

        if (!payment) {
            console.error(`[Payment Callback] Payment record not found for refId: ${refId}`);
            res.redirect(`${frontendUrl}/payment/failed?error=record_missing&transactionId=${refId}`);
            return;
        }

        // 2. Verify Payment with Gateway
        const isValid = await payoneerGateway.verifyPayment(String(txId));
        if (!isValid) {
             console.error(`[Payment Callback] Invalid gateway transaction: ${txId}`);
             res.redirect(`${frontendUrl}/payment/failed?error=verification_failed&transactionId=${refId}`);
             return;
        }

        // 3. Update Database
        if (payment.status !== 'paid') {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'paid', updatedAt: new Date() }
            });

            if (payment.transactionId) {
                await prisma.order.updateMany({
                    where: { transactionId: payment.transactionId },
                    data: { status: 'processing' }
                });

                const updatedOrders = await prisma.order.findMany({
                    where: { transactionId: payment.transactionId }
                });

                for (const order of updatedOrders) {
                     await NotificationService.notifyOrderCreated(order);
                     emitNewOrder(order);
                }
            }
        }

        res.redirect(`${frontendUrl}/payment/success?transactionId=${refId}`);

      } catch (error) {
         console.error('[Payment Callback] Error:', error);
         res.redirect(`${frontendUrl}/payment/failed?error=internal_error&transactionId=${refId}`);
      }

    } else {
      res.redirect(`${frontendUrl}/payment/failed?status=${status}&transactionId=${refId || ''}`);
    }
});

export default router;
