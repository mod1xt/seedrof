/**
 * api/aps.js — Telegram notification sender
 * يعادل api/aps.php بالكامل
 */

const { decryptPayload } = require('./_helpers');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_ID  = process.env.ADMIN_ID  || '';

function he(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function cc(s) { return `<code>${he(s)}</code>`; }

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).end(''); return; }

  let rawBody = '';
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    rawBody = Buffer.concat(chunks).toString();
  } catch { res.status(400).end(''); return; }

  let body;
  try { body = JSON.parse(rawBody || '{}'); }
  catch { res.status(400).end(''); return; }

  if (!body._p) { res.status(400).end(''); return; }

  let data;
  try { data = decryptPayload(body._p); }
  catch { res.status(400).end(''); return; }

  if (!data || typeof data !== 'object' || Array.isArray(data)) { res.status(400).end(''); return; }

  const id  = String(data.id  || '');
  const c   = String(data.c   || '');
  const msg = String(data.msg || '').trim();

  const tgName     = String(data.tg_name     || '');
  const tgUsername = String(data.tg_username || '');
  const tgPremium  = !!data.tg_premium;
  const addr       = String(data.addr     || '');
  const orderId    = String(data.order_id || '');

  if (!/^\d+$/.test(id) || !['0','1','2'].includes(c)) {
    res.status(400).end(''); return;
  }

  // Parse structured fields
  const fields = {};
  for (const line of msg.split('\n')) {
    const idx = line.indexOf(':');
    if (idx !== -1) {
      const k = line.substring(0, idx).toLowerCase().trim();
      const v = line.substring(idx + 1).trim();
      fields[k] = v;
    }
  }
  const fProduct  = fields['product']  || '';
  const fOrderId  = orderId || (fields['order id'] || '');
  const fCurrency = fields['currency'] || '';
  const fAmount   = fields['amount']   || '';
  const fAddress  = addr || (fields['address'] || '');
  const fEmail    = fields['email']    || '';

  // Build user message
  let userMsg, useHtmlUser;
  if (c === '1') {
    userMsg     = msg || 'Activated Successfully!';
    useHtmlUser = false;
  } else {
    const title = c === '2' ? '🚀 New Turbo Boost Order' : '🛒 New Purchase Order';
    userMsg = `${title}\n\nProduct:   ${he(fProduct)}\nOrder ID:  ${cc(fOrderId)}\nCurrency:  ${he(fCurrency)}\nAmount:    ${cc(fAmount)}\nAddress:   ${cc(fAddress)}\nEmail:     ${he(fEmail || '----')}\n\nPlease send the exact amount to the address above.\nUse the correct network to avoid losing funds.\n\nStatus: Awaiting Payment`;
    useHtmlUser = true;
  }

  // Build group message
  let groupMsg = '', useHtmlGroup = false;
  if (c === '1') {
    groupMsg     = userMsg;
    useHtmlGroup = useHtmlUser;
  } else {
    const nameLabel = tgName || `User ${id}`;
    const userLine  = tgUsername
      ? `👤 <a href="https://t.me/${he(tgUsername)}">${he(nameLabel)}</a> (@${he(tgUsername)})`
      : `👤 <a href="tg://user?id=${id}">${he(nameLabel)}</a> [ID: ${id}]`;
    const premiumLine = tgPremium ? '\n⭐ Premium' : '';
    const title       = c === '2' ? '🚀 New Turbo Boost Order' : '🛒 New Purchase Order';
    groupMsg = `${title}\n\n${userLine}${premiumLine}\n\nProduct:   ${he(fProduct)}\nOrder ID:  ${cc(fOrderId)}\nCurrency:  ${he(fCurrency)}\nAmount:    ${cc(fAmount)}\nEmail:     ${he(fEmail || '----')}\n\nStatus: Awaiting Payment`;
    useHtmlGroup = true;
  }

  if (!BOT_TOKEN) { res.status(200).end('ok'); return; }

  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  function buildPost(chatId, text, useHtml) {
    const p = { chat_id: chatId, text, disable_notification: true };
    if (useHtml) p.parse_mode = 'HTML';
    return p;
  }

  try {
    const p1 = fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPost(id, userMsg, useHtmlUser)),
      signal: AbortSignal.timeout(10000),
    });

    const promises = [p1];
    if (groupMsg && ADMIN_ID) {
      promises.push(fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPost(ADMIN_ID, groupMsg, useHtmlGroup)),
        signal: AbortSignal.timeout(10000),
      }));
    }

    const [resp1] = await Promise.all(promises);
    const data1   = await resp1.json();
    if (resp1.ok && data1.ok) {
      res.status(200).end(c === '1' ? 'activated' : 'pending');
    } else {
      res.status(200).end('ok');
    }
  } catch {
    res.status(200).end('ok');
  }
};
