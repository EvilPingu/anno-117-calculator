#!/usr/bin/env node

/**
 * Advanced script to analyze the structure of params.js
 * Parses the file intelligently to extract actual data structure
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PARAMS_FILE = 'js/params.js';
const OUTPUT_ANALYSIS = 'params-analysis.json';
const OUTPUT_DETAILED_SCHEMA = 'src/params-detailed-schema.json';

/**
 * Extracts object structure from JavaScript code
 * @param {string} code - JavaScript code
 * @returns {object} Extracted structure
 */
function extractObjectStructure(code) {
    const structure = {};
    
    // Look for common patterns in the params file
    const patterns = [
        // Array patterns: regions: [ ... ]
        /(\w+)\s*:\s*\[/g,
        // Object patterns: settings: { ... }
        /(\w+)\s*:\s*\{/g,
        // Simple assignments: version: "1.0.0"
        /(\w+)\s*:\s*["']([^"']+)["']/g,
        // Number assignments: count: 123
        /(\w+)\s*:\s*(\d+)/g,
        // Boolean assignments: enabled: true
        /(\w+)\s*:\s*(true|false)/g
    ];
    
    patterns.forEach((pattern, index) => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            const key = match[1];
            if (index === 0) {
                // Array pattern
                structure[key] = { type: 'array', items: { type: 'object' } };
            } else if (index === 1) {
                // Object pattern
                structure[key] = { type: 'object' };
            } else if (index === 2) {
                // String pattern
                structure[key] = { type: 'string', example: match[2] };
            } else if (index === 3) {
                // Number pattern
                structure[key] = { type: 'number', example: parseInt(match[2]) };
            } else if (index === 4) {
                // Boolean pattern
                structure[key] = { type: 'boolean', example: match[2] === 'true' };
            }
        }
    });
    
    return structure;
}

/**
 * Analyzes array items to determine their structure
 * @param {string} code - JavaScript code containing array
 * @param {string} arrayName - Name of the array to analyze
 * @returns {object} Array item structure
 */
function analyzeArrayItems(code, arrayName) {
    const arrayPattern = new RegExp(`${arrayName}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'g');
    const match = arrayPattern.exec(code);
    
    if (!match) return { type: 'object' };
    
    const arrayContent = match[1];
    
    // Look for object patterns in the array
    const objectPattern = /{([^}]*)}/g;
    const objects = [];
    let objMatch;
    
    while ((objMatch = objectPattern.exec(arrayContent)) !== null) {
        const objContent = objMatch[1];
        const properties = {};
        
        // Extract properties from object
        const propPattern = /(\w+)\s*:\s*([^,}]+)/g;
        let propMatch;
        
        while ((propMatch = propPattern.exec(objContent)) !== null) {
            const propName = propMatch[1];
            const propValue = propMatch[2].trim();
            
            if (propValue.startsWith('"') || propValue.startsWith("'")) {
                properties[propName] = { type: 'string' };
            } else if (propValue === 'true' || propValue === 'false') {
                properties[propName] = { type: 'boolean' };
            } else if (!isNaN(propValue)) {
                properties[propName] = { type: 'number' };
            } else {
                properties[propName] = { type: 'any' };
            }
        }
        
        if (Object.keys(properties).length > 0) {
            objects.push({ type: 'object', properties });
        }
    }
    
    if (objects.length === 0) {
        return { type: 'object' };
    }
    
    // Merge all object structures
    const mergedProperties = {};
    objects.forEach(obj => {
        if (obj.properties) {
            Object.assign(mergedProperties, obj.properties);
        }
    });
    
    return {
        type: 'object',
        properties: mergedProperties
    };
}

/**
 * Main analysis function
 */
async function analyzeParamsStructure() {
    console.log('🔍 Analyzing params.js structure...');
    
    try {
        const paramsPath = path.join(process.cwd(), PARAMS_FILE);
        
        if (!fs.existsSync(paramsPath)) {
            console.error(`❌ File not found: ${PARAMS_FILE}`);
            return;
        }
        
        console.log(`📁 Reading ${PARAMS_FILE}...`);
        const content = fs.readFileSync(paramsPath, 'utf8');
        
        console.log('🔧 Extracting structure...');
        const basicStructure = extractObjectStructure(content);
        
        // Analyze specific arrays in detail
        const detailedStructure = { ...basicStructure };
        
        const arraysToAnalyze = ['regions', 'products', 'factories', 'consumers', 'items', 'effects', 'needs', 'residences', 'workforce', 'dlcs'];
        
        arraysToAnalyze.forEach(arrayName => {
            if (basicStructure[arrayName] && basicStructure[arrayName].type === 'array') {
                console.log(`📊 Analyzing ${arrayName} array...`);
                const itemStructure = analyzeArrayItems(content, arrayName);
                detailedStructure[arrayName] = {
                    type: 'array',
                    items: itemStructure
                };
            }
        });
        
        // Create comprehensive schema
        const schema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            title: 'Anno 1800 Calculator Params Detailed Schema',
            description: 'Detailed schema for the game parameters configuration',
            type: 'object',
            properties: detailedStructure,
            required: ['version'],
            additionalProperties: true
        };
        
        // Write detailed analysis
        const analysis = {
            fileInfo: {
                size: `${(content.length / 1024 / 1024).toFixed(2)} MB`,
                lines: content.split('\n').length,
                analyzedAt: new Date().toISOString()
            },
            structure: detailedStructure,
            statistics: {
                totalProperties: Object.keys(detailedStructure).length,
                arrayProperties: Object.values(detailedStructure).filter(p => p.type === 'array').length,
                objectProperties: Object.values(detailedStructure).filter(p => p.type === 'object').length,
                primitiveProperties: Object.values(detailedStructure).filter(p => ['string', 'number', 'boolean'].includes(p.type)).length
            }
        };
        
        fs.writeFileSync(OUTPUT_ANALYSIS, JSON.stringify(analysis, null, 2));
        fs.writeFileSync(OUTPUT_DETAILED_SCHEMA, JSON.stringify(schema, null, 2));
        
        console.log(`✅ Analysis written to ${OUTPUT_ANALYSIS}`);
        console.log(`✅ Detailed schema written to ${OUTPUT_DETAILED_SCHEMA}`);
        
        // Print summary
        console.log('\n📊 Analysis Summary:');
        console.log(`- File size: ${analysis.fileInfo.size}`);
        console.log(`- Total lines: ${analysis.fileInfo.lines}`);
        console.log(`- Properties found: ${analysis.statistics.totalProperties}`);
        console.log(`- Arrays: ${analysis.statistics.arrayProperties}`);
        console.log(`- Objects: ${analysis.statistics.objectProperties}`);
        console.log(`- Primitives: ${analysis.statistics.primitiveProperties}`);
        
        // Show top-level properties
        console.log('\n🏗️ Top-level properties:');
        Object.keys(detailedStructure).forEach(key => {
            const prop = detailedStructure[key];
            console.log(`  - ${key}: ${prop.type}${prop.items ? ` of ${prop.items.type}` : ''}`);
        });
        
    } catch (error) {
        console.error('❌ Error analyzing structure:', error.message);
        process.exit(1);
    }
}

// Run the analysis
analyzeParamsStructure(); 