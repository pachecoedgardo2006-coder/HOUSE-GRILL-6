import { query } from '../config/db.js';

export const obtenerProductos = async (req, res) => {
    try {
        const resultado = await query('SELECT * FROM productos ORDER BY nombre ASC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el inventario: ' + error.message });
    }
};

export const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const sql = 'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING id';
        const valores = [nombre, descripcion, precio, stock];
        
        const resultado = await query(sql, valores);
        
        res.status(201).json({ id: resultado.rows[0].id, nombre, descripcion, precio, stock });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir producto: ' + error.message });
    }
};

export const editarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;

    try {
        const productoExisteResult = await query('SELECT id FROM productos WHERE id = $1', [id]);

        if (productoExisteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await query(
            `UPDATE productos 
             SET nombre = COALESCE($1, nombre), 
                 descripcion = COALESCE($2, descripcion), 
                 precio = COALESCE($3, precio), 
                 stock = COALESCE($4, stock) 
             WHERE id = $5`,
            [nombre, descripcion, precio, stock, id]
        );

        const productoActualizadoResult = await query('SELECT * FROM productos WHERE id = $1', [id]);
        res.json(productoActualizadoResult.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto: ' + error.message });
    }
};