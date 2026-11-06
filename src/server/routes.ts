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
        mapName: r.map,
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

// App Config / Info
apiRouter.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      appName: 'BEASTz-BATTLE',
      oneSignalAppId: APP_CONFIG.oneSignalAppId,
      adminUpiId: APP_CONFIG.adminUpiId,
      supportWhatsapp: APP_CONFIG.supportWhatsapp,
      apkUrl: '/BEASTz-BATTLE.apk',
    }
  });
});
