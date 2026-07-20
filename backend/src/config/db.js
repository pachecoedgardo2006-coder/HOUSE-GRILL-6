import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sube desde src/config hasta la raíz absoluta de HOUSE-GRILL-6
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está definida en las variables de entorno');
} else {
  console.log('✅ DATABASE_URL cargada correctamente');
  console.log("URL de conexión detectada:", connectionString.replace(/:[^:@]+@/, ':***@'));
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para probar la conexión explícitamente al arranque
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('🚀 Conexión exitosa a Supabase en el arranque:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Error crítico al conectar con la base de datos en el arranque:', err.message);
    return false;
  }
}

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