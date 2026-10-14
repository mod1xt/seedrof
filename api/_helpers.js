/**
 * _helpers.js — Encryption helpers + response utilities
 * نفس منطق PHP بالضبط (XOR cipher)
 */

const EK = process.env.APP_EK || 'aLf4X9mQ2rTvUwPz';

function xorCipher(bytes, key) {
  const keyLen = key.length;
  const out = Buffer.alloc(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    out[i] = bytes[i] ^ key.charCodeAt(i % keyLen);
  }
  return out;
}

function encResp(data) {
  const raw   = JSON.stringify(data);
  const utf8  = encodeURIComponent(raw);
  // Decode percent-encoding to raw bytes
  const bytes = Buffer.from(
    utf8.replace(/%([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))),
    'latin1'
  );
  const encrypted = xorCipher(bytes, EK);
  return encrypted.toString('base64');
}

function decryptPayload(b64) {
  const bytes     = Buffer.from(b64, 'base64');
  const decrypted = xorCipher(bytes, EK);
  const raw       = decodeURIComponent(decrypted.toString('latin1'));
  return JSON.parse(raw);
}

function jout(res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ _r: encResp(data) }));
}

function fail(res, msg, status = 400) {
  res.status(status);
  jout(res, { ok: false, error: msg });
}

function ok(res, data = {}) {
  jout(res, { ok: true, ...data });
}

function jd(v, def = null) {
  if (v === null || v === undefined) return def;
  if (typeof v === 'object') return v; // already parsed (Neon can return objects)
  try { return JSON.parse(v); } catch { return def; }
}

function je(v) {
  return JSON.stringify(v);
}

function getIp(req) {
  const cf  = req.headers['cf-connecting-ip'];
  const fwd = req.headers['x-forwarded-for'];
  const ra  = req.socket?.remoteAddress || '';
  const raw = cf || fwd || ra || '';
  return raw.split(',')[0].trim();
}

// Read raw body as text then parse JSON
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

module.exports = { encResp, decryptPayload, jout, fail, ok, jd, je, getIp, parseBody, EK };
