# ==========================================================
# 🏥 UNIFIED MEDICAL AI SYSTEM WITH GROQ
# Symptom Diagnosis + Medical Image Analysis + MongoDB
# Primary LLM: Groq (Llama 3.3 70B) - Query-Aware Generation
# ==========================================================

# ============================================
# SECTION 1: INSTALLATIONS
# ============================================
!pip install -q datasets sentence-transformers scikit-learn pandas
!pip install -q faiss-cpu networkx matplotlib seaborn transformers accelerate
!pip install -q pyngrok fastapi uvicorn python-multipart nest-asyncio
!pip install -q sentencepiece pymongo dnspython groq

# ============================================
# SECTION 2: IMPORTS
# ============================================
import re
import os
import time
import json
import random
import tempfile
import threading
import numpy as np
import pandas as pd
from datetime import datetime
from collections import defaultdict
from typing import List, Tuple, Dict

# ML/AI
import torch
import torch.nn as nn
import torch.nn.functional as F
import faiss
import torchvision.transforms as T
import torchvision.models as models
from transformers import (AutoModel, AutoTokenizer, CLIPProcessor, CLIPModel)
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from datasets import load_dataset
import joblib

# Image processing
from PIL import Image
from io import BytesIO
import base64

# Visualization
import matplotlib.pyplot as plt
import networkx as nx
import seaborn as sns

# Database
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId

# API
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pyngrok import ngrok
import nest_asyncio

# Groq
from groq import Groq

# Google Drive
from google.colab import drive

nest_asyncio.apply()
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🔧 Device: {device}")

# Mount Drive
drive.mount('/content/drive')

# ============================================
# SECTION 3: GROQ CONFIGURATION
# ============================================
# ============================================
# SECTION 3: GROQ CONFIGURATION - FIXED
# ============================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

class GroqGenerator:
    """Enhanced Groq generator with query-aware capabilities - FIXED"""
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.models = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ]
        self.current_model = self.models[0]
        print(f"🤖 Groq initialized: {self.current_model}")

    def generate_answer(self, question: str, context: str, max_tokens: int = 600,
                       temperature: float = 0.7) -> str:
        """Generate answer using Groq API with fallback models"""
        for model in self.models:
            try:
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": f"{context}\n\n{question}"}],
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=0.9
                )
                answer = response.choices[0].message.content.strip()
                if len(answer) > 20:
                    return answer
            except Exception as e:
                print(f"⚠️ {model} failed: {str(e)[:100]}")
                continue
        return "I apologize, but I'm unable to generate a response at this time. Please try again."

    def generate_image_answer(self, question: str, reports: List[str],
                             modality: str, report_scores: List[float] = None,
                             conversation_history: List[Dict] = None,
                             max_tokens: int = 600) -> str:
        """Query-aware generation for medical image analysis - FIXED"""

        # Analyze question
        question_lower = question.lower()
        is_specific_query = any(word in question_lower for word in [
            'what', 'how', 'why', 'describe', 'explain', 'diagnosis', 'treatment',
            'finding', 'show', 'indicate', 'suggest', 'mean', 'cause'
        ])

        # Extract medical terms
        medical_keywords = ['pneumonia', 'fracture', 'tumor', 'lesion', 'edema',
                           'hemorrhage', 'consolidation', 'mass', 'carcinoma',
                           'retina', 'optic', 'disc', 'findings', 'abnormal',
                           'diagnosis', 'treatment', 'cells', 'tissue', 'biopsy',
                           'macula', 'vessel', 'nerve', 'drusen', 'exudate']
        medical_terms = [term for term in medical_keywords if term in question_lower]

        # Filter reports by relevance
        relevant_reports = []
        if report_scores:
            for i, (report, score) in enumerate(zip(reports, report_scores)):
                if score > 0.3 or i < 3:  # Keep high-relevance or top 3
                    relevant_reports.append((report, score, i))
                if len(relevant_reports) >= 5:
                    break
        else:
            relevant_reports = [(r, 0.5, i) for i, r in enumerate(reports[:5])]

        # Build report context
        report_text = f"**DOMAIN: {modality.upper()}**\n\n"
        if not relevant_reports or (relevant_reports and relevant_reports[0][1] < 0.2):
            report_text += "⚠️ **Note:** Retrieved reports have low relevance scores. General medical knowledge will be used.\n\n"

        for report, score, idx in relevant_reports:
            relevance_indicator = "🔥 HIGH" if score > 0.5 else "📊 MEDIUM" if score > 0.3 else "📉 LOW"
            report_text += f"**Report {idx+1}** [Relevance: {score:.3f} - {relevance_indicator}]:\n{report[:400]}\n\n"

        # FIX 1: Build medical definitions context
        definition_text = ""
        if modality == "radiology":
            definition_text = """
- Consolidation: Area of lung filled with fluid/pus instead of air
- Pneumonia: Infection causing lung inflammation
- Pleural effusion: Fluid accumulation around lungs
- Pneumothorax: Collapsed lung due to air in pleural space
- Fracture: Break in bone structure
- Embolism: Blockage of blood vessel by clot or other material
"""
        elif modality == "pathology":
            definition_text = """
- Carcinoma: Cancer arising from epithelial cells
- Biopsy: Tissue sample for microscopic examination
- Mitosis: Cell division (high rate = aggressive cancer)
- Lymphovascular invasion: Cancer cells in blood/lymph vessels
- Necrosis: Death of tissue cells
- Adenocarcinoma: Cancer of glandular tissue
"""
        elif modality == "ophthalmology":
            definition_text = """
- Retina: Light-sensitive tissue at back of eye
- Optic disc: Where optic nerve enters the eye
- Macula: Central part of retina for sharp vision
- Fundus: Interior surface of eye visible through pupil
- Drusen: Yellow deposits under retina (age-related changes)
- Exudate: Fluid that leaks from blood vessels
"""
        else:
            definition_text = "General medical imaging terminology will be applied."

        # FIX 2: Build conversation history context
        history_text = ""
        if conversation_history and len(conversation_history) > 0:
            history_text = "**Previous Q&A:**\n"
            for i, conv in enumerate(conversation_history[-3:], 1):  # Last 3 exchanges
                history_text += f"Q{i}: {conv.get('question', 'N/A')[:100]}...\n"
                history_text += f"A{i}: {conv.get('answer', 'N/A')[:150]}...\n\n"
        else:
            history_text = "This is the first question about this image."

        context_quality = "RELEVANT" if relevant_reports and relevant_reports[0][1] > 0.3 else "LIMITED"

        prompt = f"""
You are an expert medical image analysis assistant with access to a retrieved knowledge base.

🎯 **IMAGE DOMAIN:** {modality.upper()}
📊 **CONTEXT QUALITY:** {context_quality}
🔑 **KEY TERMS IN QUESTION:** {', '.join(medical_terms) if medical_terms else 'None identified'}

❓ **USER'S QUESTION:** "{question}"

📋 **RETRIEVED MEDICAL REPORTS (ranked by relevance to the question):**
{report_text}

📚 **RELEVANT MEDICAL DEFINITIONS:**
{definition_text}

💬 **CONVERSATION HISTORY:**
{history_text}

🔍 **CRITICAL INSTRUCTIONS:**
1. **ANSWER DECISIVELY AND CONFIDENTLY**
   - Your goal is to deliver a clear, professional medical answer.
   - Do *not* express uncertainty or say “it’s hard to tell” — instead, provide your best interpretation.
   - Even if the retrieved context is weak, infer a likely answer using your medical expertise.

2. **USE RETRIEVED CONTEXT INTELLIGENTLY**
   - Reports are ranked by relevance (Report #1 = most relevant).
   - If Reports #1–3 relate to the question, integrate their insights naturally (e.g., “Based on similar cases...”).
   - If the context is weak or unrelated, still provide a confident domain-based answer using medical reasoning.

3. **DOMAIN AWARENESS ({modality.upper()})**
   - The image belongs to the {modality} domain — describe findings, likely conditions, or observations accordingly.
   - Use domain-specific terms, but avoid generic explanations about the field itself.

4. **QUALITY AND STYLE**
   - ❌ Don’t mention “low relevance,” “not enough info,” or “uncertain.”
   - ✅ Always provide a clear, structured, authoritative response.
   - ✅ Sound like a skilled radiologist/pathologist confidently summarizing a case.
   - ✅ Prefer concise paragraphs; use bullet points only for multiple findings.

5. **FORMAT**
   - Begin directly answering the question.
   - If relevant, include a short rationale (“Based on retrieved findings...”).
   - Keep within 250–300 words.

**YOUR ANSWER (focused on: "{question}"):**
"""


        return self.generate_answer(question, prompt, max_tokens, temperature=0.7)

