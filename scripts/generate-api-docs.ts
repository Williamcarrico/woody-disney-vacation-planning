#!/usr/bin/env ts-node

/**
 * Script to generate comprehensive API documentation
 * Generates OpenAPI specification and creates documentation files
 */

import { generateAndExportSpec, generateDisneyAPISpec } from '../src/lib/api/openapi-generator.js'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

async function generateDocs() {
    console.log('🚀 Starting API documentation generation...\n')
    
    try {
        // Create docs directory if it doesn't exist
        const docsDir = join(process.cwd(), 'docs')
        const apiDocsDir = join(docsDir, 'api')
        
        try {
            mkdirSync(docsDir, { recursive: true })
            mkdirSync(apiDocsDir, { recursive: true })
            console.log('📁 Created docs directory structure')
        } catch (error) {
            // Directory might already exist
        }
        
        // Generate OpenAPI specification
        console.log('📝 Generating OpenAPI specification...')
        const spec = generateDisneyAPISpec()
        
        // Export to JSON
        const jsonPath = join(apiDocsDir, 'openapi.json')
        writeFileSync(jsonPath, JSON.stringify(spec, null, 2))
        console.log(`✅ OpenAPI JSON exported to: ${jsonPath}`)
        
        // Try to export to YAML
        try {
            const yaml = require('js-yaml')
            const yamlPath = join(apiDocsDir, 'openapi.yaml')
            writeFileSync(yamlPath, yaml.dump(spec, { noRefs: true, indent: 2 }))
            console.log(`✅ OpenAPI YAML exported to: ${yamlPath}`)
        } catch (error) {
            console.log('⚠️  YAML export skipped (js-yaml not installed)')
        }
        
        console.log('\n🎉 API documentation generation completed successfully!')
        console.log('\n📖 Documentation files:')
        console.log(`   - OpenAPI Spec (JSON): docs/api/openapi.json`)
        console.log(`   - OpenAPI Spec (YAML): docs/api/openapi.yaml`)
        
    } catch (error) {
        console.error('❌ Error generating API documentation:', error)
        process.exit(1)
    }
}

// Run the script
if (require.main === module) {
    generateDocs()
}

export { generateDocs }