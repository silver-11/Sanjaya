# Sanjaya Medical AI - Project Summary

## Project Overview

**Sanjaya Medical AI** is an advanced, AI-powered medical image analysis and symptom diagnosis platform that leverages state-of-the-art machine learning models to assist healthcare professionals and patients in medical decision-making.

### Key Features

1. **Medical Image Analysis**
   - Upload and analyze medical images (X-Ray, MRI, CT, Pathology, Ophthalmology)
   - Query-aware AI responses using retrieval-augmented generation
   - Multi-modality support with automatic classification
   - Real-time analysis with similarity-based report retrieval

2. **Symptom-Based Disease Prediction**
   - Natural language symptom input
   - AI-powered disease diagnosis suggestions
   - Confidence scoring and alternative diagnoses
   - Interactive chatbot interface

3. **User Management**
   - Secure authentication (email/password + Google OAuth)
   - Role-based access control (Admin/User)
   - Session management and history tracking
   - Profile management

4. **Analytics & Reporting**
   - Analysis history tracking
   - Downloadable reports (PDF/CSV)
   - Dashboard with statistics
   - Admin panel for system monitoring

## Technology Stack

### Frontend
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Build Tool:** Create React App

### Backend
- **Framework:** FastAPI (Python)
- **LLM Provider:** Groq (Llama 3.3 70B Versatile)
- **ML Framework:** PyTorch
- **Models:**
  - Vision Encoder: ResNet50 (custom trained)
  - Text Encoder: Bio_ClinicalBERT (custom trained)
  - Modality Classifier: CLIP (OpenAI)
  - Symptom Model: Sentence Transformers
- **Vector Search:** FAISS
- **Database:** MongoDB Atlas
- **API Deployment:** Ngrok (for development)

### Key Libraries
- Transformers (Hugging Face)
- Sentence Transformers
- FAISS (Facebook AI Similarity Search)
- PIL/Pillow (Image Processing)
- PyMongo (MongoDB driver)

## Architecture

### System Design

```
┌─────────────────┐
│   React Frontend │
│   (Port 3000)    │
└────────┬─────────┘
         │
         │ HTTP/REST API
         │
┌────────▼─────────┐
│  FastAPI Backend │
│   (Port 8000)    │
└────────┬─────────┘
         │
    ┌────┴────┐
    │        │
┌───▼───┐ ┌──▼──────┐
│ MongoDB│ │ Groq API│
│ Atlas  │ │ (LLM)   │
└────────┘ └─────────┘
```

### Data Flow

1. **Image Analysis Flow:**
   - User uploads image → Frontend
   - Frontend → Backend API
   - Backend: Modality classification (CLIP)
   - Backend: Image embedding (ResNet50)
   - Backend: Similarity search (FAISS)
   - Backend: Report retrieval
   - Backend: LLM generation (Groq)
   - Backend → Frontend: Response
   - Frontend: Display results

2. **Symptom Diagnosis Flow:**
   - User enters symptoms → Frontend
   - Frontend → Backend API
   - Backend: Text embedding (Sentence Transformers)
   - Backend: Similarity matching (FAISS)
   - Backend: Disease prediction
   - Backend → Frontend: Diagnosis + confidence

## Dataset Information

### Symptom-Disease Dataset
- **Source:** Hugging Face (`dux-tecblic/symptom-disease-dataset`)
- **Size:** Multiple disease categories
- **Format:** Text symptoms → Disease labels
- **Usage:** Training symptom diagnosis model

### Medical Image Corpus
- **Source:** Custom medical reports corpus
- **Modalities:** Radiology, Pathology, Ophthalmology
- **Format:** Medical imaging reports with embeddings
- **Usage:** Retrieval-augmented generation

See `DATASET.md` for detailed information.

## Model Training

### Vision-Text Encoder
- **Architecture:** Contrastive learning (ResNet50 + Bio_ClinicalBERT)
- **Embedding Dimension:** 256
- **Training:** Custom dataset with medical images and reports
- **Checkpoint:** `checkpoint_chunk_5_epoch_9.pth`

### Symptom Diagnosis Model
- **Architecture:** Sentence Transformer
- **Training:** Symptom-disease dataset
- **Model File:** `disease_sentence_model.pkl`

## Key Innovations

1. **Query-Aware Generation**
   - Analyzes user questions to filter relevant reports
   - Medical keyword extraction
   - Relevance-based context selection
   - Confidence-aware responses

2. **Multi-Modality Support**
   - Automatic modality classification
   - Domain-specific knowledge bases
   - Specialized medical terminology

3. **Retrieval-Augmented Generation (RAG)**
   - FAISS-based similarity search
   - Real-time report retrieval
   - Context-aware LLM responses

## Performance Metrics

- **Image Analysis:** 2-5 minutes per image
- **Symptom Diagnosis:** < 1 second
- **API Response Time:** < 3 seconds (average)
- **Model Accuracy:** Varies by modality (see training logs)

## Security & Privacy

- **Data Encryption:** AES-256 (planned)
- **HIPAA Compliance:** Designed with HIPAA guidelines
- **Authentication:** Secure password hashing + OAuth
- **Data Anonymization:** Patient data anonymization required
- **API Security:** CORS protection, input validation

## Deployment

### Development
- Frontend: `npm start` (localhost:3000)
- Backend: Google Colab or local Python server
- Database: MongoDB Atlas (cloud)

### Production
- Frontend: Vercel/Netlify
- Backend: Cloud platform (AWS/GCP/Azure)
- Database: MongoDB Atlas

See `SETUP.md` and `DEPLOYMENT.md` for detailed instructions.

## Future Enhancements

1. **Model Improvements**
   - Fine-tune on larger medical datasets
   - Multi-modal fusion techniques
   - Real-time model updates

2. **Features**
   - DICOM file support
   - Batch image processing
   - Advanced analytics dashboard
   - Mobile app (React Native)

3. **Integration**
   - PACS integration
   - EMR/EHR integration
   - Telemedicine platform integration

## Project Structure

```
DUP/
├── src/                    # React frontend source
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── context/            # State management
│   ├── config/             # Configuration files
│   └── utils/              # Utility functions
├── public/                  # Static assets
├── collabbackend.py        # Python backend (FastAPI)
├── requirements.txt        # Python dependencies
├── package.json            # Node.js dependencies
├── README.md               # Main documentation
├── SETUP.md                # Setup instructions
├── DEPLOYMENT.md           # Deployment guide
├── DATASET.md             # Dataset information
├── PROJECT_SUMMARY.md      # This file
└── .env.example            # Environment variables template
```

## Team & Credits

- **Development Team:** [Your Team Name]
- **Institution:** [Your Institution]
- **Year:** 2024

## License

See `LICENSE` file for details.

## Contact & Support

- **GitHub Repository:** [Your Repository URL]
- **Issues:** [GitHub Issues URL]
- **Email:** [Your Email]

## Acknowledgments

- Groq for LLM API
- Hugging Face for models and datasets
- MongoDB for database services
- OpenAI for CLIP model
- All open-source contributors

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active Development

