import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_CONFIG, DB_CONFIG } from '../server/db';

test('TiDB Cloud database configuration has proper SSL and host', () => {
  assert.equal(DB_CONFIG.host, 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
  assert.equal(DB_CONFIG.user, '33NZV583e1gPsMh.root');
  assert.equal(DB_CONFIG.database, 'test');
  assert.equal(DB_CONFIG.port, 4000);
  assert.equal(DB_CONFIG.ssl?.rejectUnauthorized, true);
});

test('Cashfree credentials and environment are configured for production', () => {
  assert.equal(APP_CONFIG.cashfreeAppId, '1494190b594e98ed762a2a943320914941');
  assert.equal(APP_CONFIG.cashfreeSecretKey, 'cfsk_ma_prod_979295dd86c34ea7eef3d56c1e07d25e_27097462');
  assert.equal(APP_CONFIG.cashfreeEnv, 'PROD');
  assert.equal(APP_CONFIG.cashfreeApiUrl, 'https://api.cashfree.com/pg');
});

test('OneSignal Push Notifications credentials are valid', () => {
  assert.equal(APP_CONFIG.oneSignalAppId, '561bd59e-8355-47c8-88cc-0766688a105a');
  assert.match(APP_CONFIG.oneSignalApiKey, /^os_v2_app_/);
});
