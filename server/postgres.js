import pg from 'pg';
const { Pool } = pg;

class PostgresStore {
  constructor() {
    this.pool = null;
    this.isReady = false;
    this.connectionString = process.env.DATABASE_URL || null;
  }

  async init(initialData) {
    if (!this.connectionString) {
      return false;
    }

    try {
      const config = {
        connectionString: this.connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };

      if (process.env.DATABASE_SSL === 'true' || this.connectionString.includes('sslmode=require')) {
        config.ssl = { rejectUnauthorized: false };
      }

      this.pool = new Pool(config);
      const client = await this.pool.connect();

      await client.query(`
        CREATE TABLE IF NOT EXISTS hospital_store (
          key VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const existing = await client.query('SELECT key FROM hospital_store LIMIT 1;');
      if (existing.rowCount === 0 && initialData) {
        for (const [key, value] of Object.entries(initialData)) {
          await client.query(`
            INSERT INTO hospital_store (key, data, updated_at) 
            VALUES ($1, $2, NOW()) 
            ON CONFLICT (key) DO NOTHING;
          `, [key, JSON.stringify(value)]);
        }
      }

      client.release();
      this.isReady = true;
      return true;
    } catch (err) {
      console.error('[PostgreSQL] Connection failed:', err.message);
      this.isReady = false;
      return false;
    }
  }

  async loadAll() {
    if (!this.isReady || !this.pool) return null;
    try {
      const res = await this.pool.query('SELECT key, data FROM hospital_store;');
      if (res.rowCount === 0) return null;

      const state = {};
      for (const row of res.rows) {
        state[row.key] = row.data;
      }
      return state;
    } catch (err) {
      console.error('[PostgreSQL] Error loading state:', err.message);
      return null;
    }
  }

  async saveCollection(key, data) {
    if (!this.isReady || !this.pool) return;
    try {
      await this.pool.query(`
        INSERT INTO hospital_store (key, data, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE 
        SET data = EXCLUDED.data, updated_at = NOW();
      `, [key, JSON.stringify(data)]);
    } catch (err) {
      console.error(`[PostgreSQL] Error saving collection ${key}:`, err.message);
    }
  }

  async saveFullState(fullState) {
    if (!this.isReady || !this.pool || !fullState) return;
    try {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        for (const [key, value] of Object.entries(fullState)) {
          await client.query(`
            INSERT INTO hospital_store (key, data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (key) DO UPDATE 
            SET data = EXCLUDED.data, updated_at = NOW();
          `, [key, JSON.stringify(value)]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('[PostgreSQL] Error saving full state:', err.message);
    }
  }
}

export const postgresStore = new PostgresStore();
