#!/bin/bash

# Render Deployment Helper Script
echo "🚀 Preparing Cardiac AI for Render deployment..."

# Check if we're in the right directory
if [ ! -f "backend/app/app.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if model files exist
if [ ! -d "backend/models" ] || [ ! -f "backend/models/xgb_final_full_model.joblib" ]; then
    echo "❌ Model files not found in backend/models/"
    echo "Please ensure all model files are present before deployment"
    exit 1
fi

echo "✅ Model files verified"

# Check if requirements.txt exists
if [ ! -f "backend/app/requirements.txt" ]; then
    echo "❌ requirements.txt not found in backend/app/"
    exit 1
fi

echo "✅ Backend requirements verified"

# Check if package.json exists
if [ ! -f "frontend/package.json" ]; then
    echo "❌ package.json not found in frontend/"
    exit 1
fi

echo "✅ Frontend configuration verified"

echo ""
echo "🎯 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Create a new Web Service for the backend"
echo "4. Create a new Static Site for the frontend"
echo "5. Follow the instructions in RENDER_DEPLOYMENT.md"
echo ""
echo "📋 Important URLs to remember:"
echo "- Backend will be: https://your-backend-name.onrender.com"
echo "- Frontend will be: https://your-frontend-name.onrender.com"
echo ""
echo "🔧 Don't forget to:"
echo "- Set REACT_APP_API_URL environment variable in frontend"
echo "- Update CORS settings in backend for production"
echo ""
echo "✨ Ready for deployment!"
