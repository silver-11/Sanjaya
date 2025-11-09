# Model Checkpoints Upload Guide

This guide will help you upload your model checkpoints to GitHub using Git LFS (Large File Storage).

## What is Git LFS?

Git LFS (Large File Storage) is a Git extension that allows you to store large files (like model checkpoints) in your repository without hitting GitHub's 100MB file size limit.

## Prerequisites

1. **Git LFS installed** on your system
2. **Model checkpoint files** ready to upload
3. **Git repository** initialized

## Step 1: Install Git LFS

### Windows
```powershell
# Method 1: Direct Download (Recommended)
# 1. Go to: https://git-lfs.github.com/
# 2. Download Windows installer (.exe)
# 3. Run the installer
# 4. Restart PowerShell

# Method 2: Using winget (Windows 10/11)
winget install --id Git.GitLFS -e --source winget

# Method 3: Using Chocolatey (if installed)
choco install git-lfs

# See INSTALL_GIT_LFS_WINDOWS.md for detailed instructions
```

### Mac
```bash
# Using Homebrew
brew install git-lfs

# Or download from: https://git-lfs.github.com/
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install git-lfs

# Or download from: https://git-lfs.github.com/
```

### Verify Installation
```bash
git lfs version
# Should show: git-lfs/x.x.x
```

## Step 2: Initialize Git LFS in Your Repository

```bash
# Navigate to your project
cd DUP

# Initialize Git LFS
git lfs install

# This sets up Git LFS for your user account
```

## Step 3: Prepare Your Model Files

Create a directory structure for your models:

```bash
# Create models directory
mkdir -p models/checkpoints

# Copy your model files to the repository
# Replace these paths with your actual file locations

# For Windows (PowerShell)
Copy-Item "C:\path\to\checkpoint_chunk_5_epoch_9.pth" -Destination "models\checkpoints\"
Copy-Item "C:\path\to\disease_sentence_model.pkl" -Destination "models\"

# For Linux/Mac
cp /path/to/checkpoint_chunk_5_epoch_9.pth models/checkpoints/
cp /path/to/disease_sentence_model.pkl models/
```

### Recommended Structure:
```
DUP/
├── models/
│   ├── checkpoint_chunk_5_epoch_9.pth
│   └── disease_sentence_model.pkl
└── ...
```

Or if you prefer:
```
DUP/
├── models/
│   ├── checkpoints/
│   │   └── checkpoint_chunk_5_epoch_9.pth
│   └── disease_sentence_model.pkl
└── ...
```

## Step 4: Track Model Files with Git LFS

The `.gitattributes` file is already configured to track model files. Verify it exists:

```bash
# Check if .gitattributes exists
cat .gitattributes
```

If you want to track specific files or directories:

```bash
# Track all .pth files
git lfs track "*.pth"

# Track all .pkl files
git lfs track "*.pkl"

# Track specific directory
git lfs track "models/**"

# Track specific file
git lfs track "models/checkpoint_chunk_5_epoch_9.pth"
```

## Step 5: Add and Commit Model Files

```bash
# Add .gitattributes (if you modified it)
git add .gitattributes

# Add model files
git add models/

# Or add specific files
git add models/checkpoint_chunk_5_epoch_9.pth
git add models/disease_sentence_model.pkl

# Check what will be committed (should show LFS files)
git status

# Commit
git commit -m "Add model checkpoints using Git LFS"
```

## Step 6: Push to GitHub

```bash
# Push to GitHub
git push origin main

# If you get an error about LFS, try:
git lfs push origin main --all
```

**Note:** The first push with LFS files may take longer depending on file sizes.

## Step 7: Verify Upload

1. Go to your GitHub repository
2. Navigate to the `models/` directory
3. You should see your model files
4. Click on a file - it should show "Stored with Git LFS" badge

## Step 8: Update Documentation

Update your code to reference the new model paths:

### For `collabbackend.py`:

```python
# Update checkpoint paths
CHECKPOINT_PATH = "models/checkpoints/checkpoint_chunk_5_epoch_9.pth"
SYMPTOM_MODEL_PATH = "models/disease_sentence_model.pkl"

# Or if models are in root:
# CHECKPOINT_PATH = "models/checkpoint_chunk_5_epoch_9.pth"
```

### Update `DATASET.md`:

Add a section about model location:
```markdown
## Model Checkpoints Location

Model checkpoints are stored in the repository using Git LFS:
- `models/checkpoint_chunk_5_epoch_9.pth` - Vision-text encoder
- `models/disease_sentence_model.pkl` - Symptom diagnosis model

To download models when cloning:
```bash
git lfs pull
```
```

## Troubleshooting

### Error: "git: 'lfs' is not a git command"
- **Solution:** Install Git LFS (see Step 1)

### Error: "This repository is over its data quota"
- **Solution:** 
  - GitHub free tier includes 1GB LFS storage
  - Upgrade to GitHub Pro for more storage
  - Or use cloud storage and provide download links

### Error: "File is too large"
- **Solution:** 
  - Ensure Git LFS is properly initialized
  - Check `.gitattributes` is committed
  - Verify files are tracked: `git lfs ls-files`

### Models not showing as LFS
- **Solution:**
  ```bash
  # Re-track files
  git lfs track "*.pth"
  git lfs track "*.pkl"
  git add .gitattributes
  git add models/
  git commit -m "Fix LFS tracking"
  git push
  ```

### Check LFS Status
```bash
# List LFS tracked files
git lfs ls-files

# Check LFS info
git lfs env

# Check file sizes
git lfs migrate info --include="*.pth,*.pkl"
```

## Alternative: Using GitHub Releases

If Git LFS quota is an issue, you can use GitHub Releases:

1. **Create a Release:**
   - Go to your repository → Releases → Create a new release
   - Tag: `v1.0.0`
   - Title: "Model Checkpoints"
   - Upload model files as release assets

2. **Update Documentation:**
   ```markdown
   ## Download Models
   
   Download model checkpoints from [Releases](https://github.com/YOUR_USERNAME/YOUR_REPO/releases):
   - checkpoint_chunk_5_epoch_9.pth
   - disease_sentence_model.pkl
   ```

## Git LFS Quota Information

- **Free GitHub accounts:** 1GB storage, 1GB bandwidth/month
- **GitHub Pro:** 50GB storage, 50GB bandwidth/month
- **GitHub Team/Enterprise:** More storage available

Check your usage: https://github.com/settings/billing

## Best Practices

1. **Only upload final models** - Don't commit every training checkpoint
2. **Compress if possible** - Some models can be compressed
3. **Document model versions** - Keep track of which models are which
4. **Use releases for major versions** - Tag important model versions

## Quick Reference

```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "*.pth"
git lfs track "*.pkl"

# Add and commit
git add .gitattributes
git add models/
git commit -m "Add models"

# Push
git push origin main

# When cloning, pull LFS files
git lfs pull
```

## Next Steps

After uploading models:
1. ✅ Update `collabbackend.py` with new paths
2. ✅ Update `DATASET.md` with model locations
3. ✅ Update `README.md` to mention models are included
4. ✅ Test that models load correctly
5. ✅ Update setup instructions

---

**Need Help?** Check the [Git LFS Documentation](https://git-lfs.github.com/)

