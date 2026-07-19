import { query } from '../config/db.js';

export const obtenerEstadisticas = async (req, res) => {
    try {
        // 1. Resumen Financiero Expandido (Solo pedidos efectivos computan caja)
        const resumenFinancieroResult = await query(`
            SELECT 
                COALESCE(SUM(total), 0)::float as ingresos_totales,
                COALESCE(AVG(total), 0)::float as ticket_promedio,
                COUNT(id)::int as total_pedidos,
                COALESCE(SUM(CASE WHEN tipo_pago = 'Efectivo' THEN total ELSE 0 END), 0)::float as ingresos_efectivo,
                COALESCE(SUM(CASE WHEN tipo_pago = 'Transferencia' THEN total ELSE 0 END), 0)::float as ingresos_transferencia
            FROM pedidos 
            WHERE estado = 'Entregado'
        `);
        const resumenFinanciero = resumenFinancieroResult.rows[0];

        // 2. Conteo de Estados y Logística de Cambio en Ruta (Pendientes o En preparación)
        const logisticaYEstadosResult = await query(`
            SELECT 
                COUNT(CASE WHEN estado = 'Entregado' THEN 1 END)::int as entregados,
                COUNT(CASE WHEN estado = 'Cancelado' THEN 1 END)::int as cancelados,
                COALESCE(SUM(CASE WHEN estado IN ('Pendiente', 'En preparación') AND tipo_pago = 'Efectivo' THEN cambio ELSE 0 END), 0)::float as cambio_en_ruta
            FROM pedidos
        `);
        const logisticaYEstados = logisticaYEstadosResult.rows[0];

        // 3. Zona (Torre / Bloque) con mayor demanda (Para la tarjeta principal)
        const zonaPicoResult = await query(`
            SELECT torre_bloque, COUNT(id) as cantidad
            FROM pedidos
            WHERE estado != 'Cancelado'
            GROUP BY torre_bloque
            ORDER BY cantidad DESC
            LIMIT 1
        `);
        const zonaPico = zonaPicoResult.rows[0];

        // 4. Hora pico de pedidos
        const horaPicoResult = await query(`
            SELECT 
                TO_CHAR(fecha AT TIME ZONE 'America/Bogota', 'HH24') as hora, 
                COUNT(id) as cantidad
            FROM pedidos
            WHERE estado != 'Cancelado'
            GROUP BY hora
            ORDER BY cantidad DESC
            LIMIT 1
        `);
        const horaPico = horaPicoResult.rows[0];

        // 5. Top 5 de productos más vendidos
        const productosMasVendidosResult = await query(`
            SELECT p.nombre, SUM(dp.cantidad)::int as total_vendido
            FROM detalle_pedidos dp
            JOIN productos p ON dp.producto_id = p.id
            JOIN pedidos ped ON dp.pedido_id = ped.id
            WHERE ped.estado != 'Cancelado'
            GROUP BY p.id, p.nombre
            ORDER BY total_vendido DESC
            LIMIT 5
        `);
        const productosMasVendidos = productosMasVendidosResult.rows;

        // 6. Top 5 de Clientes Frecuentes
        const clientesFrecuentesResult = await query(`
            SELECT cliente_nombre, COUNT(id)::int as total_pedidos
            FROM pedidos
            WHERE estado != 'Cancelado'
            GROUP BY cliente_nombre
            ORDER BY total_pedidos DESC
            LIMIT 5
        `);
        const clientesFrecuentes = clientesFrecuentesResult.rows;

        // --- CONSULTAS COMPLEMENTARIAS ---

        // 7. Ranking General de todas las Torres/Bloques para el nuevo gráfico
        const rankingTorresResult = await query(`
            SELECT torre_bloque, COUNT(id)::int as total_pedidos
            FROM pedidos
            WHERE estado != 'Cancelado'
            GROUP BY torre_bloque
            ORDER BY total_pedidos DESC
        `);
        const rankingTorres = rankingTorresResult.rows;

        // 8. Alerta de Stock Crítico (Productos con 10 o menos unidades disponibles)
        const stockCriticoResult = await query(`
            SELECT nombre, stock
            FROM productos
            WHERE stock <= 10
            ORDER BY stock ASC
            LIMIT 5
        `);
        const stockCritico = stockCriticoResult.rows;

        // Formateo elegante de hora militar a legible
        let horaLegible = 'N/A';
        if (horaPico && horaPico.hora) {
            // Limpiamos cualquier residuo como ":" si la hora vino como "07:"
            let horaLimpia = horaPico.hora.replace(':', '').trim();
            const h = parseInt(horaLimpia, 10);
            
            if (!isNaN(h)) {
                horaLegible = h >= 12 ? `${h === 12 ? 12 : h - 12} PM` : `${h === 0 ? 12 : h} AM`;
            } else {
                horaLegible = horaPico.hora; // Si no es número, enviamos el texto tal cual
            }
        }

        res.json({
            ingresos_totales: resumenFinanciero.ingresos_totales || 0,
            ticket_promedio: resumenFinanciero.ticket_promedio || 0,
            ingresos_efectivo: resumenFinanciero.ingresos_efectivo || 0,
            ingresos_transferencia: resumenFinanciero.ingresos_transferencia || 0,
            pedidos_entregados: logisticaYEstados.entregados || 0,
            pedidos_cancelados: logisticaYEstados.cancelados || 0,
            cambio_en_ruta: logisticaYEstados.cambio_en_ruta || 0,
            zona_pico: zonaPico ? `Torre ${zonaPico.torre_bloque}` : 'N/A',
            hora_pico: horaLegible,
            productos_mas_vendidos: productosMasVendidos,
            clientes_frecuentes: clientesFrecuentes,
            ranking_torres: rankingTorres,
            stock_critico: stockCritico
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al generar las estadísticas: ' + error.message });
    }
};