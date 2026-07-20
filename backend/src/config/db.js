import pkg from 'pg';
import dotenv from 'dotenv';
import net from 'net';
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está definida en las variables de entorno');
} else {
  console.log('✅ DATABASE_URL cargada correctamente');
}

if (connectionString) {
  console.log("URL de conexión detectada:", connectionString.replace(/:[^:@]+@/, ':***@'));
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  // Capturamos el host y puerto de la conexión para asignarle la familia IPv4 correctamente
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