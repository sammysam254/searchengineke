const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build setup...');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found! Are we in the client directory?');
  process.exit(1);
}

// Check if public directory and index.html exist
if (!fs.existsSync('public')) {
  console.error('❌ public directory not found!');
  process.exit(1);
}

if (!fs.existsSync('public/index.html')) {
  console.error('❌ public/index.html not found!');
  process.exit(1);
}

// Check if src directory exists
if (!fs.existsSync('src')) {
  console.error('❌ src directory not found!');
  process.exit(1);
}

// Check if App.js exists
if (!fs.existsSync('src/App.js')) {
  console.error('❌ src/App.js not found!');
  process.exit(1);
}

console.log('✅ All required files found');
console.log('📁 Current directory:', process.cwd());
console.log('📄 Files in public:', fs.readdirSync('public'));
console.log('📄 Files in src:', fs.readdirSync('src'));

console.log('✅ Build verification completed successfully!');