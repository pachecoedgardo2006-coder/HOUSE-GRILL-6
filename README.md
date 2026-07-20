# 🪵 House Grill 6 - Dashboard de Administración para Restaurantes

House Grill 6 es un panel de control administrativo unificado y de alta eficiencia, diseñado exclusivamente para la gestión operativa interna de restaurantes de comidas rápidas que operan dentro de conjuntos residenciales.

A diferencia de las aplicaciones comerciales tradicionales, este sistema centraliza el flujo logístico, financiero y de inventario desde una única interfaz de administrador, eliminando la necesidad de infraestructura física local y operando bajo un entorno 100% cloud.

---

## ☁️ Arquitectura Cloud & Despliegue en la Nube

El sistema se encuentra completamente descentralizado y distribuido en servicios especializados en la nube para garantizar alta disponibilidad, velocidad y optimización de recursos:

-   ****Frontend (Netlify):**** El cliente SPA está desplegado estáticamente en la infraestructura global de Netlify (`[https://housegrill6.netlify.app](https://housegrill6.netlify.app)`), permitiendo cargas ultrarrápidas y gestión de rutas basadas en Hash de manera fluida.
-   ****Backend (Render):**** El servidor monolítico basado en Node.js y Express corre en un contenedor web en la nube de Render (`[https://housegrill-6.onrender.com](https://housegrill-6.onrender.com)`), configurado con validación de conectividad al arranque (`SELECT NOW()`)y manejo seguro de variables de entorno.
-   ****Base de Datos (Supabase / PostgreSQL):**** La persistencia de datos se aloja en los servidores cloud de Supabase. El backend se comunica de forma segura mediante conexiones cifradas SSLutilizando el puerto del ****Transaction Pooler (6543)**** y direccionamiento IP IPv4 fijo para garantizar compatibilidad con restricciones de red en contenedores cloud.

---
## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura de ****Monorepo**** limpia y desacoplada, priorizando la ligereza, la velocidad de carga y la ausencia de frameworks pesados en el frontend:

-   ****Frontend:**** Vite + JavaScript Vanilla (Manipulación modular estructurada del DOM mediante funciones nativas).
-   ****Estilos:**** Tailwind CSS v4 con una estética unificada ****Urbana, Agresiva e Industrial de Parrilla al Carbón**** (Fondo oscuro extremo en `bg-slate-950`, bordes y separadores duros en `slate-900` / `border-slate-900`, acentuación cromática en Rojo Fuego `#e61919` y Mostaza Caliente `#ffb700`, tipografías pesadas y masivas `font-black` / `font-extrabold`, tracking cerrado/bloqueado `letter-spacing: -0.05em`, texto estrictamente en `uppercase` y acabados rectos `rounded-none`).
-   ****HTTP Client:**** Axios (Configurado mediante una instancia centralizada orientada al prefijo `/api`).
-   ****Backend:**** Node.js, Express Framework, cors para gestión estricta de políticas de acceso cruzado con Netlify, y dotenv con soporte de rutas absolutas para entornos monorepo.
-   ****Auth & Seguridad:**** ****JSON Web Tokens**** (JWT) para gestión de sesiones, ****bcryptjs**** para el hashing de contraseñas de administrador, y middlewares de autorización para protección de rutas API
-   ****Base de Datos****: Supabase (PostgreSQL) para escalabilidad, persistencia en la nube y gestión robusta de tipos de datos, reemplazando la arquitectura local anterior y manejo de tipos de datos en tiempo real mediante el driver `pg`.
- ****Desarrollo:**** ****Concurrently**** para la gestión unificada de procesos en el monorepo.
---

## 📂 Arquitectura del Sistema

