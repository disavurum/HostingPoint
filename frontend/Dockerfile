# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps for build, and optional deps for Alpine)
RUN npm install

# Copy source code
COPY . .

# Build arguments from Coolify
ARG VITE_API_URL=https://api.hostingpoint.net
ARG VITE_DOMAIN=hostingpoint.net
ARG DOMAIN=hostingpoint.net

# If VITE_API_URL is not provided, construct it from DOMAIN
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DOMAIN=${VITE_DOMAIN:-${DOMAIN}}

# Debug output
RUN echo "=== Build Environment ===" && \
    echo "VITE_API_URL: $VITE_API_URL" && \
    echo "VITE_DOMAIN: $VITE_DOMAIN" && \
    echo "========================"

# Build the application - fail immediately if build fails
RUN set -e && \
    npm run build && \
    echo "=== Build completed ===" && \
    ls -la /app/ && \
    echo "=== Checking dist directory ===" && \
    ls -la /app/dist/ && \
    echo "=== Build successful ==="

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
