# Docker Deployment Guide

This guide covers deploying your Cardiac AI application using Docker containers.

## 🐳 Docker Setup Overview

Your application now supports multiple deployment strategies:

1. **Development**: Separate containers for frontend and backend
2. **Production**: Single container with both services
3. **Render Deployment**: Single container optimized for cloud deployment

## 🚀 Quick Start

### Development Mode (Separate Containers)
```bash
# Build and start both services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Production Mode (Single Container)
```bash
# Build and start production container
docker-compose -f docker-compose.prod.yml up --build

# Access the application
# Frontend: http://localhost:80
# Backend: http://localhost:8000
```

## 📋 Docker Commands Reference

### Development
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Production
```bash
# Start production container
docker-compose -f docker-compose.prod.yml up -d

# Rebuild production container
docker-compose -f docker-compose.prod.yml up --build

# Stop production container
docker-compose -f docker-compose.prod.yml down

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Manual Docker Commands
```bash
# Build single container
docker build -t cardiac-ai-app .

# Run single container
docker run -p 80:80 -p 8000:8000 cardiac-ai-app

# Build backend only
docker build -t cardiac-ai-backend ./backend

# Build frontend only
docker build -t cardiac-ai-frontend ./frontend
```

## 🌐 Render Deployment with Docker

### Step 1: Prepare for Render
1. Ensure your code is pushed to GitHub
2. Use the single container approach for Render

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `cardiac-ai-app`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free (or upgrade as needed)
5. Click "Create Web Service"

### Step 3: Environment Variables (Optional)
- `PORT`: `80` (Render will set this automatically)
- `PYTHONUNBUFFERED`: `1`

## 🔧 Configuration Details

### Frontend Configuration
- **Development**: Uses `http://localhost:8000/predict`
- **Production**: Uses `/api/predict` (proxied through nginx)
- **Auto-detection**: Automatically switches based on environment

### Backend Configuration
- **Port**: 8000 (internal)
- **CORS**: Configured for all origins
- **Model Loading**: Automatic on startup

### Nginx Configuration
- **Frontend**: Serves React app on port 80
- **API Proxy**: Routes `/api/*` to backend on port 8000
- **Static Assets**: Cached for 1 year
- **Security Headers**: Basic security headers included

## 🏗️ Architecture

### Development Mode
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (nginx:80)    │    │   (FastAPI:8000)│
│   localhost:3000│    │   localhost:8000│
└─────────────────┘    └─────────────────┘
```

### Production Mode
```
┌─────────────────────────────────────────┐
│           Single Container              │
│  ┌─────────────┐    ┌─────────────────┐ │
│  │   Frontend  │    │   Backend       │ │
│  │   (nginx:80)│    │   (FastAPI:8000)│ │
│  └─────────────┘    └─────────────────┘ │
│  localhost:80       localhost:8000      │
└─────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :80
   lsof -i :8000
   lsof -i :3000
   ```

2. **Build Failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs <container_id>
   
   # Check Docker Compose logs
   docker-compose logs
   ```

### Debugging Commands
```bash
# Enter running container
docker exec -it <container_id> /bin/sh

# Check container status
docker ps -a

# Check Docker Compose services
docker-compose ps

# View resource usage
docker stats
```

## 📊 Performance Optimization

### Production Optimizations
- **Multi-stage builds**: Smaller final image size
- **Nginx caching**: Static assets cached for 1 year
- **Gzip compression**: Enabled for text files
- **Health checks**: Automatic container health monitoring

### Resource Limits
```yaml
# Add to docker-compose.prod.yml
services:
  cardiac-ai-app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🔒 Security Considerations

### Production Security
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **CORS configuration**: Restrict origins in production
- **Environment variables**: Use for sensitive data
- **Container scanning**: Regular security scans

### Environment Variables
```bash
# Create .env file for sensitive data
echo "SECRET_KEY=your-secret-key" > .env
echo "DATABASE_URL=your-database-url" >> .env
```

## 🎯 Next Steps

1. **Test locally**: Use `docker-compose up --build`
2. **Deploy to Render**: Use single container approach
3. **Monitor**: Check logs and performance
4. **Scale**: Consider upgrading Render plan if needed

## 📞 Support

If you encounter issues:
1. Check Docker logs: `docker-compose logs`
2. Verify configuration files
3. Test individual services
4. Check Render deployment logs
