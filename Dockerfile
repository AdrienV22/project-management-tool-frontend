# Étape 1 : Build de l'app Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production --project project-management-tool-frontend

# Étape 2 : Utilisation de Nginx pour servir les fichiers buildés
FROM nginx:stable-alpine
COPY --from=build /app/dist/project-management-tool-frontend /usr/share/nginx/html
EXPOSE 80
