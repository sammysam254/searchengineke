#!/bin/bash

echo "🚀 Starting INFINITUM build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are we in the client directory?"
    exit 1
fi

# Check if public/index.html exists
if [ ! -f "public/index.html" ]; then
    echo "❌ Error: public/index.html not found!"
    exit 1
fi

echo "✅ Found package.json and index.html"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the project
echo "🔨 Building React app..."
CI=false npm run build

echo "✅ Build completed successfully!"

# List build directory contents
if [ -d "build" ]; then
    echo "📁 Build directory contents:"
    ls -la build/
else
    echo "❌ Build directory not created!"
    exit 1
fi