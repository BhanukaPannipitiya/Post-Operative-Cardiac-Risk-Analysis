# Render Deployment Guide

This guide will help you deploy both the backend (FastAPI) and frontend (React) to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Model Files**: Ensure all model files are in the `backend/models/` directory

## Backend Deployment (FastAPI)

### Step 1: Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing this project

### Step 2: Configure Backend Service
- **Name**: `cardiac-ai-backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r app/requirements.txt`
- **Start Command**: `uvicorn app.app:app --host 0.0.0.0 --port $PORT`
- **Plan**: Free (or upgrade as needed)

### Step 3: Environment Variables
Add these environment variables in Render dashboard:
- `PYTHON_VERSION`: `3.11.0`

### Step 4: Deploy
Click "Create Web Service" and wait for deployment to complete.

**Note**: The backend URL will be something like `https://cardiac-ai-backend.onrender.com`

## Frontend Deployment (React)

### Step 1: Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository

### Step 2: Configure Frontend Service
- **Name**: `cardiac-ai-frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Plan**: Free (or upgrade as needed)

### Step 3: Environment Variables
**No environment variables needed!** 🎉 

The frontend now automatically detects the backend URL based on the deployment domain. If your frontend is deployed as `my-app.onrender.com`, it will automatically look for the backend at `my-app-backend.onrender.com`.

### Step 4: Deploy
Click "Create Static Site" and wait for deployment to complete.

## 🎯 Automatic Backend URL Detection

The frontend now includes **smart URL detection** that works automatically:

### How It Works:
1. **Development**: Automatically uses `http://localhost:8000/predict`
2. **Production**: Auto-detects backend URL based on frontend domain
   - If frontend is `my-app.onrender.com` → backend becomes `my-app-backend.onrender.com`
3. **Manual Override**: Set `REACT_APP_API_URL` environment variable if needed

### Benefits:
- ✅ **Zero Configuration**: No manual URL setup required
- ✅ **Environment Agnostic**: Works in dev, staging, and production
- ✅ **Automatic Discovery**: Detects backend based on deployment patterns
- ✅ **Fallback Support**: Has sensible defaults if auto-detection fails

## Important Notes

### Backend Considerations
1. **Model Files**: Ensure all `.joblib` files are committed to the repository
2. **File Paths**: The app uses relative paths, which should work on Render
3. **Memory**: Free tier has limited memory - consider upgrading if needed
4. **Cold Starts**: Free tier services sleep after inactivity

### Frontend Considerations
1. **API URL**: Update the `REACT_APP_API_URL` environment variable with your actual backend URL
2. **CORS**: Backend is configured to allow all origins (`*`) - consider restricting in production
3. **Build**: The build process creates optimized production files

### Troubleshooting

#### Backend Issues
- **Import Errors**: Ensure all dependencies are in `requirements.txt`
- **Model Loading**: Check that model files exist in `backend/models/`
- **Memory Issues**: Consider upgrading to paid plan for larger models

#### Frontend Issues
- **API Connection**: Verify the `REACT_APP_API_URL` environment variable
- **Build Failures**: Check that all dependencies are in `package.json`
- **CORS Errors**: Ensure backend CORS settings allow your frontend domain

## Testing Deployment

1. **Backend Test**: Visit `https://your-backend-url.onrender.com/` - should return `{"status":"ok","message":"Cardiac AI API is running 🚀"}`

2. **Frontend Test**: Visit your frontend URL and test the prediction functionality

3. **Integration Test**: Use the frontend to make predictions via the backend API

## Production Considerations

1. **Security**: 
   - Restrict CORS origins to your frontend domain only
   - Add API authentication if needed
   - Use environment variables for sensitive data

2. **Performance**:
   - Consider upgrading to paid plans for better performance
   - Implement caching strategies
   - Monitor resource usage

3. **Monitoring**:
   - Set up logging
   - Monitor API response times
   - Track error rates

## Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set
3. Ensure all dependencies are properly installed
4. Check file paths and permissions