```text
HOUSE-GRILL-6/
├── .env                                   # Variables de entorno globales (Raíz)
├── Dockerfile                             # Configuración de contenedor para despliegue en Render
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                      # Conexión a Supabase (Pool + SSL + IPv4 fija)[cite: 4]
│   │   ├── controllers/                   # Lógica de negocio y gestión de peticiones
│   │   │   ├── auth.controller.js         # Autenticación y firma de JWT
│   │   │   ├── estadisticas.controller.js 
│   │   │   ├── historial.controller.js    
│   │   │   ├── inventario.controller.js   
│   │   │   └── pedidos.controller.js      # Operaciones críticas de cocina/reparto
│   │   ├── middleware/
│   │   │   └── authMiddleware.js          # Verificación JWT con clave secreta
│   │   └── routes/                        # Definición de endpoints de la API (/api)
│   │       ├── estadisticas.routes.js     
│   │       ├── historial.routes.js        
│   │       ├── inventario.routes.js       
│   │       └── pedidos.routes.js          
│   ├── app.js                             # Configuración de Express, CORS y enrutamiento[cite: 2]
│   ├── agregar_admin_supabase.js          # Script auxiliar para población de admin[cite: 6]
│   └── index.js                           # Punto de entrada (Healthcheck DB + arranque)[cite: 1, 4]
│ 
├── frontend/
│   ├── public/                            # Recursos estáticos globales
│   ├── src/
│   │   ├── components/                    # Componentes modulares reutilizables
│   │   ├── services/                      
│   │   │   └── api.js                     # Instancia centralizada de Axios apuntando a Render
│   │   ├── views/                         # Secciones estructuradas de la SPA (Login, Pedidos, etc.)
│   │   ├── main.js                        # Router centralizado (Hash-based) y orquestador
│   │   └── style.css                      # Estilos globales y Tailwind CSS v4
│   ├── index.html                         # Contenedor raíz de la aplicación
│   └── vite.config.js                     # Configuración del empaquetador Vite
│
├── .gitignore                             # Exclusión de .env y node_modules
├── package.json                           # Scripts globales del Monorepo
└── README.md                              # Documentación técnica del sistema
```

---

## ⚙️ Módulos del Core Operativo

1.  **Estadísticas Avanzadas:** Panel analítico estructurado en 3 zonas de control (Gestión Financiera, Control Operativo/Logística, y Mapeo de Demanda) asistido por componentes gráficos basados en barras de progreso CSS nativas para el monitoreo de stock crítico y platos más vendidos.
2.  **Gestión de Pedidos Residenciales:** Flujo modular interactivo para capturar de manera obligatoria la ubicación exacta del residente (Torre, Bloque, Apartamento, Teléfono), así como el cálculo logístico automatizado del vuelto o cambio requerido para el domiciliario según el método de pago.
3.  **Auditoría de Inventario:** Tabla dinámica con transacciones SQL atómicas. Reduce automáticamente los insumos con cada compra confirmada y devuelve el stock al inventario de forma inmediata y automática en caso de cancelaciones para evitar la corrupción de datos.

---

## Seguridad y Control de Acceso

El sistema implementa una capa de protección estricta para el acceso al panel administrativo:

1.  ****Protección de Rutas (SPA Router):**** El router centralizado en `main.js` intercepta toda la navegación. Si no existe un token válido en `sessionStorage`, el sistema bloquea cualquier intento de acceso a vistas privadas y redirige forzosamente al módulo de autenticación.
2.  ****Middleware de Autorización:**** El backend protege todas las rutas críticas de la API. Toda solicitud a los recursos requiere un token JWT válido, asegurando que solo usuarios autenticados realicen consultas o modificaciones.
3.  ****Gestión de Sesiones:**** El sistema permite el cierre de sesión seguro, eliminando inmediatamente el token del navegador y destruyendo la instancia de acceso, lo cual impide el reingreso sin credenciales.
4.  ****Cifrado de Credenciales:**** Las contraseñas no se almacenan como texto plano; se utiliza el algoritmo `bcrypt` (factor de costo 10) para proteger la integridad de las credenciales de administrador ante cualquier acceso no autorizado a la base de datos.

---

## 📝 Reglas de Diseño e Ingeniería

* **Sin Frameworks Reactivos:** El frontend se rige por un ciclo de vida limpio manipulando nodos del DOM (`document.createElement`). Se limpian estrictamente los contenedores (`innerHTML = ''`) antes de nuevas instancias para evitar fugas de memoria y duplicidad de escuchadores de eventos.
* **Persistencia en la Nube:** Se utiliza Supabase como fuente única de verdad para el flujo operativo; todas las operaciones interactúan directamente con PostgreSQL a través de la API, garantizando sincronización y consistencia de datos en tiempo real.

---

## 🔐 Configuración de Variables de Entorno

El proyecto utiliza un archivo `.env` en la raíz para gestionar credenciales sensibles. Crea este archivo y define las siguientes variables:

- `PORT`: Puerto donde correrá el servidor backend (ej. 3000).
- `JWT_SECRET`: Clave secreta para la firma de tokens (debe ser una cadena larga y aleatoria).
- `DATABASE_URL`: Cadena de conexión a tu base de datos Supabase (PostgreSQL).

*Nota: Asegúrate de que el archivo `.env` esté incluido en tu `.gitignore` para evitar exponer información sensible. Para entornos cloud como Render, asegúrate de configurar la DATABASE_URL apuntando al Transaction Pooler (puerto 6543) usando direccionamiento IPv4 para evitar bloqueos de red.*

---