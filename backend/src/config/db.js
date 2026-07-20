import pkg from 'pg';
import dotenv from 'dotenv';
import net from 'net';
dotenv.config();

const { Pool } = pkg;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  stream: (options) => {
    options.family = 4;
    return net.createConnection(options);
  }
});

export async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
}

export async function getClient() {
    const client = await pool.connect();
    return client;
}