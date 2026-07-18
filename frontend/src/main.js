// Diccionario que mapea la ruta (hash) con su respectiva función generadora del DOM
// Convertido a funciones que ejecutan importaciones dinámicas (Lazy Loading)
const routes = {
    '#estadisticas': () => import('./views/estadisticas/index.js').then(m => m.renderEstadisticas),
    '#pedidos': () => import('./views/pedidos/index.js').then(m => m.renderPedidos),
    '#inventario': () => import('./views/inventario/index.js').then(m => m.renderInventario),
    '#historial': () => import('./views/historial/index.js').then(m => m.renderHistorial)
};

/**
 * Orquestador de navegación asíncrona SPA con soporte de URL (Hash)
 */
async function router() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    // 1. Capturar el hash actual de la URL. Si está vacío, por defecto va a estadísticas.
    const currentHash = window.location.hash || '#estadisticas';
    
    // 2. Obtener la vista correspondiente o usar estadísticas como fallback seguro
    const getViewLoader = routes[currentHash] || routes['#estadisticas'];

    try {
        // Renderizamos un esqueleto de carga temporal rápido y limpio en el DOM principal
        appContainer.innerHTML = `
            <div class="flex items-center justify-center min-h-[50vh] bg-slate-950 text-red-500 text-xs font-black tracking-widest animate-pulse uppercase">
                🔥 Calentando los motores de la parrilla...
            </div>
        `;

        // 3. Ejecutar de forma asíncrona la inicialización de la vista (Axios Fetches internos)
        const renderView = await getViewLoader();
        const viewNode = await renderView();

        // 4. Limpieza absoluta e inyección segura del nuevo nodo estructurado
        appContainer.innerHTML = '';
        appContainer.appendChild(viewNode);

        // 5. Sincronizar el estado de los estilos activos de Tailwind en el Sidebar
        actualizarSidebar(currentHash);

    } catch (error) {
        console.error(`Error crítico cargando la vista [${currentHash}]:`, error);
        appContainer.innerHTML = `
            <div class="p-6 bg-red-950/20 border border-red-900 rounded-xl text-red-500 text-center font-bold text-xs uppercase tracking-wider max-w-xl mx-auto mt-12">
                ⚠️ Error de enlace o conectividad con el servidor de comanda.
            </div>
        `;
    }
}

/**
 * Actualiza dinámicamente las clases del Sidebar según la vista activa
 * @param {string} activeHash - Hash actual de la aplicación
 */
function actualizarSidebar(activeHash) {
    // Convertimos el hash (#pedidos) al formato guardado en data-view (pedidos) para hacer match
    const viewName = activeHash.replace('#', '');
    
    document.querySelectorAll('#sidebar-nav .nav-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === viewName) {
            // Sincronización cambiada al color Rojo Fuego de control para la pestaña activa
            btn.classList.add('bg-slate-900', 'text-white', 'font-bold', 'border-l-4', 'border-red-600');
            btn.classList.remove('text-slate-400', 'hover:bg-slate-900/60');
        } else {
            btn.classList.remove('bg-slate-900', 'text-white', 'font-bold', 'border-l-4', 'border-red-600');
            btn.classList.add('text-slate-400', 'hover:bg-slate-900/60');
        }
    });
}

// Inicialización de Eventos y Listeners del Navegador
document.addEventListener('DOMContentLoaded', () => {
    const sidebarNav = document.getElementById('sidebar-nav');

    if (sidebarNav) {
        // Delegación de eventos de clic optimizada sobre el menú de navegación lateral
        sidebarNav.addEventListener('click', (e) => {
            const button = e.target.closest('.nav-btn');
            if (!button) return;

            const targetView = button.getAttribute('data-view');
            
            // En vez de inyectar directamente, mutamos la URL. El evento hashchange hará el resto.
            window.location.hash = `#${targetView}`;
        });
    }

    // Escuchar cambios de ruta cuando el usuario navega o presiona botones de retroceso
    window.addEventListener('hashchange', router);

    // Carga inicial al abrir el Dashboard por primera vez
    router();
});