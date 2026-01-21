# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy admin package files
COPY admin/package*.json ./

# Install dependencies
RUN npm install

# Copy admin source (includes types)
COPY admin/src ./src
COPY admin/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY admin/package*.json ./
RUN npm install --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist

# Copy config directory (needed at runtime)
COPY admin/src/config ./dist/src/config

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/src/index.js"]
