import { Router } from 'express';
import { obtenerProductos, crearProducto, editarProducto } from '../controllers/inventario.controller.js';

const router = Router();

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', editarProducto);

export default router;