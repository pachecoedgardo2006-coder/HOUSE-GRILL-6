# 🌌 ResiFoods - Dashboard de Administración para Restaurantes

ResiFoods es un panel de control administrativo unificado y de alta eficiencia, diseñado exclusivamente para la gestión operativa interna de restaurantes de comidas rápidas que operan dentro de conjuntos residenciales.

A diferencia de las aplicaciones comerciales tradicionales, este sistema centraliza el flujo logístico, financiero y de inventario desde una única interfaz de administrador, eliminando la necesidad de infraestructura pública o perfiles de clientes externos.

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura de **Monorepo** limpia y desacoplada, priorizando la ligereza, la velocidad de carga y la ausencia de frameworks pesados en el frontend:

* **Frontend:** Vite + JavaScript Vanilla (Manipulación modular estructurada del DOM mediante funciones nativas).
* **Estilos:** Tailwind CSS v4 con una estética unificada **"Dark Mystic" / Cyberpunk** (Fondos oscuros en `bg-slate-950`, bordes sutiles en `slate-900` y efectos de transparencia antialiased).
* **HTTP Client:** Axios (Configurado mediante una instancia centralizada orientada al prefijo `/api`).
* **Backend:** Node.js + Express Framework.
* **Base de Datos:** SQLite 3 (Persistencia local integrada en un archivo `.db` controlado mediante consultas nativas por promesas, garantizando cero costos de mantenimiento en la nube).

---

## 📂 Arquitectura del Sistema

```text
dashboard-restaurante/
├── backend/
│   ├── data/
│   │   └── restaurante.db         # Base de datos SQLite nativa (Auto-creada)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Conexión e inicialización del esquema SQL
│   │   ├── controllers/           # Controladores de pedidos, inventario y métricas
│   │   ├── routes/                # Enrutador de la API REST (/api)
│   │   └── app.js                 # Express App y middlewares de producción
│   └── index.js                   # Punto de entrada del servidor backend
└── frontend/
    ├── src/
    │   ├── assets/                # Multimedia y recursos visuales
    │   ├── components/            # Componentes modulares reutilizables del DOM
    │   ├── services/              # Instancia base de Axios
    │   ├── views/                 # Vistas dinámicas de la SPA (Single Page Application)
    │   └── main.js                # Orquestador central y Router basado en Hash (#)
    ├── index.html                 # Punto de entrada y contenedor principal de la UI
    └── vite.config.js             # Configuración del empaquetador Vite

```

---

## ⚙️ Módulos del Core Operativo

1. **Estadísticas Avanzadas:** Panel analítico estructurado en 3 zonas de control (Gestión Financiera, Control Operativo/Logística, y Mapeo de Demanda) asistido por componentes gráficos basados en barras de progreso CSS nativas para el monitoreo de stock crítico y platos más vendidos.
2. **Gestión de Pedidos Residenciales:** Flujo modular interactivo para capturar de manera obligatoria la ubicación exacta del residente (Torre, Bloque, Apartamento, Teléfono), así como el cálculo logístico automatizado del vuelto o cambio requerido para el domiciliario según el método de pago.
3. **Auditoría de Inventario:** Tabla dinámica con transacciones SQL atómicas. Reduce automáticamente los insumos con cada compra confirmada y devuelve el stock al inventario de forma inmediata y automática en caso de cancelaciones para evitar la corrupción de datos.

---

## 📝 Reglas de Diseño e Ingeniería

* **Sin Frameworks Reactivos:** El frontend se rige por un ciclo de vida limpio manipulando nodos del DOM (`document.createElement`). Se limpian estrictamente los contenedores (`innerHTML = ''`) antes de nuevas instancias para evitar fugas de memoria y duplicidad de escuchadores de eventos.
* **Persistencia Real:** Se prohíbe el uso de almacenamiento volátil del navegador (`localStorage`) para el flujo operativo; todas las operaciones interactúan directamente con la base de datos local a través de bloques `async/await` controlados.

---

# 📖 Manual de Instalación y Despliegue Local

* **Proyecto:** ResiFoods (Dashboard de Administración)
* **Arquitectura:** Monorepo (Backend: Node.js/Express | Frontend: Vite + Vanilla JS)
* **Base de Datos:** SQLite 3 (Nativa, sin ORM)
* **Entorno de Destino:** Windows 10 / 11

Este manual detalla los pasos requeridos para clonar, configurar, compilar e instalar la aplicación en una máquina de producción (Windows) de forma limpia.

