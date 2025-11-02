# Deployment Guide for Vercel

## Step 1: Push to GitHub

### Option A: Create a new repository on GitHub first
1. Go to https://github.com/new
2. Create a new repository (e.g., `sanjaya-medical-ai`)
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### Option B: Use existing repository
If you already have a GitHub repository, note its URL.

### Push your code to GitHub:

```powershell
# Navigate to your project directory
cd DUP

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If you get authentication errors**, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys
- Or use GitHub CLI: `gh auth login`

---

## Step 2: Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect it's a Create React App project
5. Configure settings:
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: Leave as is (or set to `DUP` if needed)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)
6. **Add Environment Variables** (if needed):
   - `REACT_APP_API_BASE_URL`
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_NAME`
7. Click **"Deploy"**

### Option 2: Via Vercel CLI
```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
cd DUP
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No (or Yes if re-deploying)
# - Project name? (Enter a name)
# - Directory? (Press Enter for current directory)
# - Override settings? No
```

---

## Step 3: Configure Environment Variables in Vercel

After deployment:

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add your variables:
   - `REACT_APP_API_BASE_URL` = your backend API URL
   - `REACT_APP_GOOGLE_CLIENT_ID` = your Google OAuth client ID
   - `REACT_APP_NAME` = Sanjaya Medical AI (optional)
4. Click **Save**
5. Go to **Deployments** tab
6. Click the **three dots** (⋯) on the latest deployment
7. Select **Redeploy** to apply the new environment variables

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure `package.json` has correct build scripts
- Check for TypeScript errors (if using TypeScript)

### Environment Variables Not Working
- Make sure variable names start with `REACT_APP_`
- Redeploy after adding environment variables
- Check that variables are added to the correct environment (Production/Preview/Development)

### Routing Issues
- Create a `vercel.json` file in your project root:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## After Deployment

Your app will be live at: `https://your-project-name.vercel.app`

You can:
- Set up a custom domain
- Configure automatic deployments from GitHub
- Set up preview deployments for pull requests
- Monitor performance and analytics