# Initialize Groq
print("\n🚀 Initializing Groq API...")
groq_generator = GroqGenerator(api_key=GROQ_API_KEY)

# ============================================
# SECTION 4: MONGODB MANAGER
# ============================================
class MongoDBManager:
    def __init__(self, connection_string: str, database_name: str = "unified_medical_ai"):
        self.connection_string = connection_string
        self.database_name = database_name
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        try:
            print(f"🔌 Connecting to MongoDB...")
            self.client = MongoClient(
                self.connection_string,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000
            )
            self.client.admin.command('ping')
            self.db = self.client[self.database_name]
            self._initialize_collections()
            print(f"✅ MongoDB connected: {self.database_name}")
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.client = None
            self.db = None

    def _initialize_collections(self):
        if self.db is None:
            return

        collections = {
            'symptom_sessions': [('session_id', 1), ('created_at', -1)],
            'symptom_diagnoses': [('session_id', 1), ('timestamp', -1)],
            'image_sessions': [('session_id', 1), ('created_at', -1)],
            'image_analyses': [('session_id', 1), ('uploaded_at', -1)],
            'conversations': [('session_id', 1), ('timestamp', -1)],
            'system_logs': [('timestamp', -1), ('level', 1)]
        }

        for collection_name, indexes in collections.items():
            if collection_name not in self.db.list_collection_names():
                self.db.create_collection(collection_name)
            for index in indexes:
                self.db[collection_name].create_index([index])

    def is_connected(self) -> bool:
        return self.client is not None and self.db is not None

    def create_session(self, session_type: str, metadata: Dict = None) -> str:
        if not self.is_connected():
            return f"local_{session_type}_{int(time.time())}"

        session_doc = {
            'session_id': f"{session_type}_{int(time.time())}_{np.random.randint(1000, 9999)}",
            'session_type': session_type,
            'created_at': datetime.utcnow(),
            'metadata': metadata or {},
            'status': 'active'
        }

        collection = f"{session_type}_sessions"
        self.db[collection].insert_one(session_doc)
        return session_doc['session_id']

    def save_symptom_diagnosis(self, session_id: str, data: Dict):
        if not self.is_connected():
            return

        doc = {
            'session_id': session_id,
            'timestamp': datetime.utcnow(),
            'symptoms': data.get('symptoms'),
            'diagnosis': data.get('diagnosis'),
            'confidence': data.get('confidence'),
            'alternatives': data.get('alternatives', [])
        }
        self.db.symptom_diagnoses.insert_one(doc)

    def save_image_analysis(self, session_id: str, data: Dict):
        if not self.is_connected():
            return

        doc = {
            'session_id': session_id,
            'uploaded_at': datetime.utcnow(),
            'modality': data.get('modality'),
            'confidence': data.get('confidence'),
            'filename': data.get('filename'),
            'analysis_data': data
        }
        self.db.image_analyses.insert_one(doc)

    def save_conversation(self, session_id: str, session_type: str, question: str, answer: str, metadata: Dict = None):
        if not self.is_connected():
            return

        doc = {
            'session_id': session_id,
            'session_type': session_type,
            'timestamp': datetime.utcnow(),
            'question': question,
            'answer': answer,
            'metadata': metadata or {}
        }
        self.db.conversations.insert_one(doc)

    def get_conversation_history(self, session_id: str, limit: int = 50) -> List[Dict]:
        if not self.is_connected():
            return []

        conversations = self.db.conversations.find(
            {'session_id': session_id}
        ).sort('timestamp', 1).limit(limit)

        return list(conversations)

    def log_system_event(self, level: str, message: str, details: Dict = None):
        if not self.is_connected():
            return

        log_doc = {
            'timestamp': datetime.utcnow(),
            'level': level,
            'message': message,
            'details': details or {}
        }
        self.db.system_logs.insert_one(log_doc)

    def get_global_stats(self) -> Dict:
        if not self.is_connected():
            return {}

        return {
            'total_symptom_sessions': self.db.symptom_sessions.count_documents({}),
            'total_image_sessions': self.db.image_sessions.count_documents({}),
            'total_diagnoses': self.db.symptom_diagnoses.count_documents({}),
            'total_image_analyses': self.db.image_analyses.count_documents({}),
            'total_conversations': self.db.conversations.count_documents({})
        }

    def close(self):
        if self.client:
            self.client.close()
            print("🔌 MongoDB connection closed")

