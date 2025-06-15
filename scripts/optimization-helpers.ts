#!/usr/bin/env node
/**
 * Optimization Helper Scripts
 * Tools to assist with codebase optimization and cleanup
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ImportAnalysis {
  file: string;
  imports: string[];
  lineNumber: number;
}

/**
 * Find all imports of a specific file
 */
async function findImportsOf(targetFile: string): Promise<ImportAnalysis[]> {
  const results: ImportAnalysis[] = [];
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', { ignore: 'node_modules/**' });
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes(targetFile) && (line.includes('import') || line.includes('require'))) {
        results.push({
          file,
          imports: [line.trim()],
          lineNumber: index + 1
        });
      }
    });
  }
  
  return results;
}

/**
 * Find and remove all .DS_Store files
 */
async function cleanDSStoreFiles(): Promise<string[]> {
  const dsStoreFiles = await glob('**/.DS_Store', { dot: true });
  const removed: string[] = [];
  
  for (const file of dsStoreFiles) {
    try {
      await fs.unlink(file);
      removed.push(file);
      console.log(`✅ Removed: ${file}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${file}:`, error);
    }
  }
  
  return removed;
}

/**
 * Analyze service usage patterns
 */
async function analyzeServiceUsage() {
  const services = [
    { name: 'Vacation Service (Generic)', path: 'src/lib/services/vacation.service' },
    { name: 'Vacation Service (Firebase)', path: 'src/lib/firebase/vacation-service' },
    { name: 'Cache Service (API)', path: 'src/lib/api/cache-service' },
    { name: 'Cache Service (Cache)', path: 'src/lib/cache/cache-service' },
  ];
  
  console.log('🔍 Analyzing Service Usage...\n');
  
  for (const service of services) {
    const imports = await findImportsOf(service.path);
    console.log(`📦 ${service.name}`);
    console.log(`   Path: ${service.path}`);
    console.log(`   Used in ${imports.length} files:`);
    
    imports.slice(0, 5).forEach(imp => {
      console.log(`   - ${imp.file}:${imp.lineNumber}`);
    });
    
    if (imports.length > 5) {
      console.log(`   ... and ${imports.length - 5} more files`);
    }
    console.log('');
  }
}

/**
 * Generate import mapping for safe refactoring
 */
async function generateImportMap(oldPath: string, newPath: string) {
  const imports = await findImportsOf(oldPath);
  const mapping: string[] = [];
  
  mapping.push('# Import Update Mapping');
  mapping.push(`## Replacing: ${oldPath}`);
  mapping.push(`## With: ${newPath}`);
  mapping.push('');
  
  imports.forEach(imp => {
    mapping.push(`- [ ] ${imp.file}:${imp.lineNumber}`);
    mapping.push(`  \`${imp.imports[0]}\``);
    mapping.push('');
  });
  
  const outputFile = `import-mapping-${Date.now()}.md`;
  await fs.writeFile(outputFile, mapping.join('\n'));
  console.log(`📝 Import mapping saved to: ${outputFile}`);
}

/**
 * Calculate potential savings
 */
async function calculateSavings() {
  const filesToRemove = [
    'src/lib/data/comprehensive-restaurants.ts',
    'src/lib/services/vacation.service.ts',
    'src/lib/api/cache-service.ts',
  ];
  
  let totalLines = 0;
  let totalSize = 0;
  
  console.log('💰 Calculating Potential Savings...\n');
  
  for (const file of filesToRemove) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const stats = await fs.stat(file);
      const lines = content.split('\n').length;
      
      totalLines += lines;
      totalSize += stats.size;
      
      console.log(`📄 ${file}`);
      console.log(`   Lines: ${lines}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log(`⚠️  ${file} - File not found`);
    }
  }
  
  console.log('\n📊 Total Savings:');
  console.log(`   Lines: ${totalLines}`);
  console.log(`   Size: ${(totalSize / 1024).toFixed(2)} KB`);
}

// CLI Interface
const command = process.argv[2];

switch (command) {
  case 'analyze':
    analyzeServiceUsage();
    break;
  case 'clean-ds':
    cleanDSStoreFiles();
    break;
  case 'map-imports':
    const [, , , oldPath, newPath] = process.argv;
    if (oldPath && newPath) {
      generateImportMap(oldPath, newPath);
    } else {
      console.log('Usage: npm run optimize map-imports <old-path> <new-path>');
    }
    break;
  case 'calculate':
    calculateSavings();
    break;
  default:
    console.log('Available commands:');
    console.log('  analyze     - Analyze service usage patterns');
    console.log('  clean-ds    - Remove all .DS_Store files');
    console.log('  map-imports - Generate import mapping for refactoring');
    console.log('  calculate   - Calculate potential savings');
} 