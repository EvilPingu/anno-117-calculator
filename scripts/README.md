# Scripts Directory

This directory contains utility scripts for the Anno 117 Calculator project.

## Available Scripts

### `generate-config-types.js`

**Purpose**: Automatically generates TypeScript interfaces from JSON schema files.

**Usage**:
```bash
node scripts/generate-config-types.js
```

**Input**: `js/params.schema.json` - JSON schema defining game configuration structure  
**Output**: `src/types.config.ts` - Generated TypeScript interfaces

**Key Features**:
- ✅ Dynamic interface generation from JSON schema
- ✅ Common `LocaTextConfig` interface for localized text
- ✅ Automatic type mapping (string, number, array, object)
- ✅ Naming convention: `{SchemaTitle}Config`
- ✅ Index signatures for dynamic properties
- ✅ String indexing support for LocaTextConfig

**Example Output**:
```typescript
export interface LocaTextConfig {
  english: string;
  french: string;
  // ... other languages
  [key: string]: string; // Allow string indexing
}

export interface RegionConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  id: string;
}

export interface ParamsConfig {
  languages: string[];
  regions: RegionConfig[];
  // ... other collections
}
```

**When to Run**:
- After updating `js/params.schema.json`
- When adding new game entities or properties
- During development setup
- Before committing schema changes

### `generate-params-schema.js`

**Purpose**: Analyzes `params.js` file and generates basic schema and TypeScript interfaces.

**Usage**:
```bash
node scripts/generate-params-schema.js
```

**Input**: `js/params.js` - Large JavaScript parameters file  
**Output**: 
- `src/params-schema.json` - Basic JSON schema
- `src/params-types.ts` - TypeScript interfaces

**Note**: This script provides a starting point for schema generation but may need manual refinement for complex structures.

## Script Development Guidelines

### Adding New Scripts

1. **Naming Convention**: Use kebab-case (e.g., `my-new-script.js`)
2. **Shebang Line**: Include `#!/usr/bin/env node` for Node.js scripts
3. **Documentation**: Add usage instructions and examples
4. **Error Handling**: Include proper error handling and user feedback
5. **File Paths**: Use `path.join()` for cross-platform compatibility

### Script Template

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script description
 */

function main() {
    try {
        console.log('🔍 Starting script...');
        
        // Script logic here
        
        console.log('✅ Script completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
```

### Dependencies

All scripts in this directory should:
- Use only Node.js built-in modules (fs, path, etc.)
- Avoid external dependencies when possible
- Include fallback handling for missing files
- Provide clear error messages

## Integration with Build Process

These scripts can be integrated into the build process via `package.json`:

```json
{
  "scripts": {
    "generate-types": "node scripts/generate-config-types.js",
    "build": "npm run generate-types && npm run build:webpack",
    "dev": "npm run generate-types && npm run dev:webpack"
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   chmod +x scripts/*.js
   ```

2. **File Not Found**
   - Verify input file paths exist
   - Check working directory is project root

3. **Invalid Output**
   - Validate input JSON/JavaScript syntax
   - Check for circular references
   - Verify file encoding (UTF-8)

### Getting Help

- Check script comments and JSDoc
- Review the main documentation in `docs/`
- Test scripts with minimal input data
- Use `console.log()` for debugging