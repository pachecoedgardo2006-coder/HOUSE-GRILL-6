import { Router } from 'express';
import { obtenerHistorialAnalitico, obtenerTorresDisponibles } from '../controllers/historial.controller.js';

const router = Router();

// Endpoint dedicado al historial
router.get('/torres', obtenerTorresDisponibles);
router.get('/', obtenerHistorialAnalitico);

export default router;