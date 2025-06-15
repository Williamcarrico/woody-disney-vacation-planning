/**
 * Simple script to generate API documentation
 */

const fs = require('fs')
const path = require('path')

// Create basic OpenAPI spec
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Disney Vacation Planner API',
    description: 'Comprehensive API for planning your perfect Disney vacation with real-time data, personalized recommendations, and seamless integration.',
    version: '1.0.0',
    contact: {
      name: 'Disney Vacation Planner Support',
      email: 'support@woodysdisneyvacation.com',
      url: 'https://woodysdisneyvacation.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://woodysdisneyvacation.com',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'System', description: 'System health monitoring and metrics' },
    { name: 'Authentication', description: 'User authentication and session management' },
    { name: 'User', description: 'User profile and preferences management' },
    { name: 'Parks', description: 'Disney park information and data' },
    { name: 'Attractions', description: 'Attraction details and wait times' },
    { name: 'Restaurants', description: 'Dining locations and reservations' },
    { name: 'Resorts', description: 'Disney resort information' },
    { name: 'Weather', description: 'Weather information and forecasts' },
    { name: 'Analytics', description: 'Data analytics and predictions' }
  ]
}

console.log('🚀 Generating API documentation...\n')

try {
  // Create docs directory
  const docsDir = path.join(process.cwd(), 'docs')
  const apiDocsDir = path.join(docsDir, 'api')
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }
  if (!fs.existsSync(apiDocsDir)) {
    fs.mkdirSync(apiDocsDir, { recursive: true })
  }
  
  // Write OpenAPI spec
  const jsonPath = path.join(apiDocsDir, 'openapi.json')
  fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2))
  console.log(`✅ OpenAPI JSON exported to: ${jsonPath}`)
  
  // Create README
  const readme = `# Disney Vacation Planner API Documentation

${spec.info.description}

## Overview

The Disney Vacation Planner API provides comprehensive access to Disney park data, real-time information, and vacation planning tools.

## Base URL

- **Production**: \`${spec.servers[0].url}\`
- **Development**: \`${spec.servers[1].url}\`

## Version

Current version: **${spec.info.version}**

## Authentication

This API supports multiple authentication methods:
- Bearer Token (JWT from Firebase)
- Session Cookie (Server-side sessions)

## API Categories

${spec.tags.map(tag => `### ${tag.name}\n${tag.description}`).join('\n\n')}

## Support

- **Contact**: ${spec.info.contact.email}
- **Documentation**: [API Reference](./openapi.json)

---

*Generated automatically from OpenAPI specification v${spec.info.version}*
`
  
  const readmePath = path.join(apiDocsDir, 'README.md')
  fs.writeFileSync(readmePath, readme)
  console.log(`✅ API README generated: ${readmePath}`)
  
  console.log('\n🎉 API documentation generation completed successfully!')
  console.log('\n📖 Documentation files:')
  console.log(`   - OpenAPI Spec: docs/api/openapi.json`)
  console.log(`   - API Overview: docs/api/README.md`)
  
} catch (error) {
  console.error('❌ Error generating API documentation:', error)
  process.exit(1)
}