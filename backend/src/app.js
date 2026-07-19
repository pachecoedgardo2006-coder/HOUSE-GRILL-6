// /backend/src/app.js
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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://housegrill6.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: 'https://housegrill6.netlify.app',
  credentials: true
}));

app.use(express.json());

// Log de depuración para ver qué ruta llega a Express
app.use((req, res, next) => {
  console.log(`[ROUTER] Intentando coincidir: ${req.method} ${req.path}`);
  next();
});

// Creación del Router con prefijo /api
const apiRouter = express.Router();

apiRouter.post('/auth/login', login);
apiRouter.use('/inventario', verificarToken, inventarioRoutes);
apiRouter.use('/pedidos', verificarToken, pedidosRoutes);
apiRouter.use('/historial', verificarToken, historialRoutes);
apiRouter.use('/estadisticas', verificarToken, estadisticasRoutes);

// Montamos todo bajo /api
app.use('/api', apiRouter);

// Manejo global de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

export default app;