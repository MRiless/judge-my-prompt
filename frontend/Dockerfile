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

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
