#!/bin/bash

echo "🚀 HYPEFLOW AI PRO - ONE CLICK DEPLOY"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -d "hypeflow-deployment" ]; then
    echo "❌ hypeflow-deployment folder not found!"
    echo "Run: python3 simple_deploy.py first"
    exit 1
fi

echo "✅ Deployment package found!"
echo ""

# Try Surge.sh first (easiest)
echo "🎯 Trying Surge.sh deployment..."
cd hypeflow-deployment

if command -v npx &> /dev/null; then
    echo "📦 Deploying to Surge.sh..."
    npx surge . hypeflow-ai-pro-$(date +%s).surge.sh
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Your site is now live!"
        echo "🌐 Check the URL above"
        echo ""
        echo "📋 Next steps:"
        echo "1. Copy the URL from above"
        echo "2. Share it with others"
        echo "3. For custom domain, buy at namecheap.com"
        echo "4. Add domain in Surge dashboard"
        exit 0
    fi
fi

echo ""
echo "⚠️  Surge.sh failed, trying alternative..."

# Try to open deployment instructions
if [ -f "DEPLOY_INSTRUCTIONS.md" ]; then
    echo "📖 Opening deployment instructions..."
    if command -v open &> /dev/null; then
        open DEPLOY_INSTRUCTIONS.md
    elif command -v xdg-open &> /dev/null; then
        xdg-open DEPLOY_INSTRUCTIONS.md
    else
        echo "📖 See DEPLOY_INSTRUCTIONS.md for manual deployment steps"
    fi
fi

echo ""
echo "🎯 MANUAL DEPLOYMENT OPTIONS:"
echo "1. Vercel: https://vercel.com (drag & drop hypeflow-deployment folder)"
echo "2. Netlify: https://netlify.com (drag & drop hypeflow-deployment folder)"
echo "3. GitHub Pages: Upload to GitHub repository"
echo ""
echo "Your files are ready in: hypeflow-deployment/"
