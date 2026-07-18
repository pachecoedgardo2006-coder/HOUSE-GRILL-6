import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, './data/restaurante.db'); // Asegura la misma ruta

async function crearAdmin() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const hash = await bcrypt.hash('admin123', 10);
    
    try {
        // Ejecución segura
        await db.run('INSERT INTO usuarios (username, password_hash) VALUES (?, ?)', ['admin', hash]);
        console.log('✅ Usuario administrador creado con éxito.');
    } catch (e) {
        console.error('❌ Error al insertar usuario (quizás ya existe):', e.message);
    } finally {
        await db.close();
    }
}

crearAdmin();