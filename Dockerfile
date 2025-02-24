# Usa un'immagine leggera di Nginx
FROM nginx:alpine

# Copia i file HTML, CSS e JS nella directory predefinita di Nginx
COPY . /usr/share/nginx/html

# Espone la porta 80
EXPOSE 80