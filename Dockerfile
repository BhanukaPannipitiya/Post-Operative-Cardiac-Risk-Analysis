# Ultra-simple Dockerfile for Cardiac AI
FROM python:3.11-slim

# Install system dependencies including Node.js and nginx
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY backend/app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Install and build frontend
COPY frontend/package.json ./frontend/
COPY frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ .
RUN npm run build

# Configure nginx
WORKDIR /app
RUN echo 'server {' > /etc/nginx/sites-available/default && \
    echo '    listen 80;' >> /etc/nginx/sites-available/default && \
    echo '    root /app/frontend/build;' >> /etc/nginx/sites-available/default && \
    echo '    index index.html;' >> /etc/nginx/sites-available/default && \
    echo '    location / {' >> /etc/nginx/sites-available/default && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/sites-available/default && \
    echo '    }' >> /etc/nginx/sites-available/default && \
    echo '    location /api/ {' >> /etc/nginx/sites-available/default && \
    echo '        proxy_pass http://localhost:8000/;' >> /etc/nginx/sites-available/default && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/sites-available/default && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/sites-available/default && \
    echo '    }' >> /etc/nginx/sites-available/default && \
    echo '}' >> /etc/nginx/sites-available/default

# Create startup script
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'nginx &' >> /start.sh && \
    echo 'cd /app/backend && uvicorn app.app:app --host 0.0.0.0 --port 8000' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 8000

# Start both services
CMD ["/start.sh"]
