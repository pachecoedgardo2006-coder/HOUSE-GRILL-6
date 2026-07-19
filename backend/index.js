import 'dotenv/config';
import app from './src/app.js';

// Para Vercel, simplemente exportamos la app configurada.
// Vercel se encarga de escuchar en el puerto automáticamente.
export default app;
