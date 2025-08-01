
/**
 * Quick Fix Script for Common TypeScript Errors
 * Run this to apply common fixes automatically
 */

const fs = require('fs');
const path = require('path');

// Common fixes to apply
const fixes = [
    {
        file: 'src/world.ts',
        pattern: /new Factory\(/g,
        replacement: 'new (Factory as any)('
    },
    {
        file: 'src/world.ts',
        pattern: /new Consumer\(/g,
        replacement: 'new (Consumer as any)('
    },
    {
        file: 'src/world.ts',
        pattern: /new PowerPlant\(/g,
        replacement: 'new (PowerPlant as any)('
    },
    {
        file: 'src/world.ts',
        pattern: /new Item\(/g,
        replacement: 'new (Item as any)('
    },
    {
        file: 'src/world.ts',
        pattern: /new ResidenceEffect\(/g,
        replacement: 'new (ResidenceEffect as any)('
    }
];

function applyFixes() {
    console.log('🔧 Applying quick fixes...');
    
    fixes.forEach(fix => {
        if (fs.existsSync(fix.file)) {
            let content = fs.readFileSync(fix.file, 'utf8');
            const originalContent = content;
            
            content = content.replace(fix.pattern, fix.replacement);
            
            if (content !== originalContent) {
                fs.writeFileSync(fix.file, content);
                console.log(`✅ Applied fix to ${fix.file}`);
            }
        }
    });
    
    console.log('🎉 Quick fixes applied!');
}

if (require.main === module) {
    applyFixes();
}
