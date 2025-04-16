# Étape 1 : Build de l'application Angular
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Étape 2 : Serveur Nginx pour l'app compilée
FROM nginx:alpine
COPY --from=builder /app/dist/nom-de-ton-projet-angular /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
