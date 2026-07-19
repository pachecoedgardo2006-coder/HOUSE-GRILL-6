import { Router } from 'express';
import { crearPedido, listarPedidos, actualizarEstadoPedido } from '../controllers/pedidos.controller.js';

const router = Router();

router.post('/', crearPedido);
router.get('/', listarPedidos);
router.put('/:id', actualizarEstadoPedido);

export default router;