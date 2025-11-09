# Quick Model Upload Guide

## Fast Setup (5 minutes)

### 1. Install Git LFS
```powershell
# Windows - EASIEST METHOD:
# 1. Go to: https://git-lfs.github.com/
# 2. Download Windows installer
# 3. Run the .exe file
# 4. Restart PowerShell

# Or using winget (Windows 10/11):
winget install --id Git.GitLFS -e --source winget

# Mac
brew install git-lfs

# Linux
sudo apt-get install git-lfs

# See INSTALL_GIT_LFS_WINDOWS.md for detailed Windows instructions
```

### 2. Initialize in Your Project
```bash
cd DUP
git lfs install
```

### 3. Copy Your Models
```bash
# Create directory
mkdir -p models/checkpoints

# Copy files (update paths to your actual files)
# Windows:
Copy-Item "C:\path\to\checkpoint_chunk_5_epoch_9.pth" models\checkpoints\
Copy-Item "C:\path\to\disease_sentence_model.pkl" models\

# Linux/Mac:
cp /path/to/checkpoint_chunk_5_epoch_9.pth models/checkpoints/
cp /path/to/disease_sentence_model.pkl models/
```

### 4. Add and Commit
```bash
git add .gitattributes
git add models/
git commit -m "Add model checkpoints with Git LFS"
```

### 5. Push
```bash
git push origin main
```

## Done! ✅

Your models are now in GitHub using Git LFS.

**For detailed instructions, see [MODEL_UPLOAD_GUIDE.md](./MODEL_UPLOAD_GUIDE.md)**

