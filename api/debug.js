/**
 * api/debug.js — DB connection test (احذف هذا الملف بعد التحقق!)
 * افتح: https://your-project.vercel.app/api/debug
 */

const { db, ensureSchema } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const lines = ['<pre>'];

  lines.push('=== 1. Environment Variables ===');
  lines.push(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set (' + process.env.DATABASE_URL.substring(0,30) + '...)' : '❌ NOT SET'}`);
  lines.push(`BOT_TOKEN:    ${process.env.BOT_TOKEN ? '✅ Set' : '❌ NOT SET'}`);
  lines.push(`ADMIN_ID:     ${process.env.ADMIN_ID  ? '✅ Set' : '❌ NOT SET'}`);
  lines.push(`APP_EK:       ${process.env.APP_EK    ? '✅ Set' : '⚠️ Using default'}`);
  lines.push('');

  try {
    lines.push('=== 2. DB Connection ===');
    const sql = await db();
    lines.push('✅ Neon DB connected');

    lines.push('');
    lines.push('=== 3. Schema Bootstrap ===');
    await ensureSchema(sql);
    lines.push('✅ Schema OK');

    lines.push('');
    lines.push('=== 4. Tables ===');
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    for (const t of tables) lines.push('   📋 ' + t.tablename);

    lines.push('');
    lines.push('=== 5. Test INSERT/SELECT/DELETE ===');
    await sql`INSERT INTO users (tg_id, tg_data) VALUES (999999999, '{"test":true}') ON CONFLICT (tg_id) DO UPDATE SET last_seen=NOW()`;
    lines.push('✅ INSERT OK');
    const sel = await sql`SELECT tg_id, last_seen FROM users WHERE tg_id=999999999`;
    lines.push(`✅ SELECT OK: tg_id=${sel[0].tg_id}`);
    await sql`DELETE FROM users WHERE tg_id=999999999`;
    lines.push('✅ DELETE OK');

    lines.push('');
    lines.push('✅ All checks passed — DELETE this file now!');
  } catch (e) {
    lines.push('❌ ERROR: ' + e.message);
  }

  lines.push('</pre>');
  res.end(lines.join('\n'));
};
