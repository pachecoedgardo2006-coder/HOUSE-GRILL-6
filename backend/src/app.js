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

// Middleware de CORS "blindado"
// Este middleware se coloca primero para interceptar todas las peticiones,
// incluyendo las peticiones OPTIONS (preflight)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://housegrill6.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Si la petición es OPTIONS, respondemos inmediatamente con 200 y terminamos
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware adicional de la librería cors configurado para coincidir
// con la política establecida arriba
app.use(cors({
  origin: 'https://housegrill6.netlify.app',
  credentials: true
}));

// Middlewares globales
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