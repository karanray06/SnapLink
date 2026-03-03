import { Pool, QueryResultRow } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const res = await pool.query<T>(text, params);
    return res.rows;
}

export async function runMigrations(): Promise<void> {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    // Create migrations tracking table
    await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

    for (const file of files) {
        if (!file.endsWith('.sql')) continue;

        const { rows } = await pool.query(
            'SELECT id FROM _migrations WHERE filename = $1',
            [file]
        );

        if (rows.length === 0) {
            console.log(`[Migrations] Running: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await pool.query('BEGIN');
            try {
                await pool.query(sql);
                await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [
                    file,
                ]);
                await pool.query('COMMIT');
                console.log(`[Migrations] Done: ${file}`);
            } catch (err) {
                await pool.query('ROLLBACK');
                console.error(`[Migrations] Failed: ${file}`, err);
                throw err;
            }
        } else {
            console.log(`[Migrations] Skipping already-run: ${file}`);
        }
    }
}

export default pool;
