"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.runMigrations = runMigrations;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
async function query(text, params) {
    const res = await pool.query(text, params);
    return res.rows;
}
async function runMigrations() {
    const migrationsDir = path_1.default.join(process.cwd(), 'migrations');
    const files = fs_1.default.readdirSync(migrationsDir).sort();
    // Create migrations tracking table
    await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
    for (const file of files) {
        if (!file.endsWith('.sql'))
            continue;
        const { rows } = await pool.query('SELECT id FROM _migrations WHERE filename = $1', [file]);
        if (rows.length === 0) {
            console.log(`[Migrations] Running: ${file}`);
            const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf8');
            await pool.query('BEGIN');
            try {
                await pool.query(sql);
                await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [
                    file,
                ]);
                await pool.query('COMMIT');
                console.log(`[Migrations] Done: ${file}`);
            }
            catch (err) {
                await pool.query('ROLLBACK');
                console.error(`[Migrations] Failed: ${file}`, err);
                throw err;
            }
        }
        else {
            console.log(`[Migrations] Skipping already-run: ${file}`);
        }
    }
}
exports.default = pool;
