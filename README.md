# Sanjaya Medical AI

An AI-powered medical image-analysis and symptom diagnosis platform. A modern, full-stack application combining React frontend with Python FastAPI backend, leveraging state-of-the-art ML models for medical decision support.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/DUP

# Install frontend dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

For complete setup instructions, see [SETUP.md](./SETUP.md)

## Features

- 🏥 **Medical Image Analysis**: Upload and analyze medical images with AI
- 📊 **Dashboard**: Comprehensive analytics and overview
- 📝 **Reports**: Generate and download detailed analysis reports
- 💬 **Medical Query**: AI-powered medical question answering
- 🔒 **Secure**: HIPAA-compliant with data encryption
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Pages

- **Login/Signup**: User authentication
- **Home**: Welcome page with feature overview
- **Dashboard**: Analytics and quick actions
- **Image Analysis**: Upload and analyze medical images
- **Medical Query**: Ask medical questions to AI
- **Reports**: View and download analysis reports
- **History**: View analysis history
- **Profile**: User profile management
- **Settings**: Application preferences
- **Help & FAQ**: Frequently asked questions
- **Contact**: Contact information and support
- **Privacy**: Privacy policy
- **Terms**: Terms of service

## Tech Stack

### Frontend
- **React 18**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Context API**: State management
- **React Router**: Navigation

### Backend
- **FastAPI**: Python web framework
- **Groq API**: LLM provider (Llama 3.3 70B)
- **PyTorch**: Deep learning framework
- **FAISS**: Vector similarity search
- **MongoDB**: Database
- **Transformers**: Hugging Face models

### ML Models
- **ResNet50**: Vision encoder (custom trained)
- **Bio_ClinicalBERT**: Text encoder (custom trained)
- **CLIP**: Modality classification
- **Sentence Transformers**: Symptom diagnosis

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **npm** or **yarn**
- **Git**

### Required API Keys

