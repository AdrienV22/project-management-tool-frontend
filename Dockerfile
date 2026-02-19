# ===============================
# Stage 1 — Build Angular
# ===============================
FROM node:21.7.1-alpine3.19 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ===============================
# Stage 2 — Nginx runtime
# ===============================
FROM nginx:1.25.4-alpine-slim AS runtime

# Install tini + clean default content
RUN apk add --no-cache tini \
  && rm -rf /var/cache/apk/* \
  && rm -f /etc/nginx/conf.d/default.conf \
  && rm -rf /usr/share/nginx/html/*


COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=build /app/dist/project-management-tool-frontend/browser/ /usr/share/nginx/html/

EXPOSE 80

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
