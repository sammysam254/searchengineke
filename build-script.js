const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build environment...');

// Check if client directory exists
const clientDir = path.join(__dirname, 'client');
console.log('Client directory exists:', fs.existsSync(clientDir));

// Check if public directory exists
const publicDir = path.join(clientDir, 'public');
console.log('Public directory exists:', fs.existsSync(publicDir));

// Check if index.html exists
const indexPath = path.join(publicDir, 'index.html');
console.log('index.html exists:', fs.existsSync(indexPath));

if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  console.log('index.html content length:', content.length);
  console.log('index.html first 100 chars:', content.substring(0, 100));
}

// List all files in public directory
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  console.log('Files in public directory:', files);
}

console.log('✅ Build environment check complete');