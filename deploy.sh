#!/bin/bash

echo "🚀 HypeFlow AI Pro - Quick Deploy Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "enhanced-hypeflow-ai-pro.html" ]; then
    echo "❌ Error: enhanced-hypeflow-ai-pro.html not found"
    echo "Please run this script from the project directory"
    exit 1
fi

echo "📁 Project files found!"

# Option 1: Vercel (Recommended)
if command -v vercel &> /dev/null; then
    echo ""
    echo "🎯 Deploying to Vercel..."
    echo "This will make your site accessible worldwide!"
    echo ""
    
    # Deploy to Vercel
    vercel --prod --yes
    
    echo ""
    echo "✅ Successfully deployed to Vercel!"
    echo "🌐 Your site is now live and accessible to everyone!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Find your project"
    echo "3. Click 'Domains' tab"
    echo "4. Add custom domain: hypeflow.com"
    echo "5. Update DNS records as instructed"
    echo ""
    echo "🎉 Your site will be live at: https://hypeflow.com"
    
elif command -v netlify &> /dev/null; then
    echo ""
    echo "🎯 Deploying to Netlify..."
    echo "This will make your site accessible worldwide!"
    echo ""
    
    # Deploy to Netlify
    netlify deploy --prod --dir=. --open
    
    echo ""
    echo "✅ Successfully deployed to Netlify!"
    echo "🌐 Your site is now live and accessible to everyone!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://app.netlify.com"
    echo "2. Find your site"
    echo "3. Go to 'Domain management'"
    echo "4. Add custom domain: hypeflow.com"
    echo "5. Update DNS records as instructed"
    echo ""
    echo "🎉 Your site will be live at: https://hypeflow.com"
    
else
    echo ""
    echo "⚠️  Neither Vercel nor Netlify CLI found"
    echo ""
    echo "🔧 Install one of these for easy deployment:"
    echo ""
    echo "For Vercel (Recommended):"
    echo "npm install -g vercel"
    echo ""
    echo "For Netlify:"
    echo "npm install -g netlify-cli"
    echo ""
    echo "Then run this script again!"
    echo ""
    echo "📖 Or follow the manual deployment guide in deployment-guide.md"
fi

echo ""
echo "🎯 Alternative: GitHub Pages"
echo "1. Create GitHub repository"
echo "2. Upload files"
echo "3. Enable Pages in settings"
echo "4. Add custom domain"
echo ""
echo "📖 See deployment-guide.md for detailed instructions"