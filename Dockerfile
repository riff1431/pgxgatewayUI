# Stage 1: Build the React + Vite application
FROM node:22-alpine AS builder

WORKDIR /app

# Support build-time environment variables for Dokploy
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy all source files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve application with high-performance Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for React Router SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port for Dokploy Traefik proxy
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
