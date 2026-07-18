export function CardMetrica({ titulo, valor, icono, color, bgIcono }) {
    // Lógica para formatear números con comas y puntos
    let valorDisplay = valor;
    
    // Detectamos si el valor es un número o un string que representa dinero
    const esPrecio = titulo.toLowerCase().includes('ingresos') || 
                     titulo.toLowerCase().includes('total') || 
                     titulo.toLowerCase().includes('promedio') || 
                     titulo.toLowerCase().includes('cambio');

    if (esPrecio && typeof valor === 'string') {
        // Limpiamos el símbolo de moneda para convertir a número
        const numeroLimpio = parseFloat(valor.replace('$', '').replace(/,/g, ''));
        
        if (!isNaN(numeroLimpio)) {
            // Aplicamos formato colombiano (puntos para miles, coma para decimales)
            valorDisplay = '$' + numeroLimpio.toLocaleString('es-CO', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
        }
    }

    const card = document.createElement('div');
    card.className = 'bg-linear-to-br from-slate-950 to-slate-900 border border-slate-900/80 hover:border-red-900/30 rounded-2xl p-6 shadow-md transition-all flex items-center justify-between min-w-0';
    card.innerHTML = `
        <div class="min-w-0 flex-1 pr-3">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">${titulo}</p>
            <h3 class="text-2xl font-black ${color} mt-2 tracking-tight truncate">${valorDisplay}</h3>
        </div>
        <span class="text-2xl ${bgIcono} p-3 rounded-xl border shrink-0 transition-transform hover:scale-105">${icono}</span>
    `;
    return card;
}