// backend/src/controllers/historial.controller.js
import { query } from '../config/db.js';

/**
 * Obtiene el historial de órdenes finalizadas. 
 * Soporta de manera opcional filtrado por rango de fechas (?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
 */
export const obtenerHistorialAnalitico = async (req, res) => {
    try {
        const { desde, hasta, ubicacion, estado } = req.query;
        
        let sql = `
            SELECT id, cliente_nombre, telefono, torre_bloque, apartamento, total, tipo_pago, paga_con, cambio, estado, fecha 
            FROM pedidos 
            WHERE estado IN ('Entregado', 'Cancelado')
        `;
        const params = [];
        let paramIndex = 1;

        // Solo agregar filtros si tienen valor
        if (desde && hasta) {
            sql += ` AND date(fecha AT TIME ZONE 'America/Bogota') BETWEEN $${paramIndex}::date AND $${paramIndex + 1}::date`;
            params.push(desde, hasta);
            paramIndex += 2;
        }
        if (ubicacion) {
            sql += ` AND torre_bloque = $${paramIndex}`;
            params.push(ubicacion);
            paramIndex++;
        }
        if (estado) {
            sql += ` AND estado = $${paramIndex}`;
            params.push(estado);
            paramIndex++;
        }

        sql += ` ORDER BY fecha DESC`;

        const resultadoPedidos = await query(sql, params);
        const pedidosArchivados = resultadoPedidos.rows;
        
        for (const pedido of pedidosArchivados) {
            const itemsResult = await query(`
                SELECT dp.cantidad, dp.precio_historico, p.nombre 
                FROM detalle_pedidos dp
                JOIN productos p ON dp.producto_id = p.id
                WHERE dp.pedido_id = $1
            `, [pedido.id]);
            pedido.items = itemsResult.rows;
        }

        res.json(pedidosArchivados);
    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el historial: ' + error.message });
    }
};

export const obtenerTorresDisponibles = async (req, res) => {
    try {
        // SELECT DISTINCT obtiene valores únicos de la columna torre_bloque
        const resultado = await query(`SELECT DISTINCT torre_bloque FROM pedidos WHERE torre_bloque IS NOT NULL ORDER BY torre_bloque ASC`);
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener torres: ' + error.message });
    }
};