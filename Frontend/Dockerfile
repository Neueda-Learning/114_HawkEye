# ============================================================
# Stage 1 — Build the React + TypeScript application
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first (layer-cache optimization)
COPY package*.json ./

# Install exact versions from package-lock.json
RUN npm ci

# Copy the rest of the source code
COPY . .

# Compile TypeScript and bundle with Vite
# VITE_API_BASE_URL=/api tells the frontend to call /api/* which
# nginx proxies through to the backend container
RUN VITE_API_BASE_URL=/api npm run build

# ============================================================
# Stage 2 — Serve the production build with nginx
# ============================================================
FROM nginx:1.27-alpine

# Replace the default nginx config with our custom one
# (handles SPA routing and /api proxy to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
