import express from 'express';
import cors from 'cors';

// Importación de rutas
import inventarioRoutes from './routes/inventario.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import historialRoutes from './routes/historial.routes.js';
import { login } from './controllers/auth.controller.js';
import { verificarToken } from './middleware/authMiddleware.js';

const app = express();

// Middlewares globales
app.use(cors({
    origin: ['https://tu-frontend-en-netlify.netlify.app'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Inyección de Endpoints de la API REST
app.post('/api/auth/login', login);
app.use('/api/inventario', verificarToken, inventarioRoutes);
app.use('/api/pedidos', verificarToken, pedidosRoutes);
app.use('/api/historial', verificarToken, historialRoutes);
app.use('/api/estadisticas', verificarToken, estadisticasRoutes);

// Manejo global de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

export default app;