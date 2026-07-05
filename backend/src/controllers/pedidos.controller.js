import { conectarDB } from '../config/db.js';

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

    const db = await conectarDB();

    try {
        await db.run('BEGIN TRANSACTION');

        let totalPedido = 0;
        const listaDetallesVerificados = [];

        // Validar stock y recopilar precios históricos
        for (const item of items) {
            const producto = await db.get('SELECT * FROM productos WHERE id = ?', [item.producto_id]);
            
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
            await db.run('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, producto.id]);
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

        const fechaISO = new Date().toISOString();

        // Insertar cabecera con datos residenciales ya estandarizados en MAYÚSCULAS
        const resultadoPedido = await db.run(
            `INSERT INTO pedidos (cliente_nombre, torre_bloque, apartamento, telefono, fecha, total, estado, tipo_pago, paga_con, cambio, observaciones) 
             VALUES (?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?, ?, ?)`,
            [cliente_nombre, torre_bloque, apartamento, telefono, fechaISO, totalPedido, tipo_pago, montoPagaCon, montoCambio, observaciones]
        );

        const pedidoId = resultadoPedido.lastID;

        // Insertar desglose del pedido
        for (const detalle of listaDetallesVerificados) {
            await db.run(
                `INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_historico) 
                 VALUES (?, ?, ?, ?)`,
                [pedidoId, detalle.producto_id, detalle.cantidad, detalle.precio_historico]
            );
        }

        await db.run('COMMIT');
        
        res.status(201).json({ 
            mensaje: 'Pedido creado exitosamente', 
            pedido_id: pedidoId,
            total: totalPedido,
            cambio: montoCambio
        });

    } catch (error) {
        await db.run('ROLLBACK');
        res.status(400).json({ error: error.message });
    } finally {
        await db.close();
    }
};

export const listarPedidos = async (req, res) => {
    try {
        const db = await conectarDB();
        const pedidos = await db.all('SELECT * FROM pedidos ORDER BY fecha DESC');
        
        for (const pedido of pedidos) {
            pedido.items = await db.all(`
                SELECT dp.cantidad, dp.precio_historico, p.nombre 
                FROM detalle_pedidos dp
                JOIN productos p ON dp.producto_id = p.id
                WHERE dp.pedido_id = ?
            `, [pedido.id]);
        }

        await db.close();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar pedidos: ' + error.message });
    }
};

export const actualizarEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Pendiente', 'En preparación', 'Entregado', 'Cancelado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado del pedido no válido.' });
    }

    try {
        const db = await conectarDB();
        const pedido = await db.get('SELECT id, estado FROM pedidos WHERE id = ?', [id]);

        if (!pedido) {
            await db.close();
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        if (estado === 'Cancelado' && pedido.estado !== 'Cancelado') {
            await db.run('BEGIN TRANSACTION');
            const items = await db.all('SELECT producto_id, cantidad FROM detalle_pedidos WHERE pedido_id = ?', [id]);
            for (const item of items) {
                await db.run('UPDATE productos SET stock = stock + ? WHERE id = ?', [item.cantidad, item.producto_id]);
            }
            await db.run('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
            await db.run('COMMIT');
        } else {
            await db.run('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
        }

        await db.close();
        res.json({ mensaje: `Estado del pedido #${id} actualizado a '${estado}' con éxito.` });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado: ' + error.message });
    }
};