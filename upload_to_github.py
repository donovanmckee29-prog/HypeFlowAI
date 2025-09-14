#!/usr/bin/env python3
"""
Simple script to help upload files to GitHub for Pages deployment
"""

import os
import subprocess
import sys

def run_command(cmd):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("🚀 HypeFlow AI Pro - GitHub Upload Helper")
    print("=" * 50)
    
    # Check if we're in a git repository
    if not os.path.exists('.git'):
        print("❌ Not in a git repository. Initializing...")
        success, stdout, stderr = run_command("git init")
        if not success:
            print(f"❌ Failed to initialize git: {stderr}")
            return
    
    # Check git status
    success, stdout, stderr = run_command("git status --porcelain")
    if success and stdout.strip():
        print("📁 Files need to be committed...")
        
        # Add all files
        success, stdout, stderr = run_command("git add .")
        if not success:
            print(f"❌ Failed to add files: {stderr}")
            return
        
        # Commit files
        success, stdout, stderr = run_command('git commit -m "Deploy HypeFlow AI Pro to GitHub Pages"')
        if not success:
            print(f"❌ Failed to commit files: {stderr}")
            return
        
        print("✅ Files committed successfully!")
    
    # Check if we have a remote
    success, stdout, stderr = run_command("git remote -v")
    if not success or not stdout.strip():
        print("\n📋 Next steps to deploy:")
        print("1. Go to https://github.com")
        print("2. Create a new repository called 'hypeflow-ai-pro'")
        print("3. Copy the repository URL")
        print("4. Run: git remote add origin <repository-url>")
        print("5. Run: git push -u origin main")
        print("6. Go to repository Settings > Pages")
        print("7. Select 'Deploy from a branch' > 'main' > '/ (root)'")
        print("8. Your site will be live at: https://yourusername.github.io/hypeflow-ai-pro")
        print("\n🎯 Your files are ready to upload!")
    else:
        print("✅ Remote repository found!")
        print("🌐 Pushing to GitHub...")
        
        success, stdout, stderr = run_command("git push origin main")
        if success:
            print("✅ Successfully pushed to GitHub!")
            print("🌐 Your site should be live shortly at your GitHub Pages URL")
        else:
            print(f"❌ Failed to push: {stderr}")
            print("Try running: git push -u origin main")

if __name__ == "__main__":
    main()
