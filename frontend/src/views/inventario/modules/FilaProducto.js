export function FilaProducto({ producto, onEditar }) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-900/40 transition-colors border-b border-slate-900 group';
    
    const esStockBajo = producto.stock <= 5;

    tr.innerHTML = `
        <td class="py-3 px-4 font-mono text-xs text-slate-500 group-hover:text-mostaza-caliente transition-colors">#${producto.id}</td>
        <td class="py-3 px-4 font-black text-white uppercase tracking-tight">${producto.nombre}</td>
        <td class="py-3 px-4 text-xs text-slate-400 max-w-xs truncate uppercase font-semibold tracking-wide">${producto.descripcion || '-'}</td>
        <td class="py-3 px-4 font-mono font-black text-slate-200">$${Number(producto.precio).toFixed(2)}</td>
        <td class="py-3 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider ${
                esStockBajo ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-900 text-mostaza-caliente border border-slate-800'
            }">
                ${producto.stock} U. ${esStockBajo ? '(¡Bajo!)' : ''}
            </span>
        </td>
        <td class="py-3 px-4 text-right">
            <button class="bg-slate-900 hover:bg-rojo-fuego text-slate-300 hover:text-white border border-slate-800 hover:border-rojo-fuego text-xs font-black py-1 px-3 rounded-none transition uppercase tracking-wider btn-edit cursor-pointer">
                Modificar
            </button>
        </td>
    `;

    tr.querySelector('.btn-edit').addEventListener('click', () => onEditar(producto));
    return tr;
}