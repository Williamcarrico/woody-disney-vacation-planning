#!/usr/bin/env node
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface UpdatePlan {
  safe: string[]
  minor: string[]
  major: string[]
  security: string[]
  skip: string[]
}

// Dependencies that should be updated carefully
const CAREFUL_UPDATES = {
  // Major version changes that might break
  major: [
    'date-fns', // v2 to v4 has breaking changes
    'framer-motion', // v11 to v12 has API changes
    'next-safe-action', // v7 to v8 has breaking changes
    '@types/node' // Major version should match Node.js version
  ],
  
  // Dependencies that should stay in sync
  syncGroups: [
    ['react', 'react-dom', '@types/react', '@types/react-dom'],
    ['three', '@react-three/fiber', '@react-three/drei'],
    ['firebase', 'firebase-admin'],
    ['socket.io', 'socket.io-client'],
    ['@tanstack/react-query', '@tanstack/react-query-devtools']
  ],
  
  // Dependencies to skip updating
  skip: [
    'date-fns', // Keep at 2.30.0 for compatibility
    '@types/date-fns' // Newer version is actually older
  ]
}

async function analyzeUpdates(): Promise<UpdatePlan> {
  console.log('🔍 Analyzing dependency updates...\n')
  
  try {
    const outdatedJson = execSync('npm outdated --json', { encoding: 'utf8' })
    const outdated = JSON.parse(outdatedJson || '{}')
    
    const plan: UpdatePlan = {
      safe: [],
      minor: [],
      major: [],
      security: [],
      skip: []
    }
    
    for (const [pkg, info] of Object.entries(outdated) as any) {
      const { current, wanted, latest } = info
      
      // Skip if in skip list
      if (CAREFUL_UPDATES.skip.includes(pkg)) {
        plan.skip.push(`${pkg} (keep ${current})`)
        continue
      }
      
      // Check if it's a major update
      const currentMajor = parseInt(current.split('.')[0])
      const latestMajor = parseInt(latest.split('.')[0])
      
      if (currentMajor < latestMajor) {
        if (CAREFUL_UPDATES.major.includes(pkg)) {
          plan.major.push(`${pkg}: ${current} → ${latest} ⚠️`)
        } else {
          plan.major.push(`${pkg}: ${current} → ${latest}`)
        }
      } else if (current !== wanted) {
        plan.minor.push(`${pkg}: ${current} → ${wanted}`)
      } else if (wanted !== latest) {
        plan.safe.push(`${pkg}: ${current} → ${latest}`)
      }
    }
    
    // Check for security updates
    try {
      const auditJson = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditJson || '{}')
      if (audit.vulnerabilities) {
        for (const [name, vuln] of Object.entries(audit.vulnerabilities) as any) {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            plan.security.push(`${name} (${vuln.severity})`)
          }
        }
      }
    } catch (e) {
      // Audit might fail, that's okay
    }
    
    return plan
  } catch (error) {
    console.error('Error analyzing updates:', error)
    return { safe: [], minor: [], major: [], security: [], skip: [] }
  }
}

function printUpdatePlan(plan: UpdatePlan) {
  console.log('📋 Update Plan:\n')
  
  if (plan.security.length > 0) {
    console.log('🚨 Security Updates (URGENT):')
    plan.security.forEach(pkg => console.log(`   - ${pkg}`))
    console.log()
  }
  
  if (plan.safe.length > 0) {
    console.log('✅ Safe Updates (patch versions):')
    plan.safe.forEach(pkg => console.log(`   - ${pkg}`))
    console.log()
  }
  
  if (plan.minor.length > 0) {
    console.log('📦 Minor Updates:')
    plan.minor.forEach(pkg => console.log(`   - ${pkg}`))
    console.log()
  }
  
  if (plan.major.length > 0) {
    console.log('⚠️  Major Updates (review changelog):')
    plan.major.forEach(pkg => console.log(`   - ${pkg}`))
    console.log()
  }
  
  if (plan.skip.length > 0) {
    console.log('⏭️  Skipped:')
    plan.skip.forEach(pkg => console.log(`   - ${pkg}`))
    console.log()
  }
}

