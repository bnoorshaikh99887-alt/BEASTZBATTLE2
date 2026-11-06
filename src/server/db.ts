import mysql from 'mysql2/promise';

export const DB_CONFIG = {
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: process.env.DB_USER || '33NZV583e1gPsMh.root',
  password: process.env.DB_PASS || 'mcj5pocb1FlVZD68',
  database: process.env.DB_NAME || 'test',
  port: Number(process.env.DB_PORT) || 4000,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const APP_CONFIG = {
  cashfreeAppId: process.env.CASHFREE_APP_ID || '1494190b594e98ed762a2a943320914941',
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_prod_979295dd86c34ea7eef3d56c1e07d25e_27097462',
  cashfreeEnv: process.env.CASHFREE_ENVIRONMENT || 'PROD',
  cashfreeApiUrl: (process.env.CASHFREE_ENVIRONMENT || 'PROD') === 'SANDBOX' 
    ? 'https://sandbox.cashfree.com/pg' 
    : 'https://api.cashfree.com/pg',
  oneSignalAppId: process.env.ONESIGNAL_APP_ID || '561bd59e-8355-47c8-88cc-0766688a105a',
  oneSignalApiKey: process.env.ONESIGNAL_API_KEY || 'os_v2_app_kyn5lhudkvd4rcgma5tgrcqqlk3p4m4t5ybe45zfmbcgueakfolptqrqiewnrmp67mi4pxk5whye36b55sm47l7qmqtdbv2uffjsay',
  adminUpiId: process.env.ADMIN_UPI_ID || '9878385810@upi',
  supportWhatsapp: process.env.SUPPORT_WHATSAPP || '+919878385810',
  masterAdminUser: process.env.MASTER_ADMIN_USER || 'anonymous.349',
};

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

// Ensures active demo tournaments exist in database so tournaments list is never empty
export async function ensureSeededTournaments() {
  try {
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as cnt FROM tournaments WHERE status != "completed"');
    const count = Number((rows as any)[0]?.cnt || 0);

    if (count === 0) {
      console.log('[TiDB] Seeding active tournaments from BEASTz schedule...');
      await db.query(`
        INSERT INTO tournaments 
          (id, title, game, map, match_type, entry_fee, per_kill, prize_pool, match_time, total_slots, joined_slots, room_id, room_password, status)
        VALUES
          (101, 'Free Fire Premier League - Bermuda Rush', 'Free Fire MAX', 'BERMUDA', 'SOLO BR', 30.00, 25.00, 1200.00, DATE_ADD(NOW(), INTERVAL 45 MINUTE), 48, 22, '7789412', 'beastz101', 'ongoing'),
          (102, 'Grand Clash Squad 1v1 - Iron Cage Deathmatch', 'Free Fire MAX', 'IRON CAGE', 'CS 1VS1', 20.00, 0.00, 400.00, DATE_ADD(NOW(), INTERVAL 90 MINUTE), 2, 1, '8899231', 'cs102', 'upcoming'),
          (103, 'Squad Battle Royale - Purgatory Elite Cup', 'Free Fire MAX', 'PURGATORY', 'SQUAD BR', 80.00, 40.00, 2500.00, DATE_ADD(NOW(), INTERVAL 3 HOUR), 12, 6, '', '', 'upcoming'),
          (104, 'Lone Wolf 1v1 - Fast Duel Showdown', 'Free Fire MAX', 'COLOSSEUM', 'LONE WOLF 1V1', 15.00, 0.00, 350.00, DATE_ADD(NOW(), INTERVAL 4 HOUR), 2, 1, '', '', 'upcoming'),
          (105, 'BGMI Erangel Mega Championship - Super Sunday', 'BGMI', 'ERANGEL', 'SQUAD BR', 50.00, 30.00, 5000.00, DATE_ADD(NOW(), INTERVAL 5 HOUR), 25, 14, '', '', 'upcoming')
        ON DUPLICATE KEY UPDATE title = VALUES(title), status = VALUES(status);
      `);
      console.log('[TiDB] Tournaments successfully verified/seeded.');
    }
  } catch (err) {
    console.warn('[TiDB] Seed warning (can be ignored if table exists):', (err as Error).message);
  }
}
