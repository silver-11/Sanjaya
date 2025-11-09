# Complete Setup and Deployment Guide

This guide will walk you through setting up and deploying the Sanjaya Medical AI system from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Setup](#frontend-setup)
3. [Backend Setup](#backend-setup)
4. [Environment Configuration](#environment-configuration)
5. [Model Checkpoints Setup](#model-checkpoints-setup)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Deployment Options](#deployment-options)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (v3.8 or higher)
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

3. **Git**
   - Download: https://git-scm.com/downloads
   - Verify: `git --version`

### Required Accounts & API Keys

1. **Groq API Key**
   - Sign up: https://console.groq.com/
   - Create an API key
   - Free tier available

2. **MongoDB Atlas Account** (or local MongoDB)
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string

3. **Google OAuth Credentials** (for Google Sign-In)
   - Go to: https://console.cloud.google.com/
   - Create OAuth 2.0 Client ID
   - See `GOOGLE_SIGNIN_SETUP.md` for details

4. **Ngrok Account** (for backend tunneling)
   - Sign up: https://dashboard.ngrok.com/
   - Get auth token (free tier available)

---

## Frontend Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/DUP
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all React dependencies listed in `package.json`.

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your configuration:
   ```env
   REACT_APP_API_BASE_URL=https://your-backend-url.ngrok-free.dev
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   REACT_APP_NAME=Sanjaya Medical AI
   ```

### Step 4: Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### Step 5: Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## Backend Setup

### Option A: Google Colab (Recommended for Quick Start)

1. **Upload `collabbackend.py` to Google Colab**
   - Open: https://colab.research.google.com/
   - Create a new notebook
   - Upload `collabbackend.py` or copy-paste the code

2. **Upload Model Checkpoints to Google Drive**
   - Upload `disease_sentence_model.pkl` to `/content/drive/MyDrive/`
   - Upload `checkpoint_chunk_5_epoch_9.pth` to `/content/drive/MyDrive/checkpoints/`

3. **Update Configuration in the Script**
   - Set `GROQ_API_KEY`
   - Set `MONGODB_CONNECTION_STRING`
   - Set `NGROK_AUTH_TOKEN`
   - Update checkpoint paths if needed

4. **Run the Script**
   - Execute all cells
   - The backend will start automatically
   - Copy the ngrok URL shown in output

### Option B: Local Deployment

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Environment Variables**
   ```bash
   # On Windows (PowerShell)
   $env:GROQ_API_KEY="your-key-here"
   $env:MONGODB_CONNECTION_STRING="your-connection-string"
   
   # On Linux/Mac
   export GROQ_API_KEY="your-key-here"
   export MONGODB_CONNECTION_STRING="your-connection-string"
   ```

4. **Update `collabbackend.py`**
   - Remove Colab-specific code (e.g., `drive.mount()`)
   - Update checkpoint paths to local paths
   - Update ngrok setup (or use a different tunneling solution)

5. **Run the Backend**
   ```bash
   # Convert collabbackend.py to a proper FastAPI app
   # Or run with uvicorn if you create a proper app.py
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

---

## Environment Configuration

### Frontend (.env)

```env
# Backend API URL
REACT_APP_API_BASE_URL=https://your-ngrok-url.ngrok-free.dev

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# App Name
REACT_APP_NAME=Sanjaya Medical AI

# Admin (Optional)
REACT_APP_ADMIN_EMAILS=admin@example.com
REACT_APP_ADMIN_CODE=your-admin-code
```

### Backend (Environment Variables or Script)

```python
GROQ_API_KEY = "your-groq-api-key"
MONGODB_CONNECTION_STRING = "mongodb+srv://user:pass@cluster.mongodb.net/"
MONGODB_DATABASE_NAME = "unified_medical_ai_groq"
NGROK_AUTH_TOKEN = "your-ngrok-token"
```

---

## Model Checkpoints Setup

### Required Files

1. **`disease_sentence_model.pkl`**
   - Sentence Transformer model for symptom diagnosis
   - Place in: `/content/drive/MyDrive/` (Colab) or local path

2. **`checkpoint_chunk_5_epoch_9.pth`**
   - Trained vision-text encoder checkpoint
   - Place in: `/content/drive/MyDrive/checkpoints/` (Colab) or local path

### Download/Prepare Checkpoints

If you don't have checkpoints:
1. Train models using the training scripts (if available)
2. Or use pre-trained models from cloud storage
3. Update paths in `collabbackend.py`

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Create a free M0 cluster
   - Choose a region close to you

2. **Create Database User**
   - Go to Database Access
   - Create a new user with username/password
   - Note down credentials

3. **Whitelist IP Address**
   - Go to Network Access
   - Add your IP (or 0.0.0.0/0 for development)

4. **Get Connection String**
   - Go to Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password

### Local MongoDB (Alternative)

```bash
# Install MongoDB
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod

# Connection string: mongodb://localhost:27017/
```

---

## Running the Application

### Development Mode

1. **Start Backend** (Colab or local)
   - Backend should be running on port 8000
   - Ngrok tunnel should be active
   - Copy the ngrok URL

2. **Update Frontend .env**
   - Set `REACT_APP_API_BASE_URL` to your ngrok URL

3. **Start Frontend**
   ```bash
   cd DUP
   npm start
   ```

4. **Access Application**
   - Open: http://localhost:3000
   - Test login/signup
   - Upload a medical image
   - Test symptom diagnosis

### Production Mode

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Deploy Frontend**
   - Option A: Vercel (see `DEPLOYMENT.md`)
   - Option B: Netlify
   - Option C: Your own server

3. **Deploy Backend**
   - Option A: Keep Colab running (not recommended for production)
   - Option B: Deploy to cloud (AWS, GCP, Azure)
   - Option C: Use a VPS

---

## Deployment Options

### Frontend Deployment

#### Vercel (Easiest)

1. Push code to GitHub
2. Go to: https://vercel.com
3. Import GitHub repository
4. Add environment variables
5. Deploy

See `DEPLOYMENT.md` for detailed instructions.

#### Netlify

1. Push code to GitHub
2. Go to: https://netlify.com
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `build`
6. Add environment variables

### Backend Deployment

#### Google Colab (Development Only)
- Keep notebook running
- Ngrok provides public URL
- ⚠️ Not suitable for production

#### Cloud Platforms

**AWS:**
- Use EC2 or Lambda
- Set up API Gateway
- Use RDS or DocumentDB for MongoDB

**Google Cloud:**
- Use Cloud Run or Compute Engine
- Use Cloud SQL or MongoDB Atlas

**Azure:**
- Use App Service or Functions
- Use Cosmos DB or MongoDB Atlas

---

## Troubleshooting

### Frontend Issues

**Problem:** API connection fails
- **Solution:** Check `REACT_APP_API_BASE_URL` in `.env`
- **Solution:** Ensure backend is running
- **Solution:** Check CORS settings in backend

**Problem:** Google Sign-In not working
- **Solution:** Verify `REACT_APP_GOOGLE_CLIENT_ID`
- **Solution:** Check authorized origins in Google Console
- **Solution:** Restart dev server after changing `.env`

### Backend Issues

**Problem:** Models not loading
- **Solution:** Check checkpoint paths
- **Solution:** Verify files exist
- **Solution:** Check file permissions

**Problem:** MongoDB connection fails
- **Solution:** Verify connection string
- **Solution:** Check IP whitelist
- **Solution:** Verify credentials

**Problem:** Groq API errors
- **Solution:** Check API key
- **Solution:** Verify quota/limits
- **Solution:** Check network connectivity

### Common Errors

**Error:** `Module not found`
- **Solution:** Run `npm install` or `pip install -r requirements.txt`

**Error:** `Port already in use`
- **Solution:** Change port or kill process using the port

**Error:** `CORS error`
- **Solution:** Check backend CORS middleware configuration

---

## Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Deploy to production
4. ✅ Set up monitoring
5. ✅ Configure backups

## Support

For issues or questions:
- Check documentation files
- Review code comments
- Open an issue on GitHub
- Contact the development team

---

**Last Updated:** 2024
**Version:** 1.0.0

