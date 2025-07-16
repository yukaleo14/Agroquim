# Usar una imagen oficial de Node.js (versión LTS)
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto del backend
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]