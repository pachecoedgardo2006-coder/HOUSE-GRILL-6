import app from './src/app.js';
import dotenv from 'dotenv';
import { testConnection } from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  console.log('🔍 Verificando conectividad con la base de datos...');
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️ Advertencia: El servidor arrancará, pero las consultas a la base de datos fallarán hasta que se resuelva la red.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo exitosamente en el puerto ${PORT}`);
  });
};

startServer();