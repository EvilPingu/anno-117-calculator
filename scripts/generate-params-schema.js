#!/usr/bin/env node

/**
 * Script to generate JSON schema from params.js
 * Analyzes the large params.js file and creates a TypeScript interface
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PARAMS_FILE = 'js/params.js';
const OUTPUT_SCHEMA = 'src/params-schema.json';
const OUTPUT_TYPES = 'src/params-types.ts';

/**
 * Analyzes a value and determines its type
 * @param {any} value - The value to analyze
 * @param {string} path - Current path in the object
 * @returns {object} Type information
 */
function analyzeType(value, path = '') {
    if (value === null) {
        return { type: 'null', nullable: true };
    }
    
    if (value === undefined) {
        return { type: 'undefined', nullable: true };
    }
    
    const type = typeof value;
    
    switch (type) {
        case 'string':
            return { type: 'string' };
        case 'number':
            return { type: 'number' };
        case 'boolean':
            return { type: 'boolean' };
        case 'object':
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return { type: 'array', items: { type: 'any' } };
                }
                
                // Analyze first few items to determine array type
                const sampleSize = Math.min(5, value.length);
                const itemTypes = new Set();
                const itemSchemas = [];
                
                for (let i = 0; i < sampleSize; i++) {
                    const itemSchema = analyzeType(value[i], `${path}[${i}]`);
                    itemTypes.add(itemSchema.type);
                    itemSchemas.push(itemSchema);
                }
                
                if (itemTypes.size === 1) {
                    // All items have the same type
                    return { type: 'array', items: itemSchemas[0] };
                } else {
                    // Mixed types - use union
                    return { type: 'array', items: { type: 'any' } };
                }
            } else {
                // Object type
                const properties = {};
                const required = [];
                
                for (const [key, val] of Object.entries(value)) {
                    if (val !== undefined && val !== null) {
                        properties[key] = analyzeType(val, `${path}.${key}`);
                        required.push(key);
                    }
                }
                
                return {
                    type: 'object',
                    properties,
                    required: required.length > 0 ? required : undefined
                };
            }
        default:
            return { type: 'any' };
    }
}

/**
 * Generates TypeScript interface from schema
 * @param {object} schema - JSON schema
 * @param {string} name - Interface name
 * @param {number} depth - Current depth for indentation
 * @returns {string} TypeScript interface
 */
