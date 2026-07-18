import api from '../../services/api.js';

export async function renderLogin() {
    const container = document.createElement('div');
    container.className = 'flex items-center justify-center min-h-screen bg-slate-950';

    container.innerHTML = `
        <div class="w-full max-w-md p-8 bg-slate-900 border border-slate-800 shadow-2xl">
            <header class="mb-8 text-center">
                <h1 class="text-4xl font-black text-white uppercase tracking-tighter">HOUSE GRILL 6</h1>
                <p class="text-xs text-mostaza-caliente mt-2 font-bold uppercase tracking-widest">Acceso Administrativo</p>
            </header>

            <form id="login-form" class="space-y-4">
                <div>
                    <input type="text" id="username" placeholder="USUARIO" required
                        class="w-full bg-slate-950 border border-slate-700 text-white p-3 font-black uppercase focus:outline-none focus:border-rojo-fuego">
                </div>
                <div>
                    <input type="password" id="password" placeholder="CONTRASEÑA" required
                        class="w-full bg-slate-950 border border-slate-700 text-white p-3 font-black uppercase focus:outline-none focus:border-rojo-fuego">
                </div>
                <button type="submit" 
                    class="w-full bg-rojo-fuego hover:bg-red-700 text-white font-black py-4 uppercase tracking-widest transition">
                    Ingresar al Sistema
                </button>
            </form>
            <div id="login-error" class="hidden mt-4 text-center text-xs font-bold text-rojo-fuego uppercase tracking-wider"></div>
        </div>
    `;

    const form = container.querySelector('#login-form');
    const errorDiv = container.querySelector('#login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = container.querySelector('#username').value;
        const password = container.querySelector('#password').value;

        try {
            const { token } = await api.post('/auth/login', { username, password });
            sessionStorage.setItem('token', token);
            window.location.hash = '#estadisticas'; // Redirigir tras login
        } catch (err) {
            errorDiv.textContent = 'Acceso denegado: Credenciales incorrectas';
            errorDiv.classList.remove('hidden');
        }
    });

    return container;
}