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

// Configuración de CORS
const corsOptions = {
  origin: 'https://housegrill6.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

// Middleware de CORS manual para asegurar respuesta a preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://housegrill6.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middlewares globales
app.use(cors(corsOptions));
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