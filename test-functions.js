const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Netlify functions directory structure...');

// Check if netlify/functions directory exists
const functionsDir = path.join(__dirname, 'netlify', 'functions');
console.log('Functions directory path:', functionsDir);
console.log('Functions directory exists:', fs.existsSync(functionsDir));

if (fs.existsSync(functionsDir)) {
  const files = fs.readdirSync(functionsDir);
  console.log('Files in functions directory:', files);
  
  // Check specific function files
  const requiredFunctions = [
    'search-web.js',
    'search-all.js', 
    'debug.js',
    'health-check.js'
  ];
  
  requiredFunctions.forEach(func => {
    const funcPath = path.join(functionsDir, func);
    const exists = fs.existsSync(funcPath);
    console.log(`${func}: ${exists ? '✅' : '❌'}`);
    
    if (exists) {
      const stats = fs.statSync(funcPath);
      console.log(`  Size: ${stats.size} bytes`);
      console.log(`  Modified: ${stats.mtime.toISOString()}`);
    }
  });
} else {
  console.error('❌ Functions directory not found!');
}

console.log('✅ Function directory test completed');