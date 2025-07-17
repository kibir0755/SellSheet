#!/bin/bash
# Force deployment script
echo "Building project..."
npm run build
echo "Adding all files to git..."
git add -A
echo "Committing changes..."
git commit -m "FORCE DEPLOY v3.0: Working native HTML edit/delete buttons - $(date)"
echo "Pushing to GitHub..."
git push --force origin main
echo "Deployment script completed!"
