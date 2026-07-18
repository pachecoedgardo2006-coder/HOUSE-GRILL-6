import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../data/restaurante.db');

export async function conectarDB() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    await db.get('PRAGMA foreign_keys = ON');
    return db;
}

export async function inicializarDB() {
    const db = await conectarDB();

    try {
        // 1. Tabla de Productos / Inventario
        await db.exec(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL NOT NULL CHECK(precio >= 0),
                stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0)
            );
        `);

        // 2. Tabla de Pedidos (Adaptada a conjunto residencial y métodos de pago)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_nombre TEXT NOT NULL,
                torre_bloque TEXT NOT NULL,
                apartamento TEXT NOT NULL,
                telefono TEXT NOT NULL,
                fecha TEXT NOT NULL,
                total REAL NOT NULL DEFAULT 0 CHECK(total >= 0),
                estado TEXT NOT NULL DEFAULT 'Pendiente' 
                    CHECK(estado IN ('Pendiente', 'En preparación', 'Entregado', 'Cancelado')),
                tipo_pago TEXT NOT NULL CHECK(tipo_pago IN ('Efectivo', 'Transferencia')),
                paga_con REAL DEFAULT 0 CHECK(paga_con >= 0),
                cambio REAL DEFAULT 0 CHECK(cambio >= 0),
                observaciones TEXT
            );
        `);

        // 3. Tabla Detalle de Pedidos
        await db.exec(`
            CREATE TABLE IF NOT EXISTS detalle_pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pedido_id INTEGER NOT NULL,
                producto_id INTEGER NOT NULL,
                cantidad INTEGER NOT NULL CHECK(cantidad > 0),
                precio_historico REAL NOT NULL CHECK(precio_historico >= 0),
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            );
        `);

        // 4. Tabla de Usuarios
        await db.exec(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            );`
        );

        console.log('--- Base de datos indexada e inicializada correctamente (V2) ---');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    } finally {
        await db.close();
    }
}