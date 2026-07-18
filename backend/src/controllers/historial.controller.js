// backend/src/controllers/historial.controller.js
import { conectarDB } from '../config/db.js';

/**
 * Obtiene el historial de órdenes finalizadas. 
 * Soporta de manera opcional filtrado por rango de fechas (?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
 */
export const obtenerHistorialAnalitico = async (req, res) => {
    try {
        const { desde, hasta, ubicacion, estado } = req.query;
        const db = await conectarDB();
        
        let sql = `
            SELECT id, cliente_nombre, telefono, torre_bloque, apartamento, total, tipo_pago, paga_con, cambio, estado, fecha 
            FROM pedidos 
            WHERE estado IN ('Entregado', 'Cancelado')
        `;
        const params = [];

        // Solo agregar filtros si tienen valor
        if (desde && hasta) {
            sql += ` AND date(fecha, 'localtime') BETWEEN date(?) AND date(?)`;
            params.push(desde, hasta);
        }
        if (ubicacion) {
            sql += ` AND torre_bloque = ?`;
            params.push(ubicacion);
        }
        if (estado) {
            sql += ` AND estado = ?`;
            params.push(estado);
        }

        sql += ` ORDER BY fecha DESC`;

        const pedidosArchivados = await db.all(sql, params);
        
        for (const pedido of pedidosArchivados) {
            pedido.items = await db.all(`
                SELECT dp.cantidad, dp.precio_historico, p.nombre 
                FROM detalle_pedidos dp
                JOIN productos p ON dp.producto_id = p.id
                WHERE dp.pedido_id = ?
            `, [pedido.id]);
        }

        await db.close();
        res.json(pedidosArchivados);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el historial: ' + error.message });
    }
};

export const obtenerTorresDisponibles = async (req, res) => {
    try {
        const db = await conectarDB();
        // SELECT DISTINCT obtiene valores únicos de la columna torre_bloque
        const torres = await db.all(`SELECT DISTINCT torre_bloque FROM pedidos WHERE torre_bloque IS NOT NULL ORDER BY torre_bloque ASC`);
        await db.close();
        res.json(torres);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener torres: ' + error.message });
    }
};