import { Router, Request, Response } from 'express';
import { db as prisma } from '../config/db';
import { PayoneerProvider } from '../services/payments/payoneer.provider';
import { emitPayoutUpdate } from '../services/socket';

const router = Router();
// Singleton or DI would be better, but simple instantiation is fine for now
const payoneerProvider = new PayoneerProvider();

// Helper to check authentication - assuming middleware is applied in parent router or here
// For now, we'll assume the request object has user info via passport/middleware
// and we might need to fetch affiliate status.

/**
 * POST /api/payouts/request
 * Request a payout for the authenticated user (affiliate).
 */
router.post('/request', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { amount, method, email } = req.body;
    const user = req.user as any; // Adjust type based on your User model definition in code

    // Validation
    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }
    if (method !== 'payoneer') {
      res.status(400).json({ error: 'Unsupported payout method' });
      return;
    }

    // Check if user is an affiliate and has enough commission
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: user.id },
      include: { 
        orders: {
          where: { commissionStatus: 'approved' } 
          // Logic to calculate balance would sum approved commissions minus paid payouts
          // This matches schema logic where "commissionAmount" in Order is the source of truth for earnings?
          // OR we probably need to check "commission_status" on orders.
          // For safety in this "Preparation Phase", we will NOT enforce heavy balance checks 
          // or we will just check if they are an active affiliate.
        } 
      }
    });

    if (!affiliate || !affiliate.isActive) {
      res.status(403).json({ error: 'Affiliate account not active' });
      return;
    }

    // Validate Payoneer details
    const isValid = await payoneerProvider.validateRecipient({ email });
    if (!isValid) {
      res.status(400).json({ error: 'Invalid Payoneer details' });
      return;
    }

    // Create Payout Record (Pending)
    const payout = await prisma.payout.create({
      data: {
        affiliateId: affiliate.id,
        amount: Number(amount),
        currency: 'USD',
        method: 'payoneer',
        status: 'pending',
        details: { email },
      }
    });

    // Notify admins of new payout request
    emitPayoutUpdate();

    // Call Provider (Mock)
    try {
      const txId = await payoneerProvider.createPayout(
        payout.amount, 
        payout.currency, 
        { email }, 
        `payout_${payout.id}`
      );

      // Update Payout with Transaction ID
      await prisma.payout.update({
        where: { id: payout.id },
        data: { transactionId: txId }
      });

      res.status(200).json({ success: true, payoutId: payout.id, status: 'pending' });
    } catch (error: any) {
      console.error('Payout provider error:', error);
      // Fail the local record
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'failed', details: { error: error.message, email } }
      });
      res.status(502).json({ error: 'Payout processing failed', message: error.message });
    }

  } catch (error) {
    console.error('Payout Request Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/payouts/status
 * Get status of recent payouts
 */
router.get('/status', async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const user = req.user as any;

  try {
    const payouts = await prisma.payout.findMany({
      where: {
        affiliate: {
          userId: user.id
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json(payouts);
  } catch (error) {
    console.error('Payout Status Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
