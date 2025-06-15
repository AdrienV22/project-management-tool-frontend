# Étape 1 : Build de l'app Angular
FROM node:21.7.1-alpine3.19 AS build
WORKDIR /app

# Copier seulement les fichiers nécessaires (évite de copier tout le répertoire)
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production --project project-management-tool-frontend

# Étape 2 : Utilisation de Nginx pour servir les fichiers buildés
FROM nginx:1.25.4-alpine-slim

# Security hardening
RUN apk add --no-cache tini && \
    rm -rf /var/cache/apk/* && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    # Remove unnecessary files
    rm -rf /etc/nginx/conf.d/default.conf && \
    rm -rf /usr/share/nginx/html/* && \
    # Create non-root user
    adduser -D -H -u 101 -s /sbin/nologin nginx && \
    # Set proper permissions
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run/nginx.pid

# Add custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés dans le répertoire de NGINX
COPY --from=build /app/dist/project-management-tool-frontend /usr/share/nginx/html

# Exposer le port NGINX
EXPOSE 80

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
