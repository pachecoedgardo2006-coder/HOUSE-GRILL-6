import { Router } from 'express';
import { obtenerEstadisticas } from '../controllers/estadisticas.controller.js';

const router = Router();

router.get('/', obtenerEstadisticas);

export default router;