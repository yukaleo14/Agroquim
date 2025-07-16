# Usar una imagen oficial de Nginx
FROM nginx:alpine

# Copiar los archivos estáticos del frontend
COPY . /usr/share/nginx/html

# Exponer el puerto del frontend
EXPOSE 80

# Nginx se inicia automáticamente, no se necesita CMD