import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('✅ Conectando con Supabase...');

        // Solo escucha en el puerto si no estás en un entorno de producción/Vercel
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
            });
        }
    } catch (error) {
        console.error('No se pudo iniciar el servidor debido a un fallo en la DB:', error);
        process.exit(1);
    }
}

startServer();

// Exporta la app para que la plataforma serverless pueda manejar las peticiones
export default app;
