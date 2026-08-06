/**
 * SePay transaction reconciliation script.
 *
 * Fetches transactions from SePay API for the last 24 hours
 * and inserts missing ones into the database.
 *
 * Usage:
 *   node scripts/reconcile-sepay.mjs
 *
 * Environment variables (from .env or process):
 *   DATABASE_URL or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE
 *   SEPAY_API_TOKEN
 */

import pg from 'pg';
const { Client } = pg;
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env ──────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPaths = [
  resolve(__dirname, '..', '.env'),
  resolve(process.cwd(), '.env'),
];

for (const p of new Set(envPaths)) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] =
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
          ? val.slice(1, -1)
          : val;
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────
const toPgDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

function getDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'chat',
  };
}

// ── Main ───────────────────────────────────────────────────────────
async function reconcile() {
  const TOKEN = process.env.SEPAY_API_TOKEN;
  if (!TOKEN) {
    console.error('Missing SEPAY_API_TOKEN');
    process.exit(1);
  }

  const client = new Client(getDbConfig());
  await client.connect();
  const db = client;

  try {
    const now = new Date();
    const dateFrom = toPgDate(new Date(now - 24 * 3600 * 1000));
    const dateTo = toPgDate(now);

    // 1. Fetch transactions from SePay API (last 24h)
    const API_TOKEN = process.env.SEPAY_API_TOKEN || '';
    const params = new URLSearchParams({
      transaction_date_from: dateFrom,
      transaction_date_to: dateTo,
      per_page: '100',
    });
    const res = await fetch(
      `https://my.sepay.vn/userapi/transactions/list?${params}`,
      { headers: { Authorization: `Bearer ${API_TOKEN}` } },
    );

    if (!res.ok) {
      throw new Error(`SePay API error: ${res.status} ${await res.text()}`);
    }

    const json = await res.json();
    const transactions = json.transactions || json.data || [];
    console.log(`SePay: ${transactions.length} giao dich`);

    if (transactions.length === 0) {
      console.log('Khong co giao dich nao.');
      return;
    }

    // 2. Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS tb_transactions (
        id SERIAL PRIMARY KEY,
        sep_pay_id BIGINT UNIQUE,
        gateway VARCHAR(100),
        transaction_date TIMESTAMP,
        account_number VARCHAR(50),
        sub_account VARCHAR(50) DEFAULT '',
        amount_in NUMERIC(15,2) DEFAULT 0,
        amount_out NUMERIC(15,2) DEFAULT 0,
        accumulated NUMERIC(15,2) DEFAULT 0,
        code VARCHAR(100),
        transaction_content TEXT,
        reference_number VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Check which reference_numbers already exist
    const { rows: existing } = await db.query(
      'SELECT reference_number FROM tb_transactions WHERE created_at >= $1',
      [dateFrom],
    );
    const existingSet = new Set(existing.map((r) => r.reference_number));

    // 4. Insert missing transactions
    let inserted = 0;
    for (const tx of transactions) {
      if (existingSet.has(tx.reference_number)) continue;

      try {
        await db.query(
          `INSERT INTO tb_transactions
           (sep_pay_id, gateway, transaction_date, account_number, sub_account,
            amount_in, amount_out, accumulated, code, transaction_content, reference_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (reference_number) DO NOTHING`,
          [
            tx.id,
            tx.bank_brand_name,
            tx.transaction_date,
            tx.account_number,
            tx.va ?? tx.sub_account ?? '',
            tx.amount_in ?? 0,
            tx.amount_out ?? 0,
            tx.accumulated ?? 0,
            tx.code,
            tx.transaction_content,
            tx.reference_number,
          ],
        );
        inserted++;
      } catch (err) {
        console.error(`Loi khi chen giao dich ${tx.reference_number}:`, err.message);
      }
    }

    console.log(`Xong. Bo sung ${inserted} giao dich.`);
  } finally {
    await client.end();
  }
}

reconcile().catch((err) => {
  console.error(err);
  process.exit(1);
});