async function updateDependencies(type: 'safe' | 'minor' | 'major' | 'all') {
  const plan = await analyzeUpdates()
  
  console.log('\n🚀 Starting updates...\n')
  
  // Always do security updates
  if (plan.security.length > 0) {
    console.log('Fixing security vulnerabilities...')
    execSync('npm audit fix', { stdio: 'inherit' })
  }
  
  // Update based on type
  const updates: string[] = []
  
  if (type === 'safe' || type === 'all') {
    updates.push(...plan.safe.map(u => u.split(':')[0]))
  }
  
  if (type === 'minor' || type === 'all') {
    updates.push(...plan.minor.map(u => u.split(':')[0]))
  }
  
  if (type === 'major' || type === 'all') {
    updates.push(...plan.major.map(u => u.split(':')[0].replace(' ⚠️', '')))
  }
  
  if (updates.length > 0) {
    console.log(`Updating ${updates.length} packages...`)
    
    // Update in batches to avoid issues
    const batchSize = 10
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      console.log(`\nBatch ${Math.floor(i / batchSize) + 1}:`, batch.join(', '))
      
      try {
        execSync(`npm update ${batch.join(' ')}`, { stdio: 'inherit' })
      } catch (error) {
        console.error(`Error updating batch: ${error}`)
      }
    }
  }
  
  console.log('\n✨ Update complete!')
}

async function checkCompatibility() {
  console.log('🔧 Checking compatibility...\n')
  
  // Check Node.js version
  const nodeVersion = process.version
  console.log(`Node.js: ${nodeVersion}`)
  
  // Check peer dependencies
  try {
    execSync('npm ls --depth=0', { stdio: 'inherit' })
  } catch (error) {
    console.error('\n⚠️  Peer dependency issues detected!')
  }
  
  // Check for duplicate packages
  try {
    const duplicates = execSync('npm ls --depth=0 --json', { encoding: 'utf8' })
    const deps = JSON.parse(duplicates || '{}')
    
    // Analyze for duplicates
    const seen = new Map<string, string[]>()
    
    function checkDuplicates(obj: any, path: string[] = []) {
      if (obj.dependencies) {
        for (const [name, info] of Object.entries(obj.dependencies) as any) {
          const version = info.version
          if (seen.has(name)) {
            const versions = seen.get(name)!
            if (!versions.includes(version)) {
              versions.push(version)
            }
          } else {
            seen.set(name, [version])
          }
          
          if (info.dependencies) {
            checkDuplicates(info, [...path, name])
          }
        }
      }
    }
    
    checkDuplicates(deps)
    
    const duplicatePackages = Array.from(seen.entries())
      .filter(([_, versions]) => versions.length > 1)
    
    if (duplicatePackages.length > 0) {
      console.log('\n⚠️  Duplicate packages detected:')
      duplicatePackages.forEach(([name, versions]) => {
        console.log(`   - ${name}: ${versions.join(', ')}`)
      })
    }
  } catch (error) {
    // Ignore errors
  }
}

async function cleanupDependencies() {
  console.log('🧹 Cleaning up dependencies...\n')
  
  // Remove node_modules and lockfile
  console.log('Removing node_modules and package-lock.json...')
  execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' })
  
  // Clean npm cache
  console.log('Cleaning npm cache...')
  execSync('npm cache clean --force', { stdio: 'inherit' })
  
  // Reinstall
  console.log('Reinstalling dependencies...')
  execSync('npm install', { stdio: 'inherit' })
  
  console.log('\n✨ Cleanup complete!')
}

// Main CLI
async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'analyze':
      const plan = await analyzeUpdates()
      printUpdatePlan(plan)
      break
      
    case 'safe':
      await updateDependencies('safe')
      break
      
    case 'minor':
      await updateDependencies('minor')
      break
      
    case 'major':
      await updateDependencies('major')
      break
      
    case 'all':
      await updateDependencies('all')
      break
      
    case 'check':
      await checkCompatibility()
      break
      
    case 'cleanup':
      await cleanupDependencies()
      break
      
    default:
      console.log(`
Disney Vacation Planning - Dependency Manager

Usage: npm run deps:<command>

Commands:
  analyze    Analyze available updates
  safe       Update patch versions only
  minor      Update minor versions
  major      Update major versions (careful!)
  all        Update all dependencies
  check      Check compatibility
  cleanup    Clean and reinstall dependencies

Examples:
  npm run deps:analyze
  npm run deps:safe
  npm run deps:check
      `)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}