const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-build check starting...');

const clientDir = path.join(__dirname, 'client');
const publicDir = path.join(clientDir, 'public');
const indexPath = path.join(publicDir, 'index.html');
const backupPath = path.join(publicDir, 'index.backup.html');

// Ensure client directory exists
if (!fs.existsSync(clientDir)) {
    console.error('❌ Client directory not found!');
    process.exit(1);
}

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    console.log('📁 Creating public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
}

// Check if index.html exists, if not, copy from backup
if (!fs.existsSync(indexPath)) {
    console.log('⚠️ index.html not found, copying from backup...');
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, indexPath);
        console.log('✅ index.html restored from backup');
    } else {
        console.error('❌ No backup index.html found!');
        process.exit(1);
    }
} else {
    console.log('✅ index.html found');
}

// List all files in public directory
const files = fs.readdirSync(publicDir);
console.log('📁 Files in public directory:', files);

console.log('✅ Pre-build check completed successfully');