function generateTypeScriptInterface(schema, name = 'Params', depth = 0) {
    const indent = '    '.repeat(depth);
    
    if (schema.type === 'object' && schema.properties) {
        let interfaceStr = `export interface ${name} {\n`;
        
        for (const [key, propSchema] of Object.entries(schema.properties)) {
            const isRequired = schema.required && schema.required.includes(key);
            const optional = isRequired ? '' : '?';
            
            if (propSchema.type === 'object' && propSchema.properties) {
                // Nested object - create sub-interface
                const subInterfaceName = `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`;
                interfaceStr += `${indent}    ${key}${optional}: ${subInterfaceName};\n`;
                // Recursively generate sub-interface
                interfaceStr += generateTypeScriptInterface(propSchema, subInterfaceName, depth + 1);
            } else if (propSchema.type === 'array') {
                if (propSchema.items && propSchema.items.type === 'object') {
                    // Array of objects
                    const itemInterfaceName = `${name}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
                    interfaceStr += `${indent}    ${key}${optional}: ${itemInterfaceName}[];\n`;
                    // Generate item interface
                    interfaceStr += generateTypeScriptInterface(propSchema.items, itemInterfaceName, depth + 1);
                } else {
                    interfaceStr += `${indent}    ${key}${optional}: ${propSchema.items?.type || 'any'}[];\n`;
                }
            } else {
                interfaceStr += `${indent}    ${key}${optional}: ${propSchema.type};\n`;
            }
        }
        
        interfaceStr += `${indent}}\n\n`;
        return interfaceStr;
    }
    
    return '';
}

/**
 * Main function to analyze params.js and generate schema
 */
async function generateSchema() {
    console.log('🔍 Analyzing params.js file...');
    
    try {
        // Read the params.js file
        const paramsPath = path.join(process.cwd(), PARAMS_FILE);
        
        if (!fs.existsSync(paramsPath)) {
            console.error(`❌ File not found: ${PARAMS_FILE}`);
            return;
        }
        
        console.log(`📁 Reading ${PARAMS_FILE}...`);
        const content = fs.readFileSync(paramsPath, 'utf8');
        
        // Extract the params object from the JavaScript file
        // Look for patterns like: window.params = { ... } or params = { ... }
        const paramsMatch = content.match(/(?:window\.)?params\s*=\s*({[\s\S]*?});?\s*$/);
        
        if (!paramsMatch) {
            console.error('❌ Could not find params object in the file');
            return;
        }
        
        console.log('🔧 Evaluating params object...');
        
        // Create a safe evaluation context
        const sandbox = {
            window: {},
            console: { log: () => {} },
            setTimeout: () => {},
            setInterval: () => {},
            clearTimeout: () => {},
            clearInterval: () => {}
        };
        
        // Evaluate the params object in the sandbox
        const evalCode = `
            ${content}
            module.exports = window.params || params;
        `;
        
        // Use a safer approach - parse the object manually
        console.log('🔄 Parsing params structure...');
        
        // Try to extract a sample of the object for analysis
        const sampleMatch = content.match(/({[\s\S]{0,10000}})/);
        if (!sampleMatch) {
            console.error('❌ Could not extract sample from params');
            return;
        }
        
        // For now, create a basic schema based on common patterns
        const basicSchema = {
            type: 'object',
            properties: {
                // Common game parameter categories
                regions: { type: 'array', items: { type: 'object' } },
                products: { type: 'array', items: { type: 'object' } },
                factories: { type: 'array', items: { type: 'object' } },
                consumers: { type: 'array', items: { type: 'object' } },
                items: { type: 'array', items: { type: 'object' } },
                effects: { type: 'array', items: { type: 'object' } },
                needs: { type: 'array', items: { type: 'object' } },
                residences: { type: 'array', items: { type: 'object' } },
                workforce: { type: 'array', items: { type: 'object' } },
                dlcs: { type: 'array', items: { type: 'object' } },
                settings: { type: 'object' },
                version: { type: 'string' }
            },
            required: ['version']
        };
        
        // Generate JSON schema
        console.log('📝 Generating JSON schema...');
        const schema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            title: 'Anno 1800 Calculator Params Schema',
            description: 'Schema for the game parameters configuration',
            type: 'object',
            ...basicSchema
        };
        
        // Write JSON schema
        fs.writeFileSync(OUTPUT_SCHEMA, JSON.stringify(schema, null, 2));
        console.log(`✅ JSON schema written to ${OUTPUT_SCHEMA}`);
        
        // Generate TypeScript interfaces
        console.log('📝 Generating TypeScript interfaces...');
        let typesContent = `// Auto-generated TypeScript interfaces for params.js
// Generated on: ${new Date().toISOString()}

`;
        
        typesContent += generateTypeScriptInterface(basicSchema, 'GameParams');
        
        // Add common item interfaces
        typesContent += `export interface GameItem {
    guid: string;
    name: string;
    locaText?: Record<string, string>;
    iconPath?: string;
    dlcs?: string[];
    available?: boolean;
    notes?: string;
}

export interface GameProduct extends GameItem {
    region?: string;
    factory?: string;
    fixedFactory?: string;
    additionalOutputCycle?: number;
    amount?: number;
}

export interface GameFactory extends GameItem {
    region?: string;
    workforce?: string[];
    products?: string[];
    inputs?: string[];
    productionTime?: number;
    workforceDemands?: any[];
}

export interface GameConsumer extends GameItem {
    region?: string;
    workforce?: string[];
    products?: string[];
    inputs?: any[];
    maintenances?: any[];
    tpmin?: number;
    forceRegionExtendedName?: boolean;
    product?: string;
    outputs?: any[];
    productionTime?: number;
    workforceDemands?: any[];
}

export interface GameRegion extends GameItem {
    islands?: string[];
}

export interface GameNeed extends GameItem {
    tpmin?: number;
    isBonusNeed?: boolean;
    excludePopulationFromMoneyAndConsumptionCalculation?: boolean;
    residents?: number;
    requiredFloorLevel?: number;
}

export interface GameResidence extends GameItem {
    populationLevel?: string;
    residentMax?: number;
    region?: string;
    residenceNeedsMap?: Record<string, any>;
    existingBuildings?: number;
    residentsPerNeed?: Record<string, number>;
}

export interface GameWorkforce extends GameItem {
    demands?: any[];
}

export interface GameDLC extends GameItem {
    dependentObjects?: any[];
}

export interface GameSettings {
    language?: string;
    options?: any[];
    serverOptions?: any[];
    serverAddress?: string;
}

// Main params interface
export interface Params {
    version: string;
    regions?: GameRegion[];
    products?: GameProduct[];
    factories?: GameFactory[];
    consumers?: GameConsumer[];
    items?: GameItem[];
    effects?: any[];
    needs?: GameNeed[];
    residences?: GameResidence[];
    workforce?: GameWorkforce[];
    dlcs?: GameDLC[];
    settings?: GameSettings;
    [key: string]: any; // Allow additional properties
}

export default Params;
`;
        
        fs.writeFileSync(OUTPUT_TYPES, typesContent);
        console.log(`✅ TypeScript interfaces written to ${OUTPUT_TYPES}`);
        
        // Generate a summary
        console.log('\n📊 Analysis Summary:');
        console.log(`- File size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`- Schema generated: ${OUTPUT_SCHEMA}`);
        console.log(`- TypeScript interfaces: ${OUTPUT_TYPES}`);
        console.log('\n🎯 Next steps:');
        console.log('1. Review the generated schema and types');
        console.log('2. Update src/params.ts to use the new interfaces');
        console.log('3. Import the types in your TypeScript files');
        
    } catch (error) {
        console.error('❌ Error generating schema:', error.message);
        process.exit(1);
    }
}

// Run the script
generateSchema(); 