#!/usr/bin/env node

/**
 * Quick fix script for critical TypeScript migration issues
 * This script addresses the most common type errors automatically
 */

const fs = require('fs');
const path = require('path');

// Files to process
const files = [
    'src/types.ts',
    'src/consumption.ts',
    'src/production.ts',
    'src/world.ts',
    'src/population.ts',
    'src/factories.ts',
    'src/main.ts'
];

// Fix patterns
const fixes = [
    // Fix GUID type issues in consumption.ts
    {
        file: 'src/consumption.ts',
        patterns: [
            {
                from: /this\.residence\.residentsPerNeed\.get\(this\.need\.guid\.toString\(\)\)/g,
                to: 'this.residence.residentsPerNeed.get(this.need.guid)'
            },
            {
                from: /this\.product = assetsMap\.get\(this\.guid\)/g,
                to: 'this.product = assetsMap.get(this.guid.toString())'
            }
        ]
    },
    
    // Fix constructor config issues in production.ts
    {
        file: 'src/production.ts',
        patterns: [
            {
                from: /const parentConfig = \{\s*name: config\.name,\s*locaText: config\.locaText \|\| \{\},\s*iconPath: config\.iconPath \|\| "",\s*dlcs: config\.dlcs \|\| \[\]\s*\};/g,
                to: 'const parentConfig = {\n            guid: config.guid,\n            name: config.name,\n            locaText: config.locaText || {},\n            iconPath: config.iconPath || "",\n            dlcs: config.dlcs || []\n        };'
            }
        ]
    },
    
    // Fix asset map lookups
    {
        file: 'src/production.ts',
        patterns: [
            {
                from: /assetsMap\.get\(p\)/g,
                to: 'assetsMap.get(p.toString())'
            },
            {
                from: /assetsMap\.get\(f\)/g,
                to: 'assetsMap.get(f.toString())'
            }
        ]
    },
    
    // Fix null safety issues
    {
        file: 'src/world.ts',
        patterns: [
            {
                from: /island\.name\(\)/g,
                to: 'island?.name()'
            },
            {
                from: /island\.isAllIslands\(\)/g,
                to: 'island?.isAllIslands()'
            }
        ]
    }
];

function applyFixes() {
    console.log('🔧 Applying critical type fixes...\n');
    
    let totalFixes = 0;
    
    fixes.forEach(fix => {
        const filePath = path.join(process.cwd(), fix.file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fix.file}`);
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        let fileFixes = 0;
        
        fix.patterns.forEach(pattern => {
            const matches = content.match(pattern.from);
            if (matches) {
                content = content.replace(pattern.from, pattern.to);
                fileFixes += matches.length;
            }
        });
        
        if (fileFixes > 0) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed ${fileFixes} issues in ${fix.file}`);
            totalFixes += fileFixes;
        }
    });
    
    console.log(`\n🎉 Applied ${totalFixes} fixes total`);
    console.log('\nNext steps:');
    console.log('1. Run: npm run type-check');
    console.log('2. Address remaining errors manually');
    console.log('3. Update types.ts with missing interfaces');
}

// Run the fixes
applyFixes(); 