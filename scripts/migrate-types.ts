#!/usr/bin/env ts-node

/**
 * TypeScript Migration Script
 * 
 * This script helps migrate from duplicate type definitions to the unified shared type system.
 * It performs the following operations:
 * 
 * 1. Identifies files that import duplicate types
 * 2. Updates import statements to use shared types
 * 3. Updates enum value references  
 * 4. Reports on remaining manual migration tasks
 */

import * as fs from 'fs'
import * as path from 'path'

interface MigrationRule {
  oldImport: string
  newImport: string
  enumMappings?: Record<string, string>
  description: string
}

const MIGRATION_RULES: MigrationRule[] = [
  {
    oldImport: "import { PriceRange } from '@/types/dining'",
    newImport: "import { PriceRange } from '@/types/shared'",
    enumMappings: {
      'PriceRange.BUDGET': 'PriceRange.LOW',
      'PriceRange.MODERATE': 'PriceRange.MODERATE',
      'PriceRange.EXPENSIVE': 'PriceRange.HIGH', 
      'PriceRange.LUXURY': 'PriceRange.LUXURY'
    },
    description: 'PriceRange from dining.ts'
  },
  {
    oldImport: "import { PriceRange } from '@/types/disneysprings'",
    newImport: "import { PriceRange } from '@/types/shared'",
    enumMappings: {
      'PriceRange.Low': 'PriceRange.LOW',
      'PriceRange.Medium': 'PriceRange.MODERATE',
      'PriceRange.High': 'PriceRange.HIGH',
      'PriceRange.VeryHigh': 'PriceRange.LUXURY'
    },
    description: 'PriceRange from disneysprings.ts'
  },
  {
    oldImport: "import { MenuHighlight } from '@/types/dining'",
    newImport: "import { MenuHighlight } from '@/types/shared'",
    description: 'MenuHighlight from dining.ts'
  },
  {
    oldImport: "import { MenuHighlight } from '@/types/disneysprings'",
    newImport: "import { MenuHighlight } from '@/types/shared'",
    description: 'MenuHighlight from disneysprings.ts'
  },
  {
    oldImport: "import { OperatingHours } from '@/types/parks'",
    newImport: "import { OperatingHours } from '@/types/shared'",
    description: 'OperatingHours from parks.ts'
  },
  {
    oldImport: "import { OperatingHours } from '@/types/dining'",
    newImport: "import { OperatingHours } from '@/types/shared'",
    description: 'OperatingHours from dining.ts'
  },
  {
    oldImport: "import { Attraction } from '@/types/attraction'",
    newImport: "import { Attraction } from '@/types/shared'",
    description: 'Attraction from attraction.ts'
  },
  {
    oldImport: "import { Attraction } from '@/types/parks'",
    newImport: "import { Attraction } from '@/types/shared'",
    description: 'Attraction from parks.ts'
  },
  {
    oldImport: "import { Attraction } from '@/types/themeparks'",
    newImport: "import { Attraction } from '@/types/shared'",
    description: 'Attraction from themeparks.ts'
  },
  {
    oldImport: "import { AccessibilityInfo } from '@/types/attraction'",
    newImport: "import { AccessibilityInfo } from '@/types/shared'",
    description: 'AccessibilityInfo from attraction.ts'
  },
  {
    oldImport: "import { AccessibilityInfo } from '@/types/parks'",
    newImport: "import { AccessibilityInfo } from '@/types/shared'",
    description: 'AccessibilityInfo from parks.ts'
  },
  {
    oldImport: "import { AccessibilityInfo } from '@/types/themeparks'",
    newImport: "import { AccessibilityInfo } from '@/types/shared'",
    description: 'AccessibilityInfo from themeparks.ts'
  },
  {
    oldImport: "import { DisneyPark } from '@/types/parks'",
    newImport: "import { DisneyPark } from '@/types/shared'",
    description: 'DisneyPark from parks.ts'
  },
  {
    oldImport: "import { DisneyPark } from '@/types/themeparks'",
    newImport: "import { DisneyPark } from '@/types/shared'",
    description: 'DisneyPark from themeparks.ts'
  }
]

interface MigrationReport {
  filePath: string
  migrationsApplied: string[]
  manualChangesNeeded: string[]
  warnings: string[]
}

class TypeMigrator {
  private reports: MigrationReport[] = []
  private dryRun: boolean

  constructor(dryRun = false) {
    this.dryRun = dryRun
  }

  async migrate() {
    console.log('🔄 Starting TypeScript migration...')
    console.log(`📍 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`)
    
    // Find all TypeScript files
    const files = await this.findTypeScriptFiles()
    console.log(`📁 Found ${files.length} TypeScript files`)

    // Process each file
    for (const file of files) {
      await this.processFile(file)
    }

    // Generate report
    this.generateReport()
  }

