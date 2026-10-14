-- ═══════════════════════════════════════════════════════════════
--  Alpha App — Neon PostgreSQL Schema
--  الصق هذا في Neon SQL Editor لإنشاء الجداول يدوياً (اختياري)
--  الكود يُنشئها تلقائياً عند أول طلب — هذا الملف للمرجع فقط
-- ═══════════════════════════════════════════════════════════════

-- ── users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  tg_id          BIGINT       NOT NULL PRIMARY KEY,
  tg_data        TEXT         DEFAULT NULL,
  wallet_current TEXT         DEFAULT NULL,
  wallet_history TEXT         DEFAULT NULL,
  settings       TEXT         DEFAULT '{"background":0,"ai_search":0,"deriv_paths":0,"auto_withdraw":0,"notification":0,"depth":"normal","lang":"en","theme":"black"}',
  boost_data     TEXT         DEFAULT '{"count":0,"end_ts":null,"running":false}',
  dash_data      TEXT         DEFAULT '{"all_time":0,"last30":0,"coins":{},"pending_val":0,"pending_found":0}',
  archive        TEXT         DEFAULT NULL,
  plan_level     SMALLINT     NOT NULL DEFAULT 0,
  fndwlet        TEXT         DEFAULT NULL,
  splash_done    SMALLINT     NOT NULL DEFAULT 0,
  work_data      TEXT         DEFAULT NULL,
  scan_state     TEXT         DEFAULT NULL,
  jumps_key      VARCHAR(100) DEFAULT NULL,
  toast_key      VARCHAR(100) DEFAULT NULL,
  getted_save    TEXT         DEFAULT NULL,
  msg_key        TEXT         DEFAULT NULL,
  trial_count    INTEGER      NOT NULL DEFAULT 0,
  first_seen     TIMESTAMP    NOT NULL DEFAULT NOW(),
  last_seen      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── jumps ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jumps (
  id      SERIAL PRIMARY KEY,
  title   VARCHAR(50)  NOT NULL DEFAULT '0',
  title2  VARCHAR(255) NOT NULL DEFAULT '',
  title3  VARCHAR(255) NOT NULL DEFAULT '',
  title4  VARCHAR(255) NOT NULL DEFAULT '',
  title5  VARCHAR(100) NOT NULL DEFAULT '',
  active  SMALLINT     NOT NULL DEFAULT 1
);

-- ── bans ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bans (
  id        SERIAL PRIMARY KEY,
  tg_id     BIGINT       DEFAULT NULL,
  type      VARCHAR(10)  NOT NULL CHECK (type IN ('ip','tg_id')),
  value     VARCHAR(200) NOT NULL,
  reason    VARCHAR(255) DEFAULT NULL,
  banned_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (type, value)
);

-- ── purchased ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchased (
  id            SERIAL PRIMARY KEY,
  tg_id         BIGINT      NOT NULL,
  info          TEXT        DEFAULT NULL,
  plan_level    SMALLINT    NOT NULL DEFAULT 0,
  upgrade_level SMALLINT    NOT NULL DEFAULT 0,
  coin          VARCHAR(20) NOT NULL DEFAULT '',
  price         VARCHAR(50) NOT NULL DEFAULT '',
  last_seen     TIMESTAMP   NOT NULL DEFAULT NOW(),
  work_now      VARCHAR(10) NOT NULL DEFAULT 'OFF',
  booster       INTEGER     NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_purchased_tg_id ON purchased(tg_id);

-- ── getted ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS getted (
  id      SERIAL PRIMARY KEY,
  checked INTEGER      NOT NULL DEFAULT 0,
  coin    VARCHAR(20)  NOT NULL DEFAULT 'BTC',
  price   VARCHAR(100) NOT NULL DEFAULT '',
  walet   VARCHAR(255) DEFAULT NULL,
  key     VARCHAR(50)  NOT NULL DEFAULT 'lt1',
  level   SMALLINT     NOT NULL DEFAULT 0,
  active  SMALLINT     NOT NULL DEFAULT 1,
  UNIQUE (key)
);

-- ── coingecko ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coingecko (
  coin_id    VARCHAR(50)   NOT NULL PRIMARY KEY,
  symbol     VARCHAR(10)   NOT NULL DEFAULT '',
  price_usd  DECIMAL(20,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ── settings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   VARCHAR(100) NOT NULL PRIMARY KEY,
  value TEXT         DEFAULT NULL,
  level INTEGER      NOT NULL DEFAULT 0,
  tag   VARCHAR(100) NOT NULL DEFAULT ''
);

-- ── message ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message (
  id       SERIAL PRIMARY KEY,
  count    INTEGER      NOT NULL DEFAULT 0,
  "MsgBox" TEXT         DEFAULT NULL,
  "Key"    VARCHAR(100) NOT NULL DEFAULT '',
  level    SMALLINT     NOT NULL DEFAULT 0,
  active   SMALLINT     NOT NULL DEFAULT 1,
  UNIQUE ("Key")
);

-- ── Default Data ─────────────────────────────────────────────────
INSERT INTO settings (key, value, level, tag) VALUES ('online_count', '567',     0, '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value, level, tag) VALUES ('promo_code',   '1579530', 0, '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value, level, tag) VALUES ('toast_dialog', '',        3, '') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value, level, tag) VALUES ('max_trials',   '1000',    0, '') ON CONFLICT (key) DO NOTHING;

INSERT INTO message (count, "MsgBox", "Key", level, active)
VALUES (4000, '🎉 You are doing great! Keep scanning to find more wallets.', 'ky1', 0, 1)
ON CONFLICT ("Key") DO NOTHING;

INSERT INTO getted (checked, coin, price, walet, key, active)
VALUES (4000, 'LTC', '7.66 = $428.19', NULL, 'lt1', 1)
ON CONFLICT (key) DO NOTHING;

INSERT INTO coingecko (coin_id, symbol, price_usd) VALUES
  ('bitcoin',     'BTC',  0), ('ethereum',    'ETH',  0),
  ('binancecoin', 'BNB',  0), ('tether',      'USDT', 0),
  ('tron',        'TRX',  0), ('litecoin',    'LTC',  0),
  ('solana',      'SOL',  0), ('ripple',      'XRP',  0),
  ('dogecoin',    'DOGE', 0), ('toncoin',     'TON',  0)
ON CONFLICT (coin_id) DO NOTHING;
