# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom nginx config to handle SPA routing if needed (though we use a main nginx proxy)
RUN printf "server {\n    listen 80;\n    root /usr/share/nginx/html;\n    index index.html;\n    location / {\n    try_files \$uri \$uri/ /index.html;\n    }\n    gzip on;\n    gzip_types text/plain text/css application/json application/javascript;\n    }\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
