# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Copy shared types to the correct relative path
COPY shared/ ./shared/

# Set up frontend in subfolder to maintain relative paths
WORKDIR /build/frontend

# Copy frontend files
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /build/frontend/dist /usr/share/nginx/html

# Copy nginx template (envsubst will render it at runtime)
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

# Default backend host for docker-compose compatibility
ENV BACKEND_HOST=admin
ENV BACKEND_PORT=3001

EXPOSE 80

# The official nginx image entrypoint processes /etc/nginx/templates/*.template
# via envsubst, outputting to /etc/nginx/conf.d/. It only substitutes actual
# environment variables, preserving nginx variables ($uri, $host, etc.).
CMD ["nginx", "-g", "daemon off;"]
