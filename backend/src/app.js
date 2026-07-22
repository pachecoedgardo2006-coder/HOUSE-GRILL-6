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

// Lista de orígenes permitidos (desarrollo local y producción)
const allowedOrigins = [
  'http://localhost:5173',
  'https://housegrill6.netlify.app'
];

// Configuración de CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o solicitudes server-to-server) o si está en la lista permitida
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
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