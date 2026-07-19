import { query } from './src/config/db.js'; // Ajusta la ruta según donde esté tu db.js
import bcrypt from 'bcryptjs';

async function agregarAdmin() {
    const hash = await bcrypt.hash('admin123', 10);
    try {
        await query('INSERT INTO usuarios (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
        console.log('✅ Usuario admin creado en Supabase.');
    } catch (e) {
        console.error('❌ Error (puede que ya exista):', e.message);
    }
}
agregarAdmin();