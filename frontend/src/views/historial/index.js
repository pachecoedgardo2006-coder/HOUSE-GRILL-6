// frontend/src/views/historial/index.js
import api from '../../services/api.js';
import { showToast } from '../../components/Toast.js';
import { FilaHistorial } from './modules/FilaHistorial.js';

export async function renderHistorial() {
    const container = document.createElement('div');
    container.className = 'space-y-6 w-full max-w-7xl mx-auto px-4';

    container.innerHTML = `
        <header class="border-b border-slate-900 pb-4">
            <h1 class="text-3xl font-black tracking-tighter text-white uppercase">Historial de Pedidos</h1>
            <p class="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Auditoría avanzada de comandas.</p>
        </header>

        <section class="bg-slate-950 border border-slate-900 rounded-none overflow-hidden shadow-2xl">
            <div class="p-4 bg-slate-900/60 border-b border-slate-900 flex flex-col xl:flex-row gap-4 justify-between items-center">
                <h2 class="text-xs font-black text-mostaza-caliente uppercase tracking-widest"> Órdenes Archivadas </h2>
                
                <form id="form-filtro-avanzado" class="flex flex-wrap items-center gap-3 bg-slate-950 p-2 border border-slate-900 rounded-none">
                    <input type="date" id="filtro-desde" class="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 text-[10px] focus:outline-none focus:border-rojo-fuego font-mono uppercase">
                    <input type="date" id="filtro-hasta" class="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 text-[10px] focus:outline-none focus:border-rojo-fuego font-mono uppercase">
                    
                    <select id="filtro-ubicacion" class="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 text-[10px] focus:outline-none uppercase font-black cursor-pointer">
                        <option value="">Todas las Ubicaciones</option>
                        <!-- Las opciones se cargarán aquí dinámicamente -->
                    </select>

                    <select id="filtro-estado" class="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 text-[10px] focus:outline-none uppercase font-black cursor-pointer">
                        <option value="">Todos los Estados</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>

                    <button type="submit" class="bg-rojo-fuego hover:bg-red-700 text-white font-black px-4 py-1 text-xs transition uppercase tracking-wider cursor-pointer">Filtrar</button>
                    <button type="button" id="btn-limpiar-filtro" class="text-slate-500 hover:text-rojo-fuego text-xs px-1 font-bold cursor-pointer transition">✕</button>
                </form>

                <span id="contador-historial" class="text-xs font-mono bg-slate-900 px-3 py-1 text-mostaza-caliente border border-slate-800 font-bold">0 PEDIDOS</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr class="border-b border-slate-900 bg-slate-900/40 text-slate-400 font-black text-xs uppercase tracking-widest">
                            <th class="p-4">Pedido</th>
                            <th class="p-4">Residente</th>
                            <th class="p-4">Ubicación</th>
                            <th class="p-4">Productos</th>
                            <th class="p-4 text-right">Total</th>
                            <th class="p-4 text-center">Pago</th>
                            <th class="p-4 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-cuerpo" class="divide-y divide-slate-900">
                        <tr><td colspan="7" class="text-center py-12 text-slate-600 text-xs uppercase font-bold tracking-wider">Cargando bitácora...</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
    `;

    const formFiltro = container.querySelector('#form-filtro-avanzado');
    const inputs = {
        desde: container.querySelector('#filtro-desde'),
        hasta: container.querySelector('#filtro-hasta'),
        ubicacion: container.querySelector('#filtro-ubicacion'),
        estado: container.querySelector('#filtro-estado')
    };
    const btnLimpiar = container.querySelector('#btn-limpiar-filtro');
    const tbody = container.querySelector('#tabla-cuerpo');
    const contador = container.querySelector('#contador-historial');

    async function cargarTorres() {
        const selectUbicacion = container.querySelector('#filtro-ubicacion');
        try {
            const torres = await api.get('/historial/torres');
            torres.forEach(item => {
                const option = document.createElement('option');
                option.value = item.torre_bloque;
                option.textContent = item.torre_bloque;
                selectUbicacion.appendChild(option);
            });
        } catch (error) {
            console.error('No se pudieron cargar las torres:', error);
        }
    }

    async function cargarHistorial() {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-rojo-fuego text-xs animate-pulse font-bold uppercase tracking-wider">Filtrando registros...</td></tr>`;

        try {
            // Creamos un objeto limpio solo con los filtros que tienen valor
            const filtros = {};
            if (inputs.desde.value && inputs.hasta.value) {
                filtros.desde = inputs.desde.value;
                filtros.hasta = inputs.hasta.value;
            }
            if (inputs.ubicacion.value) filtros.ubicacion = inputs.ubicacion.value;
            if (inputs.estado.value) filtros.estado = inputs.estado.value;

            // Construimos la URL solo con los parámetros presentes
            const query = new URLSearchParams(filtros).toString();
            const archivados = await api.get(`/historial${query ? '?' + query : ''}`);

            contador.textContent = `${archivados.length} PEDIDO${archivados.length !== 1 ? 'S' : ''}`;
            tbody.innerHTML = '';

            if (archivados.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-500 text-xs uppercase font-bold tracking-wider">No hay resultados.</td></tr>`;
                return;
            }

            archivados.forEach(pedido => tbody.appendChild(FilaHistorial({ pedido })));
        } catch (error) {
            showToast('Error al cargar la bitácora.', 'error');
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-rojo-fuego text-xs font-bold uppercase tracking-wider">⚠️ Fallo de comunicación.</td></tr>`;
        }
    }

    formFiltro.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Validación básica de rango de fechas si se usan ambas
        if ((inputs.desde.value && !inputs.hasta.value) || (!inputs.desde.value && inputs.hasta.value)) {
            showToast('Para filtrar por fecha, selecciona ambos campos.', 'info');
            return;
        }
        await cargarHistorial();
    });

    btnLimpiar.addEventListener('click', async () => {
        formFiltro.reset();
        await cargarHistorial();
    });

    await cargarTorres();
    await cargarHistorial();
    return container;
}