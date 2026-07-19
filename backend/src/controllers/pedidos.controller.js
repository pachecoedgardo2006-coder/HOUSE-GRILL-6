import { query, getClient } from '../config/db.js';

export const crearPedido = async (req, res) => {
    let { 
        cliente_nombre, 
        torre_bloque, 
        apartamento, 
        telefono, 
        tipo_pago,       // 'Efectivo' o 'Transferencia'
        paga_con,        // Cuánto dinero entrega el cliente
        observaciones, 
        items 
    } = req.body;

    // Normalizar a MAYÚSCULAS y limpiar espacios en los campos de texto críticos
    if (cliente_nombre) cliente_nombre = cliente_nombre.trim().toUpperCase();
    if (torre_bloque) torre_bloque = torre_bloque.trim().toUpperCase();
    if (apartamento) apartamento = apartamento.trim().toUpperCase();

    if (!cliente_nombre || !torre_bloque || !apartamento || !telefono || !tipo_pago || !items || items.length === 0) {
        return res.status(400).json({ error: 'Información del residente, método de pago o productos incompletos.' });
    }

    // Usamos un cliente dedicado del pool para que BEGIN/COMMIT/ROLLBACK
    // se ejecuten sobre la misma conexión durante toda la transacción.
    const client = await getClient();

    try {
        await client.query('BEGIN');

        let totalPedido = 0;
        const listaDetallesVerificados = [];

        // Validar stock y recopilar precios históricos
        for (const item of items) {
            const productoResult = await client.query('SELECT * FROM productos WHERE id = $1', [item.producto_id]);
            const producto = productoResult.rows[0];

            if (!producto) {
                throw new Error(`El producto con ID ${item.producto_id} no existe.`);
            }
            if (producto.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para "${producto.nombre}". Disponibles: ${producto.stock}, solicitados: ${item.cantidad}`);
            }

            const subtotal = producto.precio * item.cantidad;
            totalPedido += subtotal;

            listaDetallesVerificados.push({
                producto_id: producto.id,
                cantidad: item.cantidad,
                precio_historico: producto.precio
            });

            // Descontar stock automáticamente
            await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, producto.id]);
        }

        // Lógica de cálculo matemático del cambio/vuelto
        let montoPagaCon = 0;
        let montoCambio = 0;

        if (tipo_pago === 'Efectivo') {
            montoPagaCon = paga_con || totalPedido; 
            if (montoPagaCon < totalPedido) {
                throw new Error(`El dinero en efectivo recibido (${montoPagaCon}) es menor al total del pedido (${totalPedido}).`);
            }
            montoCambio = montoPagaCon - totalPedido;
        } else {
            // Transferencia electrónica
            montoPagaCon = totalPedido;
            montoCambio = 0;
        }

        // Insertar cabecera con datos residenciales ya estandarizados en MAYÚSCULAS
        // (fecha queda a cargo del DEFAULT CURRENT_TIMESTAMP de la tabla)
        const resultadoPedido = await client.query(
            `INSERT INTO pedidos (cliente_nombre, torre_bloque, apartamento, telefono, total, estado, tipo_pago, paga_con, cambio, observaciones) 
             VALUES ($1, $2, $3, $4, $5, 'Pendiente', $6, $7, $8, $9) RETURNING id`,
            [cliente_nombre, torre_bloque, apartamento, telefono, totalPedido, tipo_pago, montoPagaCon, montoCambio, observaciones]
        );

        const pedidoId = resultadoPedido.rows[0].id;

        // Insertar desglose del pedido
        for (const detalle of listaDetallesVerificados) {
            await client.query(
                `INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_historico) 
                 VALUES ($1, $2, $3, $4)`,
                [pedidoId, detalle.producto_id, detalle.cantidad, detalle.precio_historico]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({ 
            mensaje: 'Pedido creado exitosamente', 
            pedido_id: pedidoId,
            total: totalPedido,
            cambio: montoCambio
        });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

export const listarPedidos = async (req, res) => {
    try {
        // 🛠️ FILTRADO ATÓMICO: Solo traemos las órdenes que están en proceso en la cocina/reparto
        const resultadoPedidos = await query(`
            SELECT * FROM pedidos 
            WHERE estado IN ('Pendiente', 'En preparación') 
            ORDER BY fecha DESC
        `);
        const pedidos = resultadoPedidos.rows;

        for (const pedido of pedidos) {
            const itemsResult = await query(`
                SELECT dp.cantidad, dp.precio_historico, p.nombre 
                FROM detalle_pedidos dp
                JOIN productos p ON dp.producto_id = p.id
                WHERE dp.pedido_id = $1
            `, [pedido.id]);
            pedido.items = itemsResult.rows;
        }

        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar pedidos activos: ' + error.message });
    }
};

export const actualizarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Pendiente', 'En preparación', 'Entregado', 'Cancelado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado del pedido no válido.' });
    }

    // Solo se necesita un cliente dedicado cuando hay que envolver varias
    // sentencias en una transacción (caso de cancelación con devolución de stock).
    const client = await getClient();

    try {
        const pedidoResult = await client.query('SELECT id, estado FROM pedidos WHERE id = $1', [id]);
        const pedido = pedidoResult.rows[0];

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        if (estado === 'Cancelado' && pedido.estado !== 'Cancelado') {
            await client.query('BEGIN');
            const itemsResult = await client.query('SELECT producto_id, cantidad FROM detalle_pedidos WHERE pedido_id = $1', [id]);
            for (const item of itemsResult.rows) {
                await client.query('UPDATE productos SET stock = stock + $1 WHERE id = $2', [item.cantidad, item.producto_id]);
            }
            await client.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
            await client.query('COMMIT');
        } else {
            await client.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        }

        res.json({ mensaje: `Estado del pedido #${id} actualizado a '${estado}' con éxito.` });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (_) { /* no había transacción activa */ }
        res.status(500).json({ error: 'Error al actualizar el estado: ' + error.message });
    } finally {
        client.release();
    }
};