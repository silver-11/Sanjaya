# Dataset Information

## Overview

This project uses multiple datasets for training and inference:

## 1. Symptom-Disease Dataset

**Source:** Hugging Face Datasets
- **Dataset Name:** `dux-tecblic/symptom-disease-dataset`
- **Link:** https://huggingface.co/datasets/dux-tecblic/symptom-disease-dataset
- **Type:** Text classification dataset
- **Usage:** Symptom-based disease prediction
- **Format:** CSV/JSON with symptom text and disease labels

### Disease Mapping

The dataset includes the following disease categories:
- Asthma (ID: 35)
- Influenza (Flu) (ID: 79)
- Pneumonia (ID: 149)
- Viral Infection (ID: 234)
- Common Cold Variant (ID: 275)
- Bronchitis (ID: 284)
- Common Cold (ID: 510)
- Seasonal Flu (ID: 766)
- Tuberculosis (ID: 403)
- Migraine (ID: 308)
- Posterior Cortical Atrophy (ID: 785)
- Malaria (ID: 596)
- Ovarian Insufficiency (ID: 798)
- Cancer (ID: 376)

## 2. Medical Image Analysis Corpus

**Source:** Custom medical report corpus
- **Type:** Medical imaging reports (Radiology, Pathology, Ophthalmology)
- **Format:** Text reports with image embeddings
- **Usage:** Retrieval-augmented generation for medical image analysis

### Modalities Supported:
- **Radiology:** X-Ray, CT, MRI reports
- **Pathology:** Histopathology, biopsy reports
- **Ophthalmology:** Fundus, retinal imaging reports

### Dataset Structure:
The corpus is organized by modality and contains:
- Medical imaging reports
- Associated embeddings (256-dimensional)
- FAISS indices for similarity search

## 3. Model Checkpoints

### Trained Models Required:

1. **Symptom Diagnosis Model**
   - **File:** `disease_sentence_model.pkl`
   - **Type:** Sentence Transformer model
   - **Usage:** Symptom embedding and similarity matching
   - **Location:** Should be placed in your model directory or Google Drive

2. **Image Analysis Checkpoint**
   - **File:** `checkpoint_chunk_5_epoch_9.pth`
   - **Type:** PyTorch checkpoint with Vision and Text encoders
   - **Components:**
     - Vision Encoder: ResNet50-based (256-dim embeddings)
     - Text Encoder: Bio_ClinicalBERT-based (256-dim embeddings)
   - **Usage:** Medical image-to-text retrieval

## Download Instructions

### Model Checkpoints (Git LFS)

Model checkpoints are stored in this repository using Git LFS. To download them:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/DUP

# Pull LFS files (downloads the actual model files)
git lfs pull

# Models will be in:
# - models/checkpoint_chunk_5_epoch_9.pth
# - models/disease_sentence_model.pkl
```

**Note:** If Git LFS is not installed on your system, download it from https://git-lfs.github.com/ and run `git lfs install` before pulling the models.

### Symptom-Disease Dataset (Automatic Download)

The symptom-disease dataset is automatically downloaded when you run the backend:
```python
from datasets import load_dataset
dataset = load_dataset("dux-tecblic/symptom-disease-dataset", split="train")
```

### Alternative: Manual Download

If you prefer to download models manually:
1. Visit the GitHub repository
2. Navigate to `models/` directory
3. Download the model files directly
4. Place them in your project's `models/` directory

### Google Colab Setup

If using Google Colab:
1. Clone the repository
2. Run `git lfs pull` to download model files
3. Models will be available in the `models/` directory

## Dataset Preprocessing

The datasets are preprocessed as follows:

1. **Symptom Dataset:**
   - Text normalization (lowercase, punctuation removal)
   - Embedding generation using sentence transformers
   - FAISS index creation for fast similarity search

2. **Medical Reports Corpus:**
   - Modality classification using CLIP
   - Text embedding generation using trained Bio_ClinicalBERT
   - FAISS index creation per modality

## Data Privacy and Ethics

⚠️ **Important Notes:**
- All medical data should be anonymized
- Patient identifiers must be removed
- This project is for educational/research purposes
- Not intended for clinical diagnosis without proper validation
- Ensure compliance with HIPAA and local regulations

## Alternative Datasets

If you want to use different datasets:

1. **Medical Image Datasets:**
   - MIMIC-CXR: https://physionet.org/content/mimic-cxr/2.0.0/
   - CheXpert: https://stanfordmlgroup.github.io/competitions/chexpert/
   - NIH Chest X-ray: https://www.nih.gov/news-events/news-releases/nih-clinical-center-provides-one-largest-publicly-available-chest-x-ray-datasets-scientific-community

2. **Symptom Datasets:**
   - Search Hugging Face for "medical symptoms" or "disease diagnosis"
   - Use your own curated dataset

## Citation

If you use the symptom-disease dataset, please cite:
```
@dataset{dux_tecblic_symptom_disease,
  title={Symptom Disease Dataset},
  author={Dux Tecblic},
  year={2024},
  url={https://huggingface.co/datasets/dux-tecblic/symptom-disease-dataset}
}
```

## Questions?

For dataset-related questions, please:
1. Check the dataset documentation on Hugging Face
2. Review the backend code in `collabbackend.py`
3. Open an issue on GitHub

