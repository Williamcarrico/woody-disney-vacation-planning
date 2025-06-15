#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findDSStoreFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.name === '.DS_Store') {
      files.push(fullPath);
    } else if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
      findDSStoreFiles(fullPath, files);
    }
  }
  
  return files;
}

console.log('🔍 Searching for .DS_Store files...\n');

const dsStoreFiles = findDSStoreFiles('.');

if (dsStoreFiles.length === 0) {
  console.log('✨ No .DS_Store files found!');
} else {
  console.log(`Found ${dsStoreFiles.length} .DS_Store files:\n`);
  
  for (const file of dsStoreFiles) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Removed: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Removed ${dsStoreFiles.length} .DS_Store files.`);
} 