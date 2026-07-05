import { showToast } from './Toast.js'; // Importamos la mini pestaña flotante

export function FormPedido({ productosDisponibles, onGuardarPedido }) {
    const form = document.createElement('form');
    form.id = 'form-pedido';
    form.className = 'space-y-4';
    // Desactiva las sugerencias globales del historial en este formulario
    form.setAttribute('autocomplete', 'off'); 

    let productosSeleccionados = [];

    function render() {
        form.innerHTML = `
            <!-- Datos del Residente -->
            <div class="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Datos de Entrega</p>
                <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Nombre del Residente *</label>
                    <input type="text" id="cliente_nombre" required autocomplete="off" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition uppercase">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Torre / Bloque *</label>
                        <input type="text" id="torre_bloque" required autocomplete="off" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition uppercase">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Apartamento *</label>
                        <input type="text" id="apartamento" required autocomplete="off" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition uppercase">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Teléfono de Contacto *</label>
                    <input type="tel" id="telefono" required autocomplete="off" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition">
                </div>
            </div>

            <!-- Selector de Productos -->
            <div class="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selección de Productos</p>
                <div class="flex gap-2">
                    <select id="select-producto" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                        <option value="">-- Seleccionar Plato/Insumo --</option>
                        ${productosDisponibles.map(p => `
                            <option value="${p.id}" ${p.stock <= 0 ? 'disabled class="text-red-500"' : ''}>
                                ${p.nombre} ($${p.precio}) - Stock: ${p.stock}
                            </option>
                        `).join('')}
                    </select>
                    <button type="button" id="btn-agregar-prod" class="bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center shrink-0">
                        ＋
                    </button>
                </div>
                <div id="lista-items" class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar"></div>
                <div class="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
                    <span class="font-bold text-slate-300">Total Pedido:</span>
                    <span class="text-xl font-black text-emerald-400" id="label-total">$0.00</span>
                </div>
            </div>

            <!-- Logística de Pago -->
            <div class="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Método de Pago y Logística</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Tipo de Pago *</label>
                        <select id="tipo_pago" required class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                    <div id="wrapper-paga-con">
                        <label class="block text-xs font-medium text-slate-300 mb-1">¿Con cuánto paga? *</label>
                        <input type="number" id="paga_con" min="0" step="any" value="0" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                    </div>
                </div>
                <div id="wrapper-cambio" class="flex justify-between items-center p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
                    <span class="text-slate-400">Vuelto/Cambio para Domiciliario:</span>
                    <span class="font-bold text-amber-400 text-sm" id="label-cambio">$0.00</span>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Observaciones / Notas internas</label>
                    <textarea id="observaciones" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none"></textarea>
                </div>
            </div>

            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all text-sm uppercase tracking-wider cursor-pointer">
                Guardar y Despachar Pedido
            </button>
        `;

        configurarEventos();
    }

    function configurarEventos() {
        const btnAgregar = form.querySelector('#btn-agregar-prod');
        const selectProd = form.querySelector('#select-producto');
        const tipoPagoSelect = form.querySelector('#tipo_pago');
        const inputPagaCon = form.querySelector('#paga_con');
        const wrapperPagaCon = form.querySelector('#wrapper-paga-con');
        const wrapperCambio = form.querySelector('#wrapper-cambio');

        btnAgregar.addEventListener('click', () => {
            const prodId = parseInt(selectProd.value);
            if (!prodId) return;

            const prodOriginal = productosDisponibles.find(p => p.id === prodId);
            if (!prodOriginal) return;

            const existente = productosSeleccionados.find(p => p.producto_id === prodId);
            if (existente) {
                if (existente.cantidad < prodOriginal.stock) {
                    existente.cantidad++;
                } else {
                    // Reemplazo del alert nativo
                    showToast(`No puedes superar el stock disponible (${prodOriginal.stock} unidades)`, 'error');
                }
            } else {
                productosSeleccionados.push({
                    producto_id: prodOriginal.id,
                    nombre: prodOriginal.nombre,
                    precio: prodOriginal.precio,
                    cantidad: 1
                });
            }
            actualizarCalculos();
        });

        tipoPagoSelect.addEventListener('change', () => {
            if (tipoPagoSelect.value === 'Transferencia') {
                wrapperPagaCon.classList.add('hidden');
                wrapperCambio.classList.add('hidden');
                inputPagaCon.value = 0;
            } else {
                wrapperPagaCon.classList.remove('hidden');
                wrapperCambio.classList.remove('hidden');
            }
            actualizarCalculos();
        });

        inputPagaCon.addEventListener('input', actualizarCalculos);
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (productosSeleccionados.length === 0) {
                // Reemplazo del alert nativo
                showToast('Debes agregar al menos un producto.', 'error');
                return;
            }

            const total = productosSeleccionados.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
            const tipoPago = tipoPagoSelect.value;
            const pagaConVal = parseFloat(inputPagaCon.value) || 0;

            const data = {
                cliente_nombre: form.querySelector('#cliente_nombre').value.trim().toUpperCase(),
                torre_bloque: form.querySelector('#torre_bloque').value.trim().toUpperCase(),
                apartamento: form.querySelector('#apartamento').value.trim().toUpperCase(),
                telefono: form.querySelector('#telefono').value,
                tipo_pago: tipoPago,
                paga_con: pagaConVal,
                observaciones: form.querySelector('#observaciones').value,
                items: productosSeleccionados
            };
            onGuardarPedido(data);
        });
    }

    function actualizarCalculos() {
        const listaItems = form.querySelector('#lista-items');
        const labelTotal = form.querySelector('#label-total');
        const labelCambio = form.querySelector('#label-cambio');
        const inputPagaCon = form.querySelector('#paga_con');
        const tipoPago = form.querySelector('#tipo_pago').value;

        listaItems.innerHTML = '';
        let total = 0;

        productosSeleccionados.forEach((item, index) => {
            total += item.precio * item.cantidad;
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs';
            div.innerHTML = `
                <div class="min-w-0 flex-1 pr-2">
                    <span class="font-medium text-white block truncate">${item.nombre}</span>
                    <span class="text-slate-500 block">Subtotal: $${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span class="text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">x${item.cantidad}</span>
                    <button type="button" class="text-red-400 hover:text-red-300 font-bold px-1 transition-colors cursor-pointer" data-index="${index}">✕</button>
                </div>
            `;
            div.querySelector('button').addEventListener('click', () => {
                productosSeleccionados.splice(index, 1);
                actualizarCalculos();
            });
            listaItems.appendChild(div);
        });

        labelTotal.textContent = `$${total.toFixed(2)}`;
        if (tipoPago === 'Efectivo') {
            const pagaConVal = parseFloat(inputPagaCon.value) || 0;
            const cambio = pagaConVal - total;
            labelCambio.textContent = cambio > 0 ? `$${cambio.toFixed(2)}` : '$0.00';
        }
    }

    render();
    return form;
}