  private async findTypeScriptFiles(): Promise<string[]> {
    const files: string[] = []
    
    // Recursively find TypeScript files
    const findFiles = (dir: string): void => {
      if (!fs.existsSync(dir)) return
      
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          findFiles(fullPath)
        } else if (entry.isFile()) {
          // Include .ts and .tsx files, exclude .d.ts and shared.ts
          if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
              !entry.name.endsWith('.d.ts') &&
              fullPath !== 'src/types/shared.ts') {
            files.push(fullPath)
          }
        }
      }
    }
    
    findFiles('src')
    return files
  }

  private async processFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content
    
    const report: MigrationReport = {
      filePath,
      migrationsApplied: [],
      manualChangesNeeded: [],
      warnings: []
    }

    // Apply migration rules
    for (const rule of MIGRATION_RULES) {
      if (content.includes(rule.oldImport)) {
        content = content.replace(rule.oldImport, rule.newImport)
        report.migrationsApplied.push(rule.description)

        // Apply enum mappings if they exist
        if (rule.enumMappings) {
          for (const [oldEnum, newEnum] of Object.entries(rule.enumMappings)) {
            const regex = new RegExp(`\\b${oldEnum.replace('.', '\\.')}\\b`, 'g')
            const matches = content.match(regex)
            if (matches) {
              content = content.replace(regex, newEnum)
              report.migrationsApplied.push(`Updated enum: ${oldEnum} → ${newEnum}`)
            }
          }
        }
      }
    }

    // Check for remaining issues
    this.checkForManualChanges(content, report)

    // Write file if changes were made and not in dry run mode
    if (content !== originalContent) {
      if (!this.dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8')
        console.log(`✅ Migrated: ${filePath}`)
      } else {
        console.log(`🔍 Would migrate: ${filePath}`)
      }
    }

    if (report.migrationsApplied.length > 0 || report.manualChangesNeeded.length > 0 || report.warnings.length > 0) {
      this.reports.push(report)
    }
  }

  private checkForManualChanges(content: string, report: MigrationReport) {
    // Check for potential issues that need manual intervention

    // Check for old type imports that weren't covered
    const oldImportPatterns = [
      /@\/types\/dining(?!.*shared)/,
      /@\/types\/disneysprings(?!.*shared)/,
      /@\/types\/parks(?!.*shared)/,
      /@\/types\/themeparks(?!.*shared)/,
      /@\/types\/attraction(?!.*shared)/
    ]

    for (const pattern of oldImportPatterns) {
      if (pattern.test(content)) {
        report.manualChangesNeeded.push(`Still importing from old type files: ${pattern.source}`)
      }
    }

    // Check for type definitions that should be removed
    const duplicateTypePatterns = [
      /export\s+enum\s+PriceRange/,
      /export\s+interface\s+MenuHighlight/,
      /export\s+interface\s+OperatingHours/,
      /export\s+interface\s+Attraction(?!\w)/,
      /export\s+interface\s+AccessibilityInfo/,
      /export\s+interface\s+DisneyPark/
    ]

    for (const pattern of duplicateTypePatterns) {
      if (pattern.test(content)) {
        report.warnings.push(`Found duplicate type definition that should be removed: ${pattern.source}`)
      }
    }

    // Check for enum values that might need updating
    const oldEnumPatterns = [
      /PriceRange\.(BUDGET|Low)/,
      /PriceRange\.(EXPENSIVE|High)/,
      /PriceRange\.VeryHigh/
    ]

    for (const pattern of oldEnumPatterns) {
      if (pattern.test(content)) {
        report.manualChangesNeeded.push(`Found old enum value that needs updating: ${pattern.source}`)
      }
    }
  }

  private generateReport() {
    console.log('\n📊 Migration Report')
    console.log('===================')

    if (this.reports.length === 0) {
      console.log('✨ No files needed migration!')
      return
    }

    let totalMigrations = 0
    let totalManualChanges = 0
    let totalWarnings = 0

    for (const report of this.reports) {
      console.log(`\n📄 ${report.filePath}`)
      
      if (report.migrationsApplied.length > 0) {
        console.log('  ✅ Migrations applied:')
        for (const migration of report.migrationsApplied) {
          console.log(`    - ${migration}`)
          totalMigrations++
        }
      }

      if (report.manualChangesNeeded.length > 0) {
        console.log('  ⚠️  Manual changes needed:')
        for (const change of report.manualChangesNeeded) {
          console.log(`    - ${change}`)
          totalManualChanges++
        }
      }

      if (report.warnings.length > 0) {
        console.log('  🚨 Warnings:')
        for (const warning of report.warnings) {
          console.log(`    - ${warning}`)
          totalWarnings++
        }
      }
    }

    console.log('\n📈 Summary')
    console.log(`- Files processed: ${this.reports.length}`)
    console.log(`- Migrations applied: ${totalMigrations}`)
    console.log(`- Manual changes needed: ${totalManualChanges}`)
    console.log(`- Warnings: ${totalWarnings}`)

    if (totalManualChanges > 0) {
      console.log('\n🔧 Next Steps:')
      console.log('1. Review the manual changes needed above')
      console.log('2. Update the affected files manually')
      console.log('3. Run TypeScript compiler to check for errors')
      console.log('4. Run tests to ensure functionality is preserved')
    }

    if (this.dryRun && totalMigrations > 0) {
      console.log('\n▶️  To apply these changes, run the script without --dry-run')
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  
  const migrator = new TypeMigrator(dryRun)
  await migrator.migrate()
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { TypeMigrator } 