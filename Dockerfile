# Stage 1: Build Expo web static site
FROM node:20-alpine AS builder

WORKDIR /app

# Install OS deps (if needed for sharp/canvas; keep small)
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build static web using Expo Router static export
# Expo SDK 54 supports `expo export --platform web`
RUN npx expo export --platform web --output-dir dist


# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine AS runner

WORKDIR /usr/share/nginx/html

# Remove default content and copy our build
RUN rm -rf ./*
COPY --from=builder /app/dist ./

# Add custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


