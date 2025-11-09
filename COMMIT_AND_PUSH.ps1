# Quick Commit and Push Script
# Run this to commit all changes and push to GitHub

Write-Host "=== Git Repository Status ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Adding all files ===" -ForegroundColor Cyan
git add .

Write-Host "`n=== Files to be committed ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== Committing changes ===" -ForegroundColor Cyan
git commit -m "Add comprehensive documentation and setup files

- Add complete documentation (README, SETUP, DEPLOYMENT, etc.)
- Add Git LFS configuration for model checkpoints
- Add model upload guides
- Add GitHub setup instructions
- Update .gitignore for proper file exclusion
- Add requirements.txt for Python dependencies"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
Write-Host "Current branch: " -NoNewline
git branch --show-current
Write-Host "`nPushing to origin..." -ForegroundColor Yellow

git push origin feature/admin-portal

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Check your GitHub repository to verify the push." -ForegroundColor Green

