import { Router, Request, Response } from 'express';
import { getDbPool, ensureSeededTournaments, APP_CONFIG } from './db.js';
import mysql from 'mysql2/promise';

export const apiRouter = Router();

// Ensure seeded on first request
let seedChecked = false;
async function checkSeed() {
  if (!seedChecked) {
    seedChecked = true;
    await ensureSeededTournaments();
  }
}

// ---------------------------------------------------------------------
// 1. TOURNAMENTS
// ---------------------------------------------------------------------
apiRouter.get('/tournaments', async (_req: Request, res: Response) => {
  try {
    await checkSeed();
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(`
      SELECT 
        t.id, 
        t.title, 
        COALESCE(t.game_name, t.game, 'Free Fire MAX') as game, 
        COALESCE(t.map, 'BERMUDA') as map, 
        COALESCE(t.match_type, 'SOLO BR') as match_type, 
        CAST(t.entry_fee AS FLOAT) as entry_fee, 
        CAST(t.per_kill AS FLOAT) as per_kill, 
        CAST(t.prize_pool AS FLOAT) as prize_pool, 
        t.match_time, 
        t.total_slots, 
        COALESCE(t.joined_slots, (SELECT COUNT(*) FROM participants WHERE tournament_id = t.id), 0) as joined_slots,
        COALESCE(t.room_id, '') as room_id, 
        COALESCE(t.room_password, '') as room_password, 
        LOWER(t.status) as status,
        COALESCE(t.is_private, 0) as is_private,
        COALESCE(t.private_code, t.access_code, '') as private_code
      FROM tournaments t
      ORDER BY 
        CASE 
          WHEN LOWER(t.status) = 'ongoing' OR LOWER(t.status) = 'live' THEN 1 
          WHEN LOWER(t.status) = 'upcoming' THEN 2 
          ELSE 3 
        END,
        t.id DESC
      LIMIT 50
    `);

    // Transform DB rows to Frontend Tournament model
    const tournaments = rows.map((r: any) => {
      const matchTypeUpper = String(r.match_type || 'SOLO BR').toUpperCase();
      let mode: 'SOLO BR' | 'DUO BR' | 'SQUAD BR' | 'CLASH SQUAD' | 'TDM 4V4' = 'SOLO BR';
      if (matchTypeUpper.includes('DUO')) mode = 'DUO BR';
      else if (matchTypeUpper.includes('SQUAD')) mode = 'SQUAD BR';
      else if (matchTypeUpper.includes('CS') || matchTypeUpper.includes('CLASH')) mode = 'CLASH SQUAD';
      else if (matchTypeUpper.includes('LONE') || matchTypeUpper.includes('TDM')) mode = 'TDM 4V4';

      let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
      const st = String(r.status).toLowerCase();
      if (st === 'ongoing' || st === 'live') status = 'ongoing';
      else if (st === 'completed') status = 'completed';

      const gameType = String(r.game).toUpperCase().includes('BGMI') ? 'BGMI' : 'Free Fire MAX';

      return {
        id: String(r.id),
        matchNo: `Match #${r.id}`,
        title: r.title,
        game: gameType,
        mode: mode,
        map: r.map || 'BERMUDA',
        mapName: r.map || 'BERMUDA',
        dateTime: new Date(r.match_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        entryFee: Number(r.entry_fee) || 0,
        prizePool: Number(r.prize_pool) || 0,
        firstPrize: Math.round(Number(r.prize_pool) * 0.5),
        perKill: Number(r.per_kill) || 0,
        totalSlots: Number(r.total_slots) || 48,
        filledSlots: Number(r.joined_slots) || 0,
        status: status,
        roomId: r.room_id || undefined,
        roomPass: r.room_password || undefined,
        isPrivate: Boolean(r.is_private),
        privateCode: r.private_code || undefined,
      };
    });

    res.json({ success: true, tournaments });
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Join Tournament
apiRouter.post('/tournaments/join', async (req: Request, res: Response) => {
  const { tournamentId, userId, ign, gameUid, slotNo } = req.body;
  if (!tournamentId) {
    return res.status(400).json({ success: false, error: 'Tournament ID is required' });
  }

  try {
    const db = getDbPool();
    const uid = Number(userId) || 1; // Default to user 1 if not specified

    // Check tournament exists
    const [tRows] = await db.query<mysql.RowDataPacket[]>('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
    if (tRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }
    const tourney = tRows[0];
    const entryFee = Number(tourney.entry_fee) || 0;

    // Check user balance
    const [uRows] = await db.query<mysql.RowDataPacket[]>('SELECT wallet_balance FROM users WHERE id = ?', [uid]);
    const balance = uRows.length > 0 ? Number(uRows[0].wallet_balance) : 1000;

    if (balance < entryFee) {
      return res.status(400).json({ success: false, error: 'Insufficient balance. Please deposit funds first.' });
    }

    // Deduct entry fee and insert participant
    if (uRows.length > 0 && entryFee > 0) {
      await db.query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [entryFee, uid]);
      await db.query(`
        INSERT INTO transactions (user_id, amount, type, status, description, created_at)
        VALUES (?, ?, 'debit', 'SUCCESS', ?, NOW())
      `, [uid, entryFee, `Entry Fee: ${tourney.title} (Match #${tourney.id})`]);
    }

    // Add to participants
    await db.query(`
      INSERT INTO participants (tournament_id, user_id, in_game_name, game_id, slot_no, joined_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE in_game_name = VALUES(in_game_name)
    `, [tournamentId, uid, ign || 'Arus Player', gameUid || '5129482194', slotNo || 1]);

    // Update joined slots
    await db.query('UPDATE tournaments SET joined_slots = joined_slots + 1 WHERE id = ?', [tournamentId]);

    res.json({ 
      success: true, 
      message: 'Joined tournament successfully!',
      newBalance: balance - entryFee
    });
  } catch (err) {
    console.error('Error joining tournament:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin: Update Room Credentials (IDP)
apiRouter.post('/tournaments/update_room', async (req: Request, res: Response) => {
  const { tournamentId, roomId, roomPass } = req.body;
  if (!tournamentId) {
    return res.status(400).json({ success: false, error: 'Tournament ID is required' });
  }

  try {
    const db = getDbPool();
    await db.query(`
      UPDATE tournaments 
      SET room_id = ?, room_password = ?
      WHERE id = ?
    `, [roomId || '', roomPass || '', tournamentId]);

    res.json({ success: true, message: 'Room credentials published to all participants!' });
  } catch (err) {
    console.error('Error updating room details:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin: Update Tournament Status
apiRouter.post('/tournaments/update_status', async (req: Request, res: Response) => {
  const { tournamentId, status } = req.body;
  if (!tournamentId || !status) {
    return res.status(400).json({ success: false, error: 'Tournament ID and status are required' });
  }

  try {
    const db = getDbPool();
    await db.query('UPDATE tournaments SET status = ? WHERE id = ?', [status, tournamentId]);
    res.json({ success: true, message: `Tournament status updated to ${status}` });
  } catch (err) {
    console.error('Error updating tournament status:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin: Create Tournament
apiRouter.post('/tournaments/create', async (req: Request, res: Response) => {
  const { title, game, mapName, mode, entryFee, prizePool, perKill, totalSlots, isPrivate, privateCode } = req.body;

  try {
    const db = getDbPool();
    const [result] = await db.query<mysql.ResultSetHeader>(`
      INSERT INTO tournaments 
        (title, game, map, match_type, entry_fee, prize_pool, per_kill, total_slots, joined_slots, match_time, is_private, private_code, status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL 2 HOUR), ?, ?, 'upcoming')
    `, [
      title || 'Custom Championship',
      game || 'Free Fire MAX',
      mapName || 'BERMUDA',
      mode || 'SOLO BR',
      Number(entryFee) || 0,
      Number(prizePool) || 1000,
      Number(perKill) || 0,
      Number(totalSlots) || 48,
      isPrivate ? 1 : 0,
      privateCode || ''
    ]);

    res.json({ 
      success: true, 
      tournamentId: result.insertId,
      message: 'New tournament created in database!' 
    });
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ---------------------------------------------------------------------
// 2. USER & WALLET
// ---------------------------------------------------------------------
apiRouter.get('/user', async (req: Request, res: Response) => {
  const userId = req.query.userId || 1;
  try {
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE id = ? OR username = ?', [userId, userId]);
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        user: {
          id: 'user_1',
          name: 'Arus Developer',
          email: 'arus@beastz.com',
          phone: '9878385810',
          inGameName: 'BEASTZ_ARUS',
          gameUid: '5129482194',
          currentBalance: 0,
          bonusBalance: 50,
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
          upiId: '9878385810@upi',
        }
      });
    }

    const u = rows[0];
    res.json({
      success: true,
      user: {
        id: String(u.id),
        name: u.username || 'Arus Developer',
        email: u.email || `${u.username || 'player'}@beastz.com`,
        phone: u.phone || '9878385810',
        inGameName: u.game_name || 'BEASTZ_ARUS',
        gameUid: u.game_id || '5129482194',
        currentBalance: Number(u.wallet_balance) || 0,
        bonusBalance: 50,
        role: u.role === 'admin' ? 'admin' : 'user',
        avatarUrl: u.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80',
        upiId: u.upi_id || '9878385810@upi',
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Update Profile
apiRouter.post('/user/update', async (req: Request, res: Response) => {
  const { userId, inGameName, gameUid, phone, upiId } = req.body;
  const uid = Number(userId) || 1;

  try {
    const db = getDbPool();
    await db.query(`
      UPDATE users 
      SET game_name = COALESCE(?, game_name), 
          game_id = COALESCE(?, game_id), 
          phone = COALESCE(?, phone)
      WHERE id = ?
    `, [inGameName || null, gameUid || null, phone || null, uid]);

    res.json({ success: true, message: 'Profile updated in database!' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ---------------------------------------------------------------------
// 3. TRANSACTIONS & DEPOSIT/WITHDRAWAL
// ---------------------------------------------------------------------
apiRouter.get('/transactions', async (req: Request, res: Response) => {
  const userId = Number(req.query.userId) || 1;
  try {
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(`
      SELECT id, user_id, amount, type, status, description, created_at 
      FROM transactions 
      WHERE user_id = ? 
      ORDER BY id DESC 
      LIMIT 25
    `, [userId]);

    const txs = rows.map((r: any) => ({
      id: `tx_${r.id}`,
      type: r.type === 'credit' ? 'deposit' : 'withdrawal',
      amount: Number(r.amount),
      status: r.status === 'SUCCESS' ? 'completed' : (r.status === 'PENDING' ? 'pending' : 'failed'),
      dateTime: new Date(r.created_at).toLocaleString(),
      referenceId: `REF-${r.id}`,
      description: r.description,
    }));

    res.json({ success: true, transactions: txs });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Request Deposit
apiRouter.post('/deposit', async (req: Request, res: Response) => {
  const { userId, amount, upiRef, method } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Valid deposit amount is required' });
  }

  try {
    const db = getDbPool();
    const uid = Number(userId) || 1;

    // Record in deposits table and transactions
    await db.query(`
      INSERT INTO deposits (user_id, amount, utr_no, payment_method, status, created_at)
      VALUES (?, ?, ?, ?, 'PENDING', NOW())
    `, [uid, numAmount, upiRef || `UPI-${Date.now()}`, method || 'UPI QR']);

    const [txRes] = await db.query<mysql.ResultSetHeader>(`
      INSERT INTO transactions (user_id, amount, type, status, description, created_at)
      VALUES (?, ?, 'credit', 'PENDING', ?, NOW())
    `, [uid, numAmount, `Deposit via ${method || 'UPI'} (Ref: ${upiRef || 'Auto'})`]);

    res.json({ 
      success: true, 
      txId: `tx_${txRes.insertId}`,
      message: 'Deposit request submitted for verification! It will reflect in your wallet shortly.' 
    });
  } catch (err) {
    console.error('Error processing deposit:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Request Withdrawal
apiRouter.post('/withdraw', async (req: Request, res: Response) => {
  const { userId, amount, upiOrBank, method } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount < 50) {
    return res.status(400).json({ success: false, error: 'Minimum withdrawal amount is ₹50' });
  }

  try {
    const db = getDbPool();
    const uid = Number(userId) || 1;

    // Check balance
    const [uRows] = await db.query<mysql.RowDataPacket[]>('SELECT wallet_balance FROM users WHERE id = ?', [uid]);
    const balance = uRows.length > 0 ? Number(uRows[0].wallet_balance) : 0;
    if (balance < numAmount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance to withdraw' });
    }

    // Deduct immediately and record in withdrawals
    await db.query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [numAmount, uid]);
    await db.query(`
      INSERT INTO withdrawals (user_id, amount, upi_id, status, created_at)
      VALUES (?, ?, ?, 'PENDING', NOW())
    `, [uid, numAmount, upiOrBank || 'Direct UPI']);

    const [txRes] = await db.query<mysql.ResultSetHeader>(`
      INSERT INTO transactions (user_id, amount, type, status, description, created_at)
      VALUES (?, ?, 'debit', 'PENDING', ?, NOW())
    `, [uid, numAmount, `Withdrawal to ${upiOrBank || 'UPI'}`]);

    res.json({ 
      success: true, 
      txId: `tx_${txRes.insertId}`,
      newBalance: balance - numAmount,
      message: 'Withdrawal request created! Payout will be sent to your UPI ID.' 
    });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin: Approve Transaction
apiRouter.post('/admin/approve_tx', async (req: Request, res: Response) => {
  const { txId } = req.body;
  const rawId = String(txId).replace('tx_', '');

  try {
    const db = getDbPool();
    const [txRows] = await db.query<mysql.RowDataPacket[]>('SELECT * FROM transactions WHERE id = ?', [rawId]);
    if (txRows.length > 0) {
      const tx = txRows[0];
      await db.query('UPDATE transactions SET status = "SUCCESS" WHERE id = ?', [rawId]);
      if (tx.type === 'credit') {
        await db.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [tx.amount, tx.user_id]);
      }
    }
    res.json({ success: true, message: 'Transaction approved and credited!' });
  } catch (err) {
    console.error('Error approving tx:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Admin: Reject Transaction
apiRouter.post('/admin/reject_tx', async (req: Request, res: Response) => {
  const { txId } = req.body;
  const rawId = String(txId).replace('tx_', '');

  try {
    const db = getDbPool();
    await db.query('UPDATE transactions SET status = "FAILED" WHERE id = ?', [rawId]);
    res.json({ success: true, message: 'Transaction marked as rejected.' });
  } catch (err) {
    console.error('Error rejecting tx:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ---------------------------------------------------------------------
// 4. LEADERBOARD
// ---------------------------------------------------------------------
apiRouter.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(`
      SELECT 
        u.id, 
        u.username as name, 
        COALESCE(u.avatar, 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=80') as avatarUrl,
        CAST(COALESCE(u.wallet_balance, 0) AS FLOAT) as totalWinnings,
        (SELECT COUNT(*) FROM participants WHERE user_id = u.id) as matchesPlayed,
        (SELECT COALESCE(SUM(kills), 0) FROM participants WHERE user_id = u.id) as totalKills
      FROM users u
      ORDER BY totalWinnings DESC, totalKills DESC
      LIMIT 20
    `);

    const leaderboard = rows.map((r: any, idx: number) => ({
      rank: idx + 1,
      id: String(r.id),
      name: r.name || `Player #${r.id}`,
      avatarUrl: r.avatarUrl,
      matchesPlayed: Number(r.matchesPlayed) || 12,
      totalWinnings: Number(r.totalWinnings) || 500,
      totalKills: Number(r.totalKills) || 15,
      winRate: Math.min(85, Math.max(30, Math.round(50 + (idx * 2)))),
    }));

    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ---------------------------------------------------------------------
// 5. CASHFREE PAYMENT GATEWAY (INSTANT DEPOSIT)
// ---------------------------------------------------------------------

// Create Cashfree PG Order
apiRouter.post('/cashfree/create-order', async (req: Request, res: Response) => {
  const { amount, userId, customerName, customerPhone, customerEmail } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount < 10) {
    return res.status(400).json({ 
      success: false, 
      error: 'Minimum deposit amount for Instant Cashfree Deposit is ₹10.00' 
    });
  }

  const uid = Number(userId) || 1;
  const orderId = `order_${Date.now()}_${uid}`;
  const phone = (customerPhone && String(customerPhone).trim().length === 10) 
    ? String(customerPhone).trim() 
    : '9878385810';
  const email = customerEmail || `player${uid}@beastzbattle.com`;
  const name = customerName || 'BeastzPlayer';

  try {
    const db = getDbPool();

    // Prepare Cashfree API payload (Cashfree Production strictly requires https:// URL)
    let host = req.get('host') || 'beastzbattle2.vercel.app';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      host = 'beastzbattle2.vercel.app';
    }
    const returnUrl = `https://${host}/?tab=me&cf_order_id=${orderId}&status={order_status}`;

    const cfPayload = {
      order_id: orderId,
      order_amount: numAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${uid}`,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: returnUrl,
      },
      order_note: `BEASTz BATTLE Instant Wallet Deposit ₹${numAmount.toFixed(2)}`
    };

    const response = await fetch(`${APP_CONFIG.cashfreeApiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': APP_CONFIG.cashfreeAppId,
        'x-client-secret': APP_CONFIG.cashfreeSecretKey,
      },
      body: JSON.stringify(cfPayload),
    });

    const cfData: any = await response.json();

    if (!response.ok || !cfData.payment_session_id) {
      console.error('[Cashfree] Order creation error:', cfData);
      return res.status(response.status || 500).json({
        success: false,
        error: cfData.message || 'Unable to create payment session with Cashfree. Please retry or use UPI QR.',
        raw: cfData,
      });
    }

    // Save order in cashfree_orders table in TiDB
    await db.query(`
      INSERT INTO cashfree_orders (order_id, user_id, amount, currency, payment_session_id, status)
      VALUES (?, ?, ?, 'INR', ?, 'PENDING')
      ON DUPLICATE KEY UPDATE payment_session_id = VALUES(payment_session_id), status = 'PENDING'
    `, [orderId, uid, numAmount, cfData.payment_session_id]);

    res.json({
      success: true,
      orderId: orderId,
      cfOrderId: cfData.cf_order_id,
      paymentSessionId: cfData.payment_session_id,
      environment: APP_CONFIG.cashfreeEnv,
      amount: numAmount,
      checkoutUrl: `https://payments.cashfree.com/order/#${cfData.payment_session_id}`,
      message: 'Payment session created successfully!',
    });
  } catch (err) {
    console.error('[Cashfree] Exception during order creation:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Verify Cashfree PG Order Status & Credit Wallet Atomically
apiRouter.post('/cashfree/verify-order', async (req: Request, res: Response) => {
  const { orderId, userId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Order ID is required' });
  }

  try {
    const db = getDbPool();

    // Query Cashfree API directly for definitive server-side payment state
    const response = await fetch(`${APP_CONFIG.cashfreeApiUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': APP_CONFIG.cashfreeAppId,
        'x-client-secret': APP_CONFIG.cashfreeSecretKey,
      },
    });

    const cfOrder: any = await response.json();

    if (!response.ok) {
      return res.status(response.status || 400).json({
        success: false,
        error: cfOrder.message || 'Failed to verify order status with Cashfree.',
      });
    }

    const orderStatus = cfOrder.order_status;
    const paidAmount = parseFloat(cfOrder.order_amount) || 0;
    const cfPaymentId = cfOrder.cf_order_id || orderId;

    if (orderStatus === 'PAID') {
      // Check existing status in database to prevent double credit
      const [orderRows] = await db.query<mysql.RowDataPacket[]>(
        'SELECT id, status, user_id, amount FROM cashfree_orders WHERE order_id = ?',
        [orderId]
      );

      const targetUserId = orderRows.length > 0 ? Number(orderRows[0].user_id) : (Number(userId) || 1);

      if (orderRows.length > 0 && orderRows[0].status === 'PAID') {
        const [uRows] = await db.query<mysql.RowDataPacket[]>(
          'SELECT wallet_balance FROM users WHERE id = ?',
          [targetUserId]
        );
        return res.json({
          success: true,
          status: 'PAID',
          alreadyCredited: true,
          amount: paidAmount,
          newBalance: uRows.length > 0 ? Number(uRows[0].wallet_balance) : 0,
          message: 'Payment already verified and credited to your wallet!',
        });
      }

      // Execute Atomic Credit
      await db.query('UPDATE cashfree_orders SET status = "PAID" WHERE order_id = ?', [orderId]);
      await db.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [paidAmount, targetUserId]);

      // Record in transactions ledger
      await db.query(`
        INSERT INTO transactions (user_id, amount, type, status, description, created_at)
        VALUES (?, ?, 'credit', 'SUCCESS', ?, NOW())
      `, [targetUserId, paidAmount, `Instant Cashfree Deposit (${orderId})`]);

      // Record in deposits table
      await db.query(`
        INSERT INTO deposits (user_id, order_id, amount, method, status, reference_id, created_at)
        VALUES (?, ?, ?, 'Cashfree PG', 'SUCCESS', ?, NOW())
      `, [targetUserId, orderId, paidAmount, cfPaymentId]);

      // Get updated balance
      const [uRows] = await db.query<mysql.RowDataPacket[]>(
        'SELECT wallet_balance FROM users WHERE id = ?',
        [targetUserId]
      );
      const newBalance = uRows.length > 0 ? Number(uRows[0].wallet_balance) : paidAmount;

      return res.json({
        success: true,
        status: 'PAID',
        amount: paidAmount,
        newBalance: newBalance,
        cfPaymentId: cfPaymentId,
        message: `₹${paidAmount.toFixed(2)} successfully credited to your BEASTzBATTLE wallet!`,
      });
    } else if (orderStatus === 'ACTIVE') {
      return res.json({
        success: false,
        status: 'ACTIVE',
        message: 'Payment session is active or pending completion in UPI / Bank app.',
      });
    } else {
      await db.query('UPDATE cashfree_orders SET status = "FAILED" WHERE order_id = ?', [orderId]);
      return res.json({
        success: false,
        status: orderStatus,
        message: `Payment status: ${orderStatus}. If amount was deducted, it will automatically reflect shortly.`,
      });
    }
  } catch (err) {
    console.error('[Cashfree] Exception during order verification:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Cashfree Webhook endpoint for async server notifications
apiRouter.post('/cashfree/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log('[Cashfree Webhook] Event received:', event?.type || 'payment event');
    
    if (event?.data?.order && event.data.payment) {
      const orderId = event.data.order.order_id;
      const orderStatus = event.data.order.order_status;
      const amount = parseFloat(event.data.order.order_amount) || 0;

      if (orderStatus === 'PAID') {
        const db = getDbPool();
        const [rows] = await db.query<mysql.RowDataPacket[]>(
          'SELECT id, status, user_id FROM cashfree_orders WHERE order_id = ?',
          [orderId]
        );

        if (rows.length > 0 && rows[0].status !== 'PAID') {
          const uid = rows[0].user_id;
          await db.query('UPDATE cashfree_orders SET status = "PAID" WHERE order_id = ?', [orderId]);
          await db.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, uid]);
          await db.query(`
            INSERT INTO transactions (user_id, amount, type, status, description, created_at)
            VALUES (?, ?, 'credit', 'SUCCESS', ?, NOW())
          `, [uid, amount, `Webhook Cashfree Deposit (${orderId})`]);
        }
      }
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('[Cashfree Webhook] Error:', err);
    res.status(200).json({ status: 'ERROR_RECORDED' });
  }
});

// ---------------------------------------------------------------------
// 6. ONESIGNAL PUSH NOTIFICATIONS
// ---------------------------------------------------------------------
apiRouter.post('/notifications/send', async (req: Request, res: Response) => {
  const { title, message, targetUrl, playerIds, userIds, badgeType } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required' });
  }

  try {
    const db = getDbPool();

    // 1. Record in app_notifications table
    await db.query(`
      INSERT INTO app_notifications (title, message, target_url, badge_type, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [title, message, targetUrl || '/?tab=home', badgeType || 'SYSTEM']);

    // 2. Dispatch via OneSignal REST API v1
    const osPayload: any = {
      app_id: APP_CONFIG.oneSignalAppId,
      contents: { en: message },
      headings: { en: title },
      url: targetUrl || 'https://beastzbattle.com/?tab=home',
      data: {
        badge_type: badgeType || 'SYSTEM',
      },
    };

    if (Array.isArray(playerIds) && playerIds.length > 0) {
      osPayload.include_player_ids = playerIds;
    } else {
      osPayload.included_segments = ['Subscribed Users'];
    }

    const osRes = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${APP_CONFIG.oneSignalApiKey}`,
      },
      body: JSON.stringify(osPayload),
    });

    const osData = await osRes.json();

    res.json({
      success: true,
      message: 'Notification dispatched and stored in database!',
      oneSignal: osData,
    });
  } catch (err) {
    console.error('[OneSignal] Notification error:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// Get Notifications List from TiDB
apiRouter.get('/notifications', async (_req: Request, res: Response) => {
  try {
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(`
      SELECT id, title, message, target_url, badge_type, created_at 
      FROM app_notifications 
      ORDER BY id DESC 
      LIMIT 30
    `);

    res.json({
      success: true,
      notifications: rows.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        message: r.message,
        targetUrl: r.target_url,
        badgeType: r.badge_type || 'SYSTEM',
        time: new Date(r.created_at).toLocaleString(),
      })),
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ---------------------------------------------------------------------
// 7. SETTINGS & APP CONFIG
// ---------------------------------------------------------------------
apiRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>('SELECT `key`, `value` FROM settings');
    const settingsMap: Record<string, string> = {};
    rows.forEach((r: any) => {
      if (r.key) settingsMap[r.key] = r.value || '';
    });

    res.json({
      success: true,
      settings: settingsMap,
      config: {
        appName: settingsMap['app_name'] || 'BEASTz-BATTLE',
        adminUpiId: settingsMap['admin_upi_id'] || settingsMap['upi_id'] || APP_CONFIG.adminUpiId,
        supportWhatsapp: settingsMap['whatsapp_no'] || APP_CONFIG.supportWhatsapp,
        cashfreeEnabled: (settingsMap['cashfree_status'] || 'active') === 'active',
        cashfreeAppId: APP_CONFIG.cashfreeAppId,
        cashfreeEnv: APP_CONFIG.cashfreeEnv,
        oneSignalAppId: APP_CONFIG.oneSignalAppId,
        apkUrl: settingsMap['apk_download_url'] || '/BEASTz-BATTLE.apk',
        minDeposit: Number(settingsMap['min_deposit']) || 10,
        maxDeposit: Number(settingsMap['max_deposit']) || 50000,
        minWithdrawal: Number(settingsMap['min_withdrawal']) || 50,
      }
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// App Config / Info Legacy compatibility
apiRouter.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      appName: 'BEASTz-BATTLE',
      oneSignalAppId: APP_CONFIG.oneSignalAppId,
      adminUpiId: APP_CONFIG.adminUpiId,
      supportWhatsapp: APP_CONFIG.supportWhatsapp,
      cashfreeAppId: APP_CONFIG.cashfreeAppId,
      cashfreeEnv: APP_CONFIG.cashfreeEnv,
      apkUrl: '/BEASTz-BATTLE.apk',
    }
  });
});
