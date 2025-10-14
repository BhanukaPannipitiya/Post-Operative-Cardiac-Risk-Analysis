# Multi-stage Dockerfile for production deployment
# Stage 1: Build frontend
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build

# Stage 2: Build backend
FROM python:3.11-slim as backend-build

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Stage 3: Production image with nginx
FROM nginx:alpine

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip gcc musl-dev python3-dev

# Copy Python dependencies from backend stage
COPY --from=backend-build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin

# Copy backend application
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx &' >> /start.sh && \
    echo 'cd /app/backend && uvicorn app.app:app --host 0.0.0.0 --port 8000' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 8000

# Start both services
CMD ["/start.sh"]
