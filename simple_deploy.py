#!/usr/bin/env python3
"""
Simple deployment script that creates a ready-to-upload package
"""

import os
import shutil
import zipfile
from datetime import datetime

def create_deployment_package():
    """Create a deployment package with all necessary files"""
    print("🚀 Creating HypeFlow AI Pro Deployment Package")
    print("=" * 50)
    
    # Create deployment directory
    deploy_dir = "hypeflow-deployment"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    
    # Essential files to include
    essential_files = [
        "enhanced-hypeflow-ai-pro.html",
        "index.html", 
        "package.json",
        "requirements.txt",
        "deployment-guide.md",
        "README.md"
    ]
    
    # Copy essential files
    for file in essential_files:
        if os.path.exists(file):
            shutil.copy2(file, deploy_dir)
            print(f"✅ Copied {file}")
        else:
            print(f"⚠️  {file} not found")
    
    # Create a simple server file for platforms that need it
    server_js = """const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Route for main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for enhanced app
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'enhanced-hypeflow-ai-pro.html'));
});

app.listen(port, () => {
    console.log(`HypeFlow AI Pro running on port ${port}`);
});
"""
    
    with open(os.path.join(deploy_dir, "server.js"), "w") as f:
        f.write(server_js)
    
    # Create package.json for Node.js hosting
    package_json = """{
  "name": "hypeflow-ai-pro",
  "version": "1.0.0",
  "description": "Ultimate AI-Powered Sports Card Investment Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}"""
    
    with open(os.path.join(deploy_dir, "package.json"), "w") as f:
        f.write(package_json)
    
    # Create a simple index.html that redirects to the main app
    index_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HypeFlow AI Pro</title>
    <meta http-equiv="refresh" content="0; url=enhanced-hypeflow-ai-pro.html">
</head>
<body>
    <p>Redirecting to HypeFlow AI Pro...</p>
    <p><a href="enhanced-hypeflow-ai-pro.html">Click here if not redirected</a></p>
</body>
</html>"""
    
    with open(os.path.join(deploy_dir, "index.html"), "w") as f:
        f.write(index_content)
    
    # Create deployment instructions
    instructions = f"""# HypeFlow AI Pro - Deployment Instructions
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Quick Deploy Options:

### Option 1: Vercel (Recommended)
1. Go to https://vercel.com
2. Sign up/login
3. Click "New Project"
4. Drag and drop this entire folder
5. Deploy!
6. Get your live URL

### Option 2: Netlify
1. Go to https://netlify.com
2. Sign up/login
3. Drag and drop this entire folder
4. Deploy!
5. Get your live URL

### Option 3: GitHub Pages
1. Create GitHub repository
2. Upload all files
3. Go to Settings > Pages
4. Select source: Deploy from a branch
5. Select branch: main
6. Select folder: / (root)
7. Save
8. Your site will be live at: https://yourusername.github.io/repository-name

### Option 4: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Build command: npm install
5. Start command: npm start
6. Deploy!

## Files Included:
- enhanced-hypeflow-ai-pro.html (main application)
- index.html (landing page)
- server.js (Node.js server)
- package.json (dependencies)
- README.md (documentation)

## Features:
✅ AI-Powered eBay Integration
✅ Portfolio Management
✅ Market Analysis
✅ Quantum AI Grader
✅ Real-time Price Tracking
✅ 24+ eBay Search Strategies
✅ Mobile Optimized
✅ Professional UI/UX

Your HypeFlow AI Pro is ready to deploy! 🚀
"""
    
    with open(os.path.join(deploy_dir, "DEPLOY_INSTRUCTIONS.md"), "w") as f:
        f.write(instructions)
    
    # Create ZIP file
    zip_filename = f"hypeflow-ai-pro-{datetime.now().strftime('%Y%m%d-%H%M%S')}.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, deploy_dir)
                zipf.write(file_path, arc_path)
    
    print(f"\n✅ Deployment package created!")
    print(f"📁 Directory: {deploy_dir}/")
    print(f"📦 ZIP file: {zip_filename}")
    print(f"\n🌐 Ready to upload to any hosting platform!")
    print(f"📖 See {deploy_dir}/DEPLOY_INSTRUCTIONS.md for detailed steps")
    
    return deploy_dir, zip_filename

if __name__ == "__main__":
    create_deployment_package()
