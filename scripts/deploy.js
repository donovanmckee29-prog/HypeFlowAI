#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 HypeFlow AI Pro - Deployment Script');
console.log('=====================================');

// Check if we're in a git repository
if (!fs.existsSync('.git')) {
    console.log('❌ Not in a git repository. Initializing...');
    execSync('git init', { stdio: 'inherit' });
}

// Check git status
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
        console.log('📁 Files need to be committed...');
        
        // Add all files
        execSync('git add .', { stdio: 'inherit' });
        
        // Commit files
        execSync('git commit -m "Deploy HypeFlow AI Pro v1.0.0"', { stdio: 'inherit' });
        
        console.log('✅ Files committed successfully!');
    }
} catch (error) {
    console.log('⚠️  Git status check failed:', error.message);
}

// Check if we have a remote
try {
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (!remotes.trim()) {
        console.log('\n📋 Next steps to deploy:');
        console.log('1. Go to https://github.com');
        console.log('2. Create a new repository called "HypeFlow-AI"');
        console.log('3. Copy the repository URL');
        console.log('4. Run: git remote add origin <repository-url>');
        console.log('5. Run: git push -u origin main');
        console.log('6. Go to repository Settings > Pages');
        console.log('7. Select "Deploy from a branch" > "main" > "/ (root)"');
        console.log('8. Your site will be live at: https://yourusername.github.io/HypeFlow-AI');
        console.log('\n🎯 Your files are ready to upload!');
    } else {
        console.log('✅ Remote repository found!');
        console.log('🌐 Pushing to GitHub...');
        
        try {
            execSync('git push origin main', { stdio: 'inherit' });
            console.log('✅ Successfully pushed to GitHub!');
            console.log('🌐 Your site should be live shortly at your GitHub Pages URL');
        } catch (error) {
            console.log('❌ Failed to push:', error.message);
            console.log('Try running: git push -u origin main');
        }
    }
} catch (error) {
    console.log('❌ Error checking remotes:', error.message);
}

console.log('\n🎉 Deployment process complete!');
console.log('📖 Check the README.md for more deployment options');
