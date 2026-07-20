# Usamos una imagen oficial y ligera de Node.js
FROM node:20-alpine

# Creamos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y package-lock.json (si lo tienes) específicamente de la carpeta backend
COPY backend/package*.json ./backend/

# Instalamos las dependencias exclusivamente para producción
RUN cd backend && npm install --production

# Copiamos el resto del código fuente del backend al contenedor
COPY backend/ ./backend/

# Exponemos el puerto en el que corre el servidor (por defecto 3000 o el que asigne la nube)
EXPOSE 3000

# Comando para arrancar el servidor backend
CMD ["node", "backend/index.js"]