import app from './src/app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('✅ Conectando con Supabase...');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor debido a un fallo en la DB:', error);
        process.exit(1);
    }
}

startServer();