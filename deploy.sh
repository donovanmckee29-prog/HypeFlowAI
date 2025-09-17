#!/bin/bash

echo "🚀 Deploying HypeFlow AI to production..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if Vercel CLI is installed
    if command -v vercel &> /dev/null; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
    else
        echo "⚠️  Vercel CLI not found. Please install it with: npm i -g vercel"
        echo "📁 Build files are ready in the 'build' directory"
        echo "🌐 You can deploy manually to:"
        echo "   - Vercel: https://vercel.com"
        echo "   - Netlify: https://netlify.com"
        echo "   - GitHub Pages: https://pages.github.com"
    fi
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
