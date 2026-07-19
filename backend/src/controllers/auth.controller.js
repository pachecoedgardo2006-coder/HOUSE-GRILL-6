import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await query('SELECT * FROM usuarios WHERE username = $1', [username]);
        const user = rows[0];
        
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const token = jwt.sign({ id: user.id }, 'SECRETO_SUPER_SEGURO', { expiresIn: '8h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login: ' + error.message });
    }
};