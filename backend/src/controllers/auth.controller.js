import { conectarDB } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { username, password } = req.body;
    const db = await conectarDB();
    const user = await db.get('SELECT * FROM usuarios WHERE username = ?', [username]);
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ id: user.id }, 'SECRETO_SUPER_SEGURO', { expiresIn: '8h' });
    res.json({ token });
    await db.close();
};