#!/usr/bin/env ts-node

/**
 * Script to generate API documentation and OpenAPI specifications
 */

import { generateAndExportSpec } from '../src/lib/api/openapi-generator'

async function main() {
    console.log('🚀 Generating API documentation...')
    
    try {
        // Generate OpenAPI specification
        generateAndExportSpec()
        
        console.log('\n✅ API documentation generation completed!')
        console.log('📄 Files generated:')
        console.log('   - docs/api/openapi.json')
        console.log('   - docs/api/openapi.yaml (if js-yaml is available)')
        
    } catch (error) {
        console.error('❌ Error generating API documentation:', error)
        process.exit(1)
    }
}

// Run the script
if (require.main === module) {
    main()
}