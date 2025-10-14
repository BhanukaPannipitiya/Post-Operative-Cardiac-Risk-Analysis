#!/bin/bash

# Docker Build Test Script
echo "🐳 Testing Cardiac AI Docker Build..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    echo "   Then run: docker build -t cardiac-ai-app ."
    exit 1
fi

echo "✅ Docker daemon is running"

# Test the build
echo "🔨 Building Docker image..."
if docker build -t cardiac-ai-app .; then
    echo "✅ Docker build successful!"
    echo ""
    echo "🚀 To run the container:"
    echo "   docker run -p 80:80 -p 8000:8000 cardiac-ai-app"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:80"
    echo "   Backend:  http://localhost:8000"
    echo ""
    echo "📋 Or use Docker Compose:"
    echo "   docker-compose -f docker-compose.prod.yml up"
else
    echo "❌ Docker build failed. Check the error messages above."
    exit 1
fi