Before starting, you'll need:
1. **Groq API Key** - [Get from Groq Console](https://console.groq.com/)
2. **MongoDB Connection String** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Google OAuth Client ID** - [Google Cloud Console](https://console.cloud.google.com/)
4. **Ngrok Auth Token** (for development) - [Ngrok Dashboard](https://dashboard.ngrok.com/)

### Installation

#### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual values
   # See .env.example for all required variables
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   Opens at [http://localhost:3000](http://localhost:3000)

#### Backend Setup

See [SETUP.md](./SETUP.md) for detailed backend setup instructions.

**Quick Backend Setup (Google Colab):**
1. Upload `collabbackend.py` to Google Colab
2. Upload model checkpoints to Google Drive
3. Set API keys in the script
4. Run all cells
5. Copy the ngrok URL to your frontend `.env`

For local backend setup, see [SETUP.md](./SETUP.md#backend-setup).

### Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
DUP/
├── src/                      # React frontend source code
│   ├── components/           # Reusable UI components
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   ├── Layout.js
│   │   ├── Notification.js
│   │   └── TopNavbar.js
│   ├── pages/                # Page components
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Home.js
│   │   ├── Dashboard.js
│   │   ├── Analysis.js
│   │   ├── Query.js
│   │   ├── DiseasePrediction.js
│   │   ├── History.js
│   │   ├── Profile.js
│   │   ├── Settings.js
│   │   ├── Admin.js
│   │   └── ...
│   ├── context/              # State management
│   │   └── AppContext.js
│   ├── config/               # Configuration
│   │   └── api.js
│   ├── utils/                # Utility functions
│   │   ├── analytics.js
│   │   └── googleAuth.js
│   ├── styles/               # Global styles
│   │   └── index.css
│   ├── App.js
│   └── index.js
├── public/                   # Static assets
│   └── index.html
├── api/                      # API routes (if any)
├── collabbackend.py          # Python FastAPI backend
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
├── tailwind.config.js        # Tailwind configuration
├── vercel.json               # Vercel deployment config
├── README.md                 # This file
├── SETUP.md                  # Detailed setup guide
├── DEPLOYMENT.md             # Deployment instructions
├── DATASET.md                # Dataset information
├── PROJECT_SUMMARY.md        # Project summary document
├── GOOGLE_SIGNIN_SETUP.md    # Google OAuth setup
└── .env.example              # Environment variables template
```

## Key Components

### AppContext
Centralized state management for:
- User authentication
- Current page navigation
- Dark mode toggle
- Analysis progress
- Notifications

### Layout
Main application layout including:
- Responsive sidebar navigation
- Header with search and user menu
- Notification system
- Dark mode support

### Pages
Each page is a separate component with its own functionality:
- **Login/Signup**: Authentication forms
- **Dashboard**: Statistics and quick actions
- **Analysis**: File upload and AI processing
- **Query**: Medical question interface
- **Reports**: Report management
- **History**: Analysis history
- **Profile**: User settings
- **Settings**: App preferences
- **FAQ**: Help and support
- **Contact**: Contact information
- **Privacy/Terms**: Legal pages

## Styling

The application uses Tailwind CSS for styling with:
- Custom animations (blob effects)
- Responsive design
- Dark mode support
- Gradient backgrounds
- Hover effects and transitions

## State Management

The app uses React Context API for state management:
- Global state for user authentication
- Page navigation state
- UI preferences (dark mode, sidebar)
- Analysis progress tracking
- Notification system

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (one-way operation)

## Environment Variables

All sensitive configuration is stored in environment variables. Required variables:

- `REACT_APP_API_BASE_URL`: Backend API URL (e.g., ngrok URL)
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth Client ID (for Google Sign-In)
- `REACT_APP_NAME`: Application name (optional)

⚠️ **Important**: Never commit `.env` file to version control. The `.env` file is already in `.gitignore`.

## Configuration

### API Configuration
The API base URL is configured via `REACT_APP_API_BASE_URL` environment variable in your `.env` file. This replaces the hardcoded URL in `src/config/api.js`.

### Google Sign-In
To enable Google Sign-In:
1. Get your Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Add it to your `.env` file as `REACT_APP_GOOGLE_CLIENT_ID`
3. See `GOOGLE_SIGNIN_SETUP.md` for detailed instructions

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and installation guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions (Vercel, etc.)
- **[DATASET.md](./DATASET.md)** - Dataset information and links
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Comprehensive project summary
- **[GOOGLE_SIGNIN_SETUP.md](./GOOGLE_SIGNIN_SETUP.md)** - Google OAuth setup guide

## 🗄️ Dataset & Models

### Datasets Used
- **Symptom-Disease Dataset**: [Hugging Face](https://huggingface.co/datasets/dux-tecblic/symptom-disease-dataset)
- **Medical Image Corpus**: Custom corpus (see [DATASET.md](./DATASET.md))

### Model Checkpoints Required
- `disease_sentence_model.pkl` - Symptom diagnosis model
- `checkpoint_chunk_5_epoch_9.pth` - Vision-text encoder checkpoint

**Model Storage:** Model checkpoints are stored in this repository using **Git LFS** (Large File Storage).

**To download models when cloning:**
```bash
git lfs pull
```

**Note:** If you don't have Git LFS installed, see [MODEL_UPLOAD_GUIDE.md](./MODEL_UPLOAD_GUIDE.md) for setup instructions.

See [DATASET.md](./DATASET.md) for more information about the models.

## 🚀 Deployment

### Frontend Deployment
- **Vercel** (Recommended) - See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Netlify** - Similar to Vercel
- **Your own server** - Serve the `build/` folder

### Backend Deployment
- **Google Colab** - For development/testing
- **Cloud Platforms** - AWS, GCP, Azure
- **VPS** - DigitalOcean, Linode, etc.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Backend Development

The backend is a Python FastAPI application. See `collabbackend.py` for the main code.

**Running locally:**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run with uvicorn (after converting to proper app structure)
uvicorn app:app --host 0.0.0.0 --port 8000
```

## 🐛 Troubleshooting

Common issues and solutions:

- **API connection fails**: Check `REACT_APP_API_BASE_URL` in `.env`
- **Models not loading**: Verify checkpoint paths and file existence
- **MongoDB connection fails**: Check connection string and IP whitelist
- **Google Sign-In not working**: Verify OAuth credentials

See [SETUP.md](./SETUP.md#troubleshooting) for more solutions.

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact & Support

- **GitHub Issues**: [Open an issue](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues)
- **Email**: [Your Email]
- **Documentation**: See documentation files in the repository

## 🙏 Acknowledgments

- Groq for LLM API
- Hugging Face for models and datasets
- MongoDB for database services
- OpenAI for CLIP model
- All open-source contributors

---

**Made with ❤️ for Medical AI Research**