### 📋 Requisitos Previos en la Máquina Destino

1. **Node.js** (Versión LTS estable recomendada: v22 o superior).
* Descargar e instalar desde el sitio oficial.
* Verificar instalación en la terminal (CMD o PowerShell) ejecutando:
```bash
node -v
npm -v

```




2. Un **navegador web** moderno (Google Chrome o Microsoft Edge recomendado).

---

### 🚀 Paso 1: Transferencia y Limpieza de Archivos

1. Copiar la carpeta raíz del proyecto `dashboard-restaurante/` en el disco local de la máquina destino (Ejemplo recomendado: `C:\ResiFoods`).
2. **IMPORTANTE:** Asegurarse de **NO** copiar las carpetas `node_modules/` del backend ni del frontend, ya que se generarán limpiamente en el destino.

---

### ⚙️ Paso 2: Modificaciones y Configuraciones de Código (Producción)

#### [A] Configuración del HTTP Client (Frontend)

* **Ubicación:** `frontend/src/services/api.js`
* **Acción:** La instancia centralizada de Axios debe apuntar a rutas relativas orientadas al prefijo `/api`. Asegurarse de que no apunte a un `localhost` estático con un puerto harcodeado en desarrollo.
* **Ejemplo:**
```javascript
const api = axios.create({ baseURL: '/api' });

```



#### [B] Configuración del Servidor Express (Backend)

* **Ubicación:** `backend/src/app.js`
* **Acción:** Añadir los middlewares para servir el frontend compilado (Vite Build) de manera estática unificada. Colocar este bloque **ANTES** de definir las rutas de la API (`/api/pedidos`, `/api/inventario`, etc.).
* **Código a integrar/verificar:**
```javascript
const path = require('path');

// Servir archivos estáticos del build del frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Redirección de la raíz al index.html de la SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

```



---

### 📦 Paso 3: Instalación de Dependencias y Compilación (Build)

Abrir una terminal (CMD o PowerShell) y ejecutar los siguientes comandos:

1. **Compilar el Frontend** (Optimización de assets, CSS v4 y JS modular):
```bash
cd C:\ResiFoods\frontend
npm install
npm run build

```


> 💡 **Nota:** Esto creará la carpeta `frontend/dist/` con los archivos listos para ser servidos de manera eficiente por Express.


2. **Instalar dependencias del Backend:**
```bash
cd C:\ResiFoods\backend
npm install

```


> 💡 **Nota:** Al ejecutar el servidor por primera vez, el script de configuración `backend/src/config/db.js` creará automáticamente el archivo de la base de datos local `backend/data/restaurante.db` y sus respectivas tablas.



---

### 🤖 Paso 4: Automatización del Arranque para el Usuario Final

Para evitar que el administrador del local interactúe con la terminal, se creará un script ejecutable automatizado:

1. En la raíz del proyecto (`C:\ResiFoods\`), crear un archivo de texto vacío.
2. Renombrar el archivo a: `arrancar.bat` (asegurarse de cambiar la extensión `.txt`).
3. Hacer clic derecho > **Editar**, y pegar el siguiente script:

```batch
@echo off
title Servidor ResiFoods
echo ==========================================
echo       INICIANDO SISTEMA RESIFOODS        
echo ==========================================
cd C:\ResiFoods\backend
:: Arranca el backend de forma minimizada en segundo plano
start /min cmd /c "npm start"
echo Esperando inicializacion de la Base de Datos...
timeout /t 3 /nobreak > null
echo Abriendo Dashboard de Administracion...
:: Abre el navegador por defecto en el puerto correspondiente
start http://localhost:3000
exit

```

4. **Crear Acceso Directo:**
* Clic derecho sobre `arrancar.bat` > **Enviar a** > **Escritorio (crear acceso directo)**.
* Renombrar el acceso directo del escritorio a: `"Iniciar ResiFoods"`.
* *(Opcional)* Cambiar el icono por el logo del restaurante en las propiedades del acceso directo.



---

### 💾 Paso 5: Mantenimiento y Respaldo de Datos (Backups)

Dado que la persistencia se realiza localmente en SQLite, toda la información financiera, inventario y pedidos reside en un solo archivo: `backend/data/restaurante.db`.

* Se recomienda programar una copia automática de este archivo al finalizar la jornada hacia un almacenamiento en la nube (Google Drive, OneDrive) o una unidad USB externa para prevenir pérdidas por fallos de hardware.