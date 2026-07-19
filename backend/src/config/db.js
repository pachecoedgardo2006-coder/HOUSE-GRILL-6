import pkg from 'pg';
const { Pool } = pkg;

// Configura tu cadena de conexión aquí
// IMPORTANTE: Sustituye [YOUR-PASSWORD] por tu contraseña real de base de datos
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Esta función permite realizar consultas desde tus controladores
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