# Initialize MongoDB
print("\n🗄️  MongoDB Configuration")
print("="*60)

MONGODB_ATLAS = os.getenv("MONGODB_CONNECTION_STRING", "")
MONGODB_LOCAL = os.getenv("MONGODB_LOCAL", "mongodb://localhost:27017/")
USE_ATLAS = os.getenv("USE_MONGODB_ATLAS", "true").lower() == "true"

MONGODB_CONNECTION = MONGODB_ATLAS if USE_ATLAS and MONGODB_ATLAS else MONGODB_LOCAL
mongo_manager = MongoDBManager(MONGODB_CONNECTION, "unified_medical_ai_groq")

# ============================================
# SECTION 5: SYMPTOM DIAGNOSIS - LOAD MODEL
# ============================================
print("\n📚 Loading Symptom Diagnosis Model...")

model_path = "/content/drive/MyDrive/disease_sentence_model.pkl"
symptom_model = joblib.load(model_path)
print("✅ Symptom model loaded")

# Load dataset
print("Loading symptom dataset...")
dataset = load_dataset("dux-tecblic/symptom-disease-dataset", split="train")
symptom_df = pd.DataFrame(dataset)
symptom_df.rename(columns={'text': 'symptoms', 'label': 'disease_id'}, inplace=True)
symptom_df["symptoms"] = symptom_df["symptoms"].astype(str).str.strip().str.lower()
symptom_df.drop_duplicates(subset=["symptoms", "disease_id"], inplace=True)
symptom_df.reset_index(drop=True, inplace=True)

# Disease name mapping
disease_name_map = {
    35: "Asthma", 79: "Influenza (Flu)", 149: "Pneumonia", 234: "Viral Infection",
    275: "Common Cold Variant", 284: "Bronchitis", 510: "Common Cold",
    766: "Seasonal Flu", 403: "Tuberculosis", 308: "Migraine",
    785: "Posterior Cortical Atrophy", 596: "Malaria", 798: "Ovarian Insufficiency",
    376: "Cancer"
}

symptom_df["disease_name"] = symptom_df["disease_id"].map(disease_name_map)
symptom_df["disease_name"] = symptom_df["disease_name"].fillna(
    symptom_df["disease_id"].apply(lambda x: f"Disease-{x}")
)

# Pre-compute embeddings
print("Pre-computing symptom embeddings...")
symptom_df["embedding"] = symptom_df["symptoms"].apply(lambda x: symptom_model.encode(x))

valid_mask = symptom_df["embedding"].notna()
symptom_embeddings = np.vstack(symptom_df.loc[valid_mask, "embedding"].values)
symptom_disease_ids = symptom_df.loc[valid_mask, "disease_id"].values
symptom_disease_names = symptom_df.loc[valid_mask, "disease_name"].values
print(f"✅ {len(symptom_df)} symptom records ready")

# ============================================
# SECTION 6: IMAGE ANALYSIS - FIXED CHECKPOINT LOADING
# ============================================
print("\n🖼️  Loading Image Analysis Models...")

class VisionEncoder(nn.Module):
    def __init__(self, embedding_dim=256):
        super().__init__()
        base_model = models.resnet50(weights="IMAGENET1K_V1")
        modules = list(base_model.children())[:-1]
        self.backbone = nn.Sequential(*modules)
        self.fc = nn.Linear(base_model.fc.in_features, embedding_dim)

    def forward(self, x_img):
        with torch.no_grad():
            features = self.backbone(x_img).squeeze(-1).squeeze(-1)
        emb = self.fc(features)
        emb = F.normalize(emb, dim=-1)
        return emb

class TextEncoder(nn.Module):
    def __init__(self, embedding_dim=256, model_name="emilyalsentzer/Bio_ClinicalBERT"):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.fc = nn.Linear(self.bert.config.hidden_size, embedding_dim)

    def forward(self, input_ids, attention_mask):
        with torch.no_grad():
            outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
            cls_emb = outputs.last_hidden_state[:, 0, :]
        emb = self.fc(cls_emb)
        emb = F.normalize(emb, dim=-1)
        return emb

# Image preprocessing
img_transform = T.Compose([
    T.Resize((224,224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
])

text_tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")

def preprocess_image_pil(img_pil: Image.Image):
    return img_transform(img_pil).unsqueeze(0).to(device)

def tokenize_texts(texts: List[str]):
    toks = text_tokenizer(texts, padding=True, truncation=True, return_tensors="pt", max_length=512)
    return {k: v.to(device) for k,v in toks.items()}

# Initialize encoders
vision_encoder = VisionEncoder(embedding_dim=256).to(device)
text_encoder = TextEncoder(embedding_dim=256).to(device)

# ==========================================================
# FIXED: Load YOUR trained checkpoint
# ==========================================================
CHECKPOINT_PATH = "/content/drive/MyDrive/checkpoints/checkpoint_chunk_5_epoch_9.pth"

print(f"🔍 Looking for your checkpoint at: {CHECKPOINT_PATH}")

if os.path.exists(CHECKPOINT_PATH):
    print(f"✅ Found checkpoint!")

    try:
        ckpt = torch.load(CHECKPOINT_PATH, map_location=device)

        # Determine checkpoint structure
        loaded = False

        # Try method 1: Standard structure
        if 'vision_encoder_state_dict' in ckpt and 'text_encoder_state_dict' in ckpt:
            vision_encoder.load_state_dict(ckpt['vision_encoder_state_dict'])
            text_encoder.load_state_dict(ckpt['text_encoder_state_dict'])
            print("✅ Loaded checkpoint (method 1: separate state_dicts)")
            loaded = True

        # Try method 2: Combined model_state_dict
        elif 'model_state_dict' in ckpt:
            state_dict = ckpt['model_state_dict']

            # Split into vision and text
            vision_dict = {}
            text_dict = {}

            for key, value in state_dict.items():
                if key.startswith('vision_encoder.'):
                    new_key = key.replace('vision_encoder.', '')
                    vision_dict[new_key] = value
                elif key.startswith('text_encoder.'):
                    new_key = key.replace('text_encoder.', '')
                    text_dict[new_key] = value

            if vision_dict and text_dict:
                vision_encoder.load_state_dict(vision_dict)
                text_encoder.load_state_dict(text_dict)
                print("✅ Loaded checkpoint (method 2: split model_state_dict)")
                loaded = True

        # Try method 3: Direct state_dict
        elif 'state_dict' in ckpt:
            state_dict = ckpt['state_dict']

            vision_dict = {k.replace('vision_encoder.', '').replace('image_encoder.', ''): v
                          for k, v in state_dict.items()
                          if 'vision' in k.lower() or 'image' in k.lower()}
            text_dict = {k.replace('text_encoder.', '').replace('bert.', ''): v
                        for k, v in state_dict.items()
                        if 'text' in k.lower() or 'bert' in k.lower()}

            if vision_dict and text_dict:
                vision_encoder.load_state_dict(vision_dict, strict=False)
                text_encoder.load_state_dict(text_dict, strict=False)
                print("✅ Loaded checkpoint (method 3: inferred from keys)")
                loaded = True

        if loaded:
            # Print checkpoint info
            if 'epoch' in ckpt:
                print(f"   📊 Epoch: {ckpt['epoch']}")
            if 'train_loss' in ckpt:
                print(f"   📉 Train Loss: {ckpt['train_loss']:.4f}")
            if 'chunk' in ckpt:
                print(f"   📦 Chunk: {ckpt['chunk']}")

            print(f"   🎯 Using YOUR trained contrastive model!")
        else:
            print("⚠️  Could not determine checkpoint structure")
            print(f"   Available keys: {list(ckpt.keys())}")
            print("   Using random initialization instead")

    except Exception as e:
        print(f"❌ Error loading checkpoint: {e}")
        print("   Using random initialization")
        import traceback
        traceback.print_exc()

else:
    print(f"⚠️  Checkpoint not found at: {CHECKPOINT_PATH}")

    # Try alternative paths
    alternative_paths = [
        "/content/drive/MyDrive/checkpoints (1)/checkpoint_chunk_5_epoch_9.pth",
        "/content/drive/MyDrive/checkpoint_chunk_5_epoch_9.pth",
    ]

    print("   Checking alternative paths...")
    for alt_path in alternative_paths:
        if os.path.exists(alt_path):
            print(f"   ✅ Found at: {alt_path}")
            CHECKPOINT_PATH = alt_path
            break
    else:
        print("   ⚠️  Using random initialization (will give poor results!)")

# Set to eval mode
vision_encoder.eval()
text_encoder.eval()

print("✅ Vision and Text encoders ready")

# Load CLIP for modality classification
print("Loading CLIP for modality classification...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def classify_modality(img_pil: Image.Image):
    modalities = ["radiology", "pathology", "ophthalmology"]
    inputs = clip_processor(text=modalities, images=img_pil, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        outputs = clip_model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=-1)
    return modalities[probs.argmax().item()], probs.cpu().numpy()

print("✅ CLIP loaded for modality classification")

# Rest of your corpus loading code stays the same...
# (Keep the load_corpus_enhanced function and corpus_data loading as is)

# ==========================================================
# IMPORTANT: Rebuild FAISS index with YOUR trained text encoder
# ==========================================================
print("\n🔍 Building FAISS indices with YOUR trained text encoder...")

class EnhancedRetriever:
    def __init__(self, corpus_data, text_encoder):
        self.corpus_data = corpus_data
        self.text_encoder = text_encoder  # ← YOUR trained encoder
        self.indices = {}
        self.texts = {}

        print("🔍 Building FAISS indices...")
        for modality, text_id_pairs in corpus_data.items():
            if len(text_id_pairs) == 0:
                continue

            texts = [text for text, _ in text_id_pairs]

            # Use YOUR trained text encoder to create embeddings
            embeddings = self._embed_texts(texts)

            index = faiss.IndexFlatIP(embeddings.shape[1])
            index.add(embeddings)

            self.indices[modality] = index
            self.texts[modality] = texts
            print(f"   {modality.capitalize()}: {index.ntotal} documents indexed with YOUR model")

    def _embed_texts(self, texts: List[str], batch_size: int = 8):
        all_embs = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            toks = tokenize_texts(batch)
            with torch.no_grad():
                emb = self.text_encoder(input_ids=toks['input_ids'],
                                       attention_mask=toks['attention_mask'])
            all_embs.append(emb.cpu().numpy().astype(np.float32))

        embeddings = np.vstack(all_embs)
        faiss.normalize_L2(embeddings)
        return embeddings

    def retrieve(self, modality, query_embedding, top_k=10):
        """Retrieve reports with similarity scores"""
        if modality not in self.indices:
            modality = list(self.indices.keys())[0]

        index = self.indices[modality]
        texts = self.texts[modality]

        faiss.normalize_L2(query_embedding)
        similarities, indices = index.search(query_embedding, min(top_k, index.ntotal))

        retrieved_texts = [texts[idx] for idx in indices[0] if 0 <= idx < len(texts)]
        scores = similarities[0].tolist()

        return retrieved_texts, scores

# Create retriever with YOUR trained text encoder
retriever = EnhancedRetriever(corpus_data, text_encoder)

print("\n✅ Image analysis system ready with YOUR TRAINED MODEL!")
print("="*70)
print("🎯 SUMMARY:")
print("   • Vision Encoder: YOUR trained ResNet50")
print("   • Text Encoder: YOUR trained BioClinicalBERT")
print("   • FAISS Index: Built with YOUR embeddings")
print("   • Modality Classifier: CLIP (pretrained)")
print("="*70)

# ============================================
# SECTION 7: SYMPTOM CHATBOT FUNCTIONS
# ============================================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def predict_disease(symptoms_text):
    user_text_clean = clean_text(symptoms_text)
    user_emb = symptom_model.encode(user_text_clean)
    sims = cosine_similarity([user_emb], symptom_embeddings)[0]
    top_idx = np.argsort(sims)[::-1][:3]

    results = []
    for idx in top_idx:
        results.append({
            "disease_id": int(symptom_disease_ids[idx]),
            "disease": symptom_disease_names[idx],
            "confidence": float(sims[idx])
        })
    return results

def detect_symptom_intent(user_input):
    text = user_input.lower().strip()

    if any(word in text for word in ["bye", "goodbye", "quit", "exit"]):
        return "goodbye"
    if any(word in text for word in ["thank", "thanks"]):
        return "thanks"
    if not any(c.isalnum() for c in text):
        return "unknown"
    if any(word in text for word in ["hi", "hello", "hey"]):
        return "greeting"
    if "how are you" in text:
        return "how_are_you"
    if any(phrase in text for phrase in ["i think i", "i have", "i might have"]):
        return "self_diagnosis"
    if any(word in text for word in ["have", "feel", "fever", "cough", "pain", "ache", "sore"]):
        return "symptoms"

    return "unknown"

def get_follow_up_question(symptoms_text):
    inp = symptoms_text.lower()

    if any(k in inp for k in ["cough", "cold", "fever"]):
        return random.choice([
            "Do you have a sore throat or runny nose?",
            "Are you experiencing any chills or body aches?",
            "How long have you had the fever?"
        ])
    elif any(k in inp for k in ["pain", "ache", "headache"]):
        return random.choice([
            "On a scale of 1-10, how severe is the pain?",
            "Is the pain constant or does it come and go?"
        ])
    else:
        return "How long have you been experiencing these symptoms?"

# ============================================
# SECTION 8: UNIFIED CHATBOT CLASS WITH GROQ
# ============================================
class UnifiedMedicalChatbot:
    def __init__(self, mongo_manager, groq_generator):
        self.mongo = mongo_manager
        self.groq = groq_generator
        self.symptom_session_id = None
        self.image_session_id = None
        self.mode = None  # 'symptom' or 'image'

        # Symptom diagnosis state
        self.symptom_history = []
        self.symptoms_mentioned = []
        self.diagnosis_given = False

        # Image analysis state
        self.current_image = None
        self.current_modality = None
        self.image_embedding = None
        self.retrieved_reports = []
        self.report_scores = []  # Store similarity scores
        self.image_conversation = []

    def start_symptom_session(self):
        self.mode = 'symptom'
        if self.mongo.is_connected():
            self.symptom_session_id = self.mongo.create_session('symptom', {'device': device})
        else:
            self.symptom_session_id = f"symptom_{int(time.time())}"
        self.symptom_history = []
        self.symptoms_mentioned = []
        self.diagnosis_given = False
        return self.symptom_session_id

    def start_image_session(self):
        self.mode = 'image'
        if self.mongo.is_connected():
            self.image_session_id = self.mongo.create_session('image', {'device': device})
        else:
            self.image_session_id = f"image_{int(time.time())}"
        self.current_image = None
        self.current_modality = None
        self.image_embedding = None
        self.retrieved_reports = []
        self.report_scores = []
        self.image_conversation = []
        return self.image_session_id

    def process_symptom_query(self, user_input):
        intent = detect_symptom_intent(user_input)

        if intent == "greeting":
            return "Hello! I'm Dr. MMED, your AI medical assistant. How are you feeling today?"
        elif intent == "how_are_you":
            return "I'm doing well, thank you! More importantly, how are YOU feeling?"
        elif intent == "self_diagnosis":
            return "I see. Let me help confirm that. What symptoms are you experiencing?"
        elif intent == "symptoms":
            self.symptoms_mentioned.append(user_input)
            all_symptoms = " ".join(self.symptoms_mentioned)
            results = predict_disease(all_symptoms)

            if not results:
                return "I'm having trouble identifying a condition. Could you describe your symptoms differently?"

            best = results[0]
            confidence = best['confidence'] * 100

            if self.diagnosis_given:
                response = f"With this additional symptom, my assessment is now **{best['disease']}** ({confidence:.1f}% confidence).\n\n"
            else:
                response = f"Based on your symptoms, I believe you might have **{best['disease']}**. "
                if confidence > 80:
                    response += f"I'm quite confident ({confidence:.1f}% match).\n\n"
                elif confidence > 60:
                    response += f"This seems likely ({confidence:.1f}% match).\n\n"
                else:
                    response += f"Though I'm not entirely certain ({confidence:.1f}% match).\n\n"

                if len(results) > 1:
                    response += "Other possibilities:\n"
                    for i, r in enumerate(results[1:], 2):
                        response += f"  {i}. {r['disease']} ({r['confidence']*100:.1f}%)\n"
                response += "\n"

            response += get_follow_up_question(user_input)
            self.diagnosis_given = True

            # Save to MongoDB
            if self.mongo.is_connected():
                self.mongo.save_symptom_diagnosis(self.symptom_session_id, {
                    'symptoms': all_symptoms,
                    'diagnosis': best['disease'],
                    'confidence': confidence,
                    'alternatives': [r['disease'] for r in results[1:]]
                })
                self.mongo.save_conversation(self.symptom_session_id, 'symptom', user_input, response)

            return response
        elif intent == "thanks":
            return "You're welcome! Remember to see a real doctor if symptoms persist."
        elif intent == "goodbye":
            return "Take care! Wishing you good health. Goodbye!"
        else:
            return "I'm not sure I understand. Could you tell me what symptoms you're experiencing?"

    def process_image(self, image_path: str, filename: str = None):
        """Enhanced image processing with similarity scores"""
        try:
            img_pil = Image.open(image_path).convert("RGB")

            # Step 1: Classify modality
            self.current_modality, modality_probs = classify_modality(img_pil)

            # Step 2: Get image embedding
            x = preprocess_image_pil(img_pil)
            with torch.no_grad():
                self.image_embedding = vision_encoder(x).cpu().numpy().astype(np.float32)

            # Step 3: Retrieve reports WITH SCORES
            self.retrieved_reports, self.report_scores = retriever.retrieve(
                self.current_modality, self.image_embedding, top_k=10
            )

            self.current_image = img_pil

            # Save to MongoDB with enhanced metrics
            if self.mongo.is_connected():
                self.mongo.save_image_analysis(self.image_session_id, {
                    'modality': self.current_modality,
                    'confidence': float(modality_probs[0].max()),
                    'filename': filename,
                    'reports_count': len(self.retrieved_reports),
                    'avg_similarity': float(np.mean(self.report_scores)) if self.report_scores else 0.0,
                    'top_similarity': float(self.report_scores[0]) if self.report_scores else 0.0
                })

            return {
                "status": "success",
                "modality": self.current_modality,
                "confidence": float(modality_probs[0].max()),
                "reports_count": len(self.retrieved_reports),
                "avg_similarity": float(np.mean(self.report_scores)) if self.report_scores else 0.0,
                "top_similarity": float(self.report_scores[0]) if self.report_scores else 0.0,
                "relevance_quality": "HIGH" if self.report_scores and self.report_scores[0] > 0.5
                                    else "MEDIUM" if self.report_scores and self.report_scores[0] > 0.3
                                    else "LOW"
            }
        except Exception as e:
            import traceback
            print(f"Error: {traceback.format_exc()}")
            return {"status": "error", "message": str(e)}

    def chat_about_image(self, question: str):
        """Query-aware chat using Groq"""
        if self.current_image is None:
            raise ValueError("No image loaded. Please upload an image first.")

        # Generate answer using Groq with query-aware context
        answer = self.groq.generate_image_answer(
            question=question,
            reports=self.retrieved_reports,
            modality=self.current_modality,
            report_scores=self.report_scores,
            max_tokens=600
        )

        # Save to MongoDB with enhanced metadata
        if self.mongo.is_connected():
            # Extract medical keywords for metadata
            question_lower = question.lower()
            medical_keywords = ['pneumonia', 'fracture', 'tumor', 'lesion', 'edema',
                               'hemorrhage', 'consolidation', 'mass', 'carcinoma',
                               'retina', 'optic', 'disc', 'findings', 'abnormal']
            medical_terms = [term for term in medical_keywords if term in question_lower]

            metadata = {
                'modality': self.current_modality,
                'reports_used': len(self.retrieved_reports),
                'key_terms': medical_terms,
                'query_length': len(question),
                'answer_length': len(answer),
                'llm': 'groq_llama_3.3_70b'
            }

            if self.report_scores:
                metadata['top_similarity'] = float(self.report_scores[0])
                metadata['avg_similarity'] = float(np.mean(self.report_scores[:5]))

            self.mongo.save_conversation(
                self.image_session_id, 'image', question, answer, metadata
            )

        return answer

    def clear(self):
        self.__init__(self.mongo, self.groq)
        return {"status": "cleared"}

# Initialize chatbot with Groq
chatbot = UnifiedMedicalChatbot(mongo_manager, groq_generator)

# ============================================
# SECTION 9: FASTAPI ENDPOINTS
# ============================================
print("\n🚀 Setting up FastAPI...")

app = FastAPI(title="Unified Medical AI System with Groq", version="3.0.0-Groq")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Unified Medical AI System with Groq",
        "version": "3.0.0-Groq",
        "llm": "Groq (Llama 3.3 70B Versatile)",
        "features": [
            "Symptom Diagnosis",
            "Medical Image Analysis",
            "Query-Aware Generation",
            "MongoDB Integration"
        ],
        "database": "connected" if mongo_manager.is_connected() else "disconnected"
    }

# Symptom Diagnosis Endpoints
@app.post("/symptom/start")
async def start_symptom_chat():
    session_id = chatbot.start_symptom_session()
    return {"success": True, "session_id": session_id, "mode": "symptom"}

@app.post("/symptom/chat")
async def symptom_chat(message: str = Form(...)):
    try:
        response = chatbot.process_symptom_query(message)
        return {"success": True, "response": response, "session_id": chatbot.symptom_session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Image Analysis Endpoints
@app.post("/image/start")
async def start_image_chat():
    session_id = chatbot.start_image_session()
    return {"success": True, "session_id": session_id, "mode": "image"}

@app.post("/image/upload")
async def upload_medical_image(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        image_data = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name

        result = chatbot.process_image(temp_file_path, filename=file.filename)
        os.unlink(temp_file_path)

        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))

        return {
            "success": True,
            "modality": result["modality"],
            "confidence": result["confidence"],
            "reports_count": result["reports_count"],
            "avg_similarity": result.get("avg_similarity", 0.0),
            "top_similarity": result.get("top_similarity", 0.0),
            "relevance_quality": result.get("relevance_quality", "UNKNOWN"),
            "session_id": chatbot.image_session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/image/chat")
async def image_chat(question: str = Form(...)):
    try:
        answer = chatbot.chat_about_image(question)
        return {
            "success": True,
            "question": question,
            "answer": answer,
            "llm": "groq_llama_3.3_70b",
            "session_id": chatbot.image_session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# General Endpoints
@app.get("/status")
async def get_system_status():
    return {
        "success": True,
        "device": device,
        "llm": "Groq (Llama 3.3 70B Versatile)",
        "database": "connected" if mongo_manager.is_connected() else "disconnected",
        "current_mode": chatbot.mode,
        "symptom_session": chatbot.symptom_session_id,
        "image_session": chatbot.image_session_id,
        "image_loaded": chatbot.current_image is not None,
        "stats": mongo_manager.get_global_stats() if mongo_manager.is_connected() else {}
    }

@app.get("/history/{session_id}")
async def get_history(session_id: str, limit: int = 50):
    try:
        if not mongo_manager.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")

        history = mongo_manager.get_conversation_history(session_id, limit)
        for item in history:
            item['_id'] = str(item['_id'])

        return {"success": True, "session_id": session_id, "count": len(history), "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_global_stats():
    try:
        if not mongo_manager.is_connected():
            raise HTTPException(status_code=503, detail="Database not connected")

        stats = mongo_manager.get_global_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "llm": "groq",
        "database": "connected" if mongo_manager.is_connected() else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/reset")
async def reset_system():
    chatbot.start_symptom_session()
    chatbot.start_image_session()
    return {"success": True, "message": "System reset complete"}

# ============================================
# SECTION 10: SERVER LAUNCH
# ============================================
def launch_unified_server(port=8000):
    print(f"\n{'='*70}")
    print("🏥 LAUNCHING UNIFIED MEDICAL AI SYSTEM WITH GROQ")
    print(f"{'='*70}")

    try:
        os.system("pkill -f uvicorn 2>/dev/null || true")
        time.sleep(2)

        ngrok_token = os.getenv("NGROK_AUTH_TOKEN", "")
        if not ngrok_token:
            raise ValueError("NGROK_AUTH_TOKEN environment variable is required")
        ngrok.set_auth_token(ngrok_token)

        public_url = ngrok.connect(port)
        ngrok_url = str(public_url).split('"')[1] if '"' in str(public_url) else str(public_url)

        print(f"\n✅ SERVER READY!")
        print(f"{'='*70}")
        print(f"🌐 API URL: {ngrok_url}")
        print(f"📚 Docs: {ngrok_url}/docs")
        print(f"🤖 LLM: Groq (Llama 3.3 70B Versatile)")
        print(f"🗄️  Database: {'✅ Connected' if mongo_manager.is_connected() else '⚠️  Disconnected'}")
        print(f"\n{'='*70}")
        print("📋 ENDPOINTS:")
        print(f"{'='*70}")
        print("\n🩺 SYMPTOM DIAGNOSIS:")
        print(f"POST {ngrok_url}/symptom/start")
        print(f"POST {ngrok_url}/symptom/chat")
        print("\n🖼️  IMAGE ANALYSIS (Query-Aware):")
        print(f"POST {ngrok_url}/image/start")
        print(f"POST {ngrok_url}/image/upload")
        print(f"POST {ngrok_url}/image/chat")
        print("\n📊 GENERAL:")
        print(f"GET  {ngrok_url}/status")
        print(f"GET  {ngrok_url}/history/{{session_id}}")
        print(f"GET  {ngrok_url}/stats")
        print(f"GET  {ngrok_url}/health")
        print(f"POST {ngrok_url}/reset")
        print(f"\n{'='*70}")
        print("💡 COPY THIS FOR YOUR FRONTEND:")
        print(f"{'='*70}")
        print(f"const API_BASE_URL = '{ngrok_url}';")
        print(f"const LLM_PROVIDER = 'groq';")
        print(f"const LLM_MODEL = 'llama-3.3-70b-versatile';")
        print(f"\n{'='*70}")
        print("\n⚠️  KEEP THIS CELL RUNNING!")
        print(f"{'='*70}\n")

        def run_server():
            uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")

        server_thread = threading.Thread(target=run_server, daemon=False)
        server_thread.start()

        time.sleep(3)

        try:
            while True:
                time.sleep(60)
                db_status = "🟢" if mongo_manager.is_connected() else "🔴"
                print(f"[{time.strftime('%H:%M:%S')}] Server: {ngrok_url} | DB: {db_status} | LLM: 🤖 Groq")
        except KeyboardInterrupt:
            print("\n🛑 Shutting down...")
            if mongo_manager.is_connected():
                mongo_manager.close()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

# ============================================
# SECTION 11: SYSTEM SUMMARY & AUTO-START
# ============================================
print("\n" + "="*70)
print("🏥 UNIFIED MEDICAL AI SYSTEM WITH GROQ - READY")
print("="*70)
print(f"Device: {device}")
print(f"LLM: Groq (Llama 3.3 70B Versatile)")
print(f"Database: {'✅ Connected' if mongo_manager.is_connected() else '⚠️  Disconnected'}")
if mongo_manager.is_connected():
    print(f"Database Name: {mongo_manager.database_name}")
    print(f"Collections: {mongo_manager.db.list_collection_names()}")
print(f"\n📊 SYSTEM COMPONENTS:")
print(f"  • Symptom Diagnosis: {len(symptom_df)} records")
print(f"  • Image Analysis: {sum(len(v) for v in corpus_data.values())} medical reports")
print(f"  • Vision Encoder: ResNet50 (256-dim embeddings)")
print(f"  • Text Encoder: Bio_ClinicalBERT (256-dim embeddings)")
print(f"  • Modality Classifier: CLIP (openai/clip-vit-base-patch32)")
print(f"  • Language Model: Groq Llama 3.3 70B Versatile")
print(f"\n✨ KEY FEATURES:")
print(f"  ✓ Query-aware medical image analysis")
print(f"  ✓ Relevance-based report filtering (threshold: 0.3)")
print(f"  ✓ Medical keyword extraction from questions")
print(f"  ✓ Context quality indicators (HIGH/MEDIUM/LOW)")
print(f"  ✓ Similarity score tracking")
print(f"  ✓ Enhanced MongoDB metadata storage")
print(f"  ✓ Automatic fallback to alternative Groq models")
print("="*70 + "\n")

# Initialize both sessions
chatbot.start_symptom_session()
chatbot.start_image_session()

print("🚀 Starting server with Groq integration...")
launch_unified_server()