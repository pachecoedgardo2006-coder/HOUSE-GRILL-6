import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

// Debug: Esto imprimirá en los LOGS de Vercel si la variable llega vacía
if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está definida en las variables de entorno de Vercel');
} else {
  console.log('✅ DATABASE_URL cargada correctamente');
}

console.log("URL de conexión detectada (sin contraseña):", connectionString.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// ... resto de tu código

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