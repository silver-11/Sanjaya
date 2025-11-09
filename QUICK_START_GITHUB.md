# Quick GitHub Push Guide

## One-Command Setup (After Initial Setup)

```bash
# Navigate to project
cd DUP

# Add, commit, and push
git add . && git commit -m "Update project files" && git push
```

## First Time Setup

```bash
# 1. Initialize (if needed)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Sanjaya Medical AI"

# 4. Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push
git branch -M main
git push -u origin main
```

## Update Repository

```bash
git add .
git commit -m "Your commit message"
git push
```

## Check Status

```bash
git status          # See what changed
git log --oneline   # See commit history
git remote -v       # Check remote URL
```

---

**For detailed instructions, see [GITHUB_SETUP.md](./GITHUB_SETUP.md)**

