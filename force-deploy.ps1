# PowerShell Force deployment script
Write-Host "Building project..."
npm run build
Write-Host "Adding all files to git..."
git add -A
Write-Host "Committing changes..."
git commit -m "FORCE DEPLOY v3.0: Working native HTML edit/delete buttons - $(Get-Date)"
Write-Host "Pushing to GitHub..."
git push --force origin main
Write-Host "Deployment script completed!"
