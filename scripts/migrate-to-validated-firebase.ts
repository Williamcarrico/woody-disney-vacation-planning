#!/usr/bin/env node

/**
 * Migration script to help transition from direct Firebase usage to validated services
 * This script analyzes the codebase and provides migration suggestions
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { execSync } from 'child_process'

interface MigrationCandidate {
  file: string
  line: number
  type: 'firestore' | 'auth' | 'storage' | 'realtime'
  pattern: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
}

// Patterns to detect direct Firebase usage
const FIREBASE_PATTERNS = [
  // Firestore patterns
  {
    regex: /collection\s*\(\s*(?:firestore|db)\s*,\s*['"`](\w+)['"`]\s*\)/g,
    type: 'firestore' as const,
    priority: 'high' as const,
    getSuggestion: (match: RegExpMatchArray) => {
      const collection = match[1]
      const serviceMap: Record<string, string> = {
        users: 'ValidatedUserService',
        vacations: 'ValidatedVacationService',
        itineraries: 'ValidatedItineraryService',
        events: 'ValidatedCalendarEventService',
        userLocations: 'ValidatedUserLocationService',
        geofences: 'ValidatedGeofenceService',
        resorts: 'ValidatedResortService'
      }
      const service = serviceMap[collection as keyof typeof serviceMap] || 'ValidatedFirestoreService'
      return `Use ${service} instead of direct collection() call`
    }
  },
  {
    regex: /doc\s*\(\s*(?:firestore|db)\s*,/g,
    type: 'firestore' as const,
    priority: 'high' as const,
    getSuggestion: () => 'Use validated service get() method instead of direct doc() call'
  },
  {
    regex: /getDocs?\s*\(/g,
    type: 'firestore' as const,
    priority: 'high' as const,
    getSuggestion: () => 'Use validated service get() or list() methods'
  },
  {
    regex: /setDoc\s*\(/g,
    type: 'firestore' as const,
    priority: 'high' as const,
    getSuggestion: () => 'Use validated service set() method'
  },
  {
    regex: /updateDoc\s*\(/g,
    type: 'firestore' as const,
    priority: 'high' as const,
    getSuggestion: () => 'Use validated service update() method'
  },
  {
    regex: /deleteDoc\s*\(/g,
    type: 'firestore' as const,
    priority: 'high' as const,
    getSuggestion: () => 'Use validated service delete() method'
  },
  {
    regex: /onSnapshot\s*\(/g,
    type: 'firestore' as const,
    priority: 'medium' as const,
    getSuggestion: () => 'Use validated service subscribe() method'
  },
  
  // Auth patterns
  {
    regex: /signInWithEmailAndPassword\s*\(/g,
    type: 'auth' as const,
    priority: 'medium' as const,
    getSuggestion: () => 'Consider adding validation to auth flows'
  },
  {
    regex: /createUserWithEmailAndPassword\s*\(/g,
    type: 'auth' as const,
    priority: 'medium' as const,
    getSuggestion: () => 'Add email validation before creating user'
  },
  
  // Storage patterns
  {
    regex: /uploadBytes\s*\(/g,
    type: 'storage' as const,
    priority: 'low' as const,
    getSuggestion: () => 'Consider adding file validation before upload'
  },
  
  // Realtime Database patterns
  {
    regex: /ref\s*\(\s*database\s*,/g,
    type: 'realtime' as const,
    priority: 'medium' as const,
    getSuggestion: () => 'Add validation to realtime database operations'
  }
]

// Analyze a file for Firebase usage
function analyzeFile(filePath: string): MigrationCandidate[] {
  const candidates: MigrationCandidate[] = []
  
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    // Skip if it's a validated service file
    if (filePath.includes('validated-') || filePath.includes('validation')) {
      return candidates
    }
    
    FIREBASE_PATTERNS.forEach(pattern => {
      let match: RegExpExecArray | null
      const regex = new RegExp(pattern.regex, 'gm')
      
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        const line = lines[lineNumber - 1]
        
        candidates.push({
          file: filePath,
          line: lineNumber,
          type: pattern.type,
          pattern: match[0],
          suggestion: pattern.getSuggestion(match),
          priority: pattern.priority
        })
      }
    })
  } catch (error) {
    // Ignore files that can't be read
  }
  
  return candidates
}

// Recursively find all TypeScript/JavaScript files
function findFiles(dir: string, extensions = ['.ts', '.tsx', '.js', '.jsx']): string[] {
  const files: string[] = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          files.push(...findFiles(fullPath, extensions))
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Ignore directories that can't be read
  }
  
  return files
}

// Generate migration report
function generateReport(candidates: MigrationCandidate[]) {
  const report = {
    summary: {
      total: candidates.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      topFiles: [] as { file: string; count: number }[]
    },
    candidates: candidates
  }
  
  // Count by type
  candidates.forEach(c => {
    report.summary.byType[c.type] = (report.summary.byType[c.type] || 0) + 1
    report.summary.byPriority[c.priority] = (report.summary.byPriority[c.priority] || 0) + 1
  })
  
  // Find top files
  const fileCounts = candidates.reduce((acc, c) => {
    acc[c.file] = (acc[c.file] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  report.summary.topFiles = Object.entries(fileCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([file, count]) => ({ file: relative(process.cwd(), file), count }))
  
  return report
}

// Main function
function main() {
  console.log('🔍 Analyzing codebase for Firebase usage patterns...\n')
  
  const projectRoot = process.cwd()
  const srcDir = join(projectRoot, 'src')
  
  // Find all source files
  const files = findFiles(srcDir)
  console.log(`Found ${files.length} source files to analyze\n`)
  
  // Analyze each file
  const allCandidates: MigrationCandidate[] = []
  
  files.forEach(file => {
    const candidates = analyzeFile(file)
    if (candidates.length > 0) {
      allCandidates.push(...candidates)
    }
  })
  
  // Generate report
  const report = generateReport(allCandidates)
  
  // Save detailed report
  const reportPath = join(projectRoot, 'firebase-migration-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  // Print summary
  console.log('📊 Migration Summary:')
  console.log('===================')
  console.log(`Total migration candidates: ${report.summary.total}`)
  console.log('\nBy Type:')
  Object.entries(report.summary.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })
  console.log('\nBy Priority:')
  Object.entries(report.summary.byPriority).forEach(([priority, count]) => {
    console.log(`  ${priority}: ${count}`)
  })
  console.log('\nTop Files to Migrate:')
  report.summary.topFiles.forEach(({ file, count }) => {
    console.log(`  ${file}: ${count} occurrences`)
  })
  
  console.log('\n✅ Detailed report saved to:', reportPath)
  
  // Show high priority examples
  const highPriority = allCandidates
    .filter(c => c.priority === 'high')
    .slice(0, 5)
  
  if (highPriority.length > 0) {
    console.log('\n🚨 High Priority Examples:')
    console.log('========================')
    highPriority.forEach(c => {
      console.log(`\nFile: ${relative(projectRoot, c.file)}:${c.line}`)
      console.log(`Pattern: ${c.pattern}`)
      console.log(`Suggestion: ${c.suggestion}`)
    })
  }
  
  // Provide next steps
  console.log('\n📝 Next Steps:')
  console.log('============')
  console.log('1. Review the detailed report in firebase-migration-report.json')
  console.log('2. Start with high-priority files that have the most occurrences')
  console.log('3. Use the migration guide at src/lib/firebase/migration-guide.md')
  console.log('4. Test thoroughly after each migration')
  console.log('5. Enable validation error monitoring in production')
}

// Run the script
if (require.main === module) {
  main()
}

export { analyzeFile, findFiles, generateReport } 