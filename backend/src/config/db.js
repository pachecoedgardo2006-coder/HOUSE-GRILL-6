import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está definida en las variables de entorno');
} else {
  console.log('✅ DATABASE_URL cargada correctamente');
}

// Ocultar la contraseña al imprimir la URL por seguridad
if (connectionString) {
  console.log("URL de conexión detectada:", connectionString.replace(/:[^:@]+@/, ':***@'));
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
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