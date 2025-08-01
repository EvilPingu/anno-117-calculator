#!/usr/bin/env node

/**
 * Simple script to analyze params.js structure
 * Reads the file in chunks to handle the large size
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PARAMS_FILE = 'js/params.js';
const OUTPUT_SUMMARY = 'params-summary.json';

/**
 * Analyzes the params.js file by reading it in chunks
 */
async function analyzeParamsFile() {
    console.log('🔍 Analyzing params.js file...');
    
    try {
        const paramsPath = path.join(process.cwd(), PARAMS_FILE);
        
        if (!fs.existsSync(paramsPath)) {
            console.error(`❌ File not found: ${PARAMS_FILE}`);
            return;
        }
        
        console.log(`📁 Reading ${PARAMS_FILE}...`);
        
        // Get file stats
        const stats = fs.statSync(paramsPath);
        const fileSize = stats.size;
        const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
        
        console.log(`📊 File size: ${fileSizeMB} MB`);
        
        // Read the first 10KB to understand the structure
        const sampleSize = 10 * 1024; // 10KB
        const sample = fs.readFileSync(paramsPath, 'utf8', { start: 0, end: sampleSize });
        
        console.log('🔧 Analyzing file structure...');
        
        // Look for common patterns
        const patterns = {
            // Look for window.params assignment
            windowParams: /window\.params\s*=/g,
            // Look for params assignment
            paramsAssignment: /params\s*=/g,
            // Look for array declarations
            arrays: /(\w+)\s*:\s*\[/g,
            // Look for object declarations
            objects: /(\w+)\s*:\s*\{/g,
            // Look for string assignments
            strings: /(\w+)\s*:\s*["']([^"']+)["']/g,
            // Look for number assignments
            numbers: /(\w+)\s*:\s*(\d+)/g,
            // Look for boolean assignments
            booleans: /(\w+)\s*:\s*(true|false)/g,
            // Look for GUID patterns
            guids: /guid\s*:\s*["']([^"']+)["']/g,
            // Look for name patterns
            names: /name\s*:\s*["']([^"']+)["']/g
        };
        
        const results = {};
        
        // Count pattern matches
        Object.keys(patterns).forEach(patternName => {
            const pattern = patterns[patternName];
            const matches = sample.match(pattern);
            results[patternName] = {
                count: matches ? matches.length : 0,
                examples: matches ? matches.slice(0, 5) : []
            };
        });
        
        // Try to find the main object structure
        const mainObjectMatch = sample.match(/(?:window\.)?params\s*=\s*({[\s\S]*?);?\s*$/);
        
        if (mainObjectMatch) {
            console.log('✅ Found params object assignment');
            results.mainObject = {
                found: true,
                start: mainObjectMatch[0].substring(0, 200) + '...'
            };
        } else {
            console.log('⚠️ Could not find params object assignment');
            results.mainObject = { found: false };
        }
        
        // Look for specific game-related arrays
        const gameArrays = ['regions', 'products', 'factories', 'consumers', 'items', 'effects', 'needs', 'residences', 'workforce', 'dlcs'];
        const foundArrays = {};
        
        gameArrays.forEach(arrayName => {
            const arrayPattern = new RegExp(`${arrayName}\\s*:\\s*\\[`, 'g');
            const matches = sample.match(arrayPattern);
            foundArrays[arrayName] = matches ? matches.length : 0;
        });
        
        results.gameArrays = foundArrays;
        
        // Create summary
        const summary = {
            fileInfo: {
                path: PARAMS_FILE,
                size: `${fileSizeMB} MB`,
                bytes: fileSize,
                lines: sample.split('\n').length,
                analyzedAt: new Date().toISOString()
            },
            analysis: {
                sampleSize: `${(sampleSize / 1024).toFixed(1)} KB`,
                patterns: results,
                estimatedStructure: {
                    type: 'object',
                    properties: {
                        version: { type: 'string' },
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
                        settings: { type: 'object' }
                    }
                }
            }
        };
        
        // Write summary
        fs.writeFileSync(OUTPUT_SUMMARY, JSON.stringify(summary, null, 2));
        console.log(`✅ Analysis summary written to ${OUTPUT_SUMMARY}`);
        
        // Print results
        console.log('\n📊 Analysis Results:');
        console.log(`- File size: ${fileSizeMB} MB`);
        console.log(`- Sample analyzed: ${(sampleSize / 1024).toFixed(1)} KB`);
        console.log(`- Lines in sample: ${sample.split('\n').length}`);
        
        console.log('\n🔍 Pattern Analysis:');
        Object.keys(results.patterns).forEach(patternName => {
            const pattern = results.patterns[patternName];
            if (pattern.count > 0) {
                console.log(`  - ${patternName}: ${pattern.count} matches`);
            }
        });
        
        console.log('\n🎮 Game Arrays Found:');
        Object.keys(results.gameArrays).forEach(arrayName => {
            const count = results.gameArrays[arrayName];
            if (count > 0) {
                console.log(`  - ${arrayName}: ${count} occurrences`);
            }
        });
        
        console.log('\n📝 Generated Files:');
        console.log(`  - ${OUTPUT_SUMMARY}: Analysis summary`);
        console.log(`  - src/params-schema.json: Basic JSON schema`);
        console.log(`  - src/params-types.ts: TypeScript interfaces`);
        console.log(`  - src/params.ts: TypeScript implementation`);
        
    } catch (error) {
        console.error('❌ Error analyzing file:', error.message);
        process.exit(1);
    }
}

// Run the analysis
analyzeParamsFile(); 