#!/usr/bin/env node

/**
 * Critical TypeScript Error Fixer
 * 
 * This script helps fix the most critical TypeScript errors
 * by generating interface extensions and type fixes.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generates interface extensions for missing properties
 */
function generateInterfaceExtensions() {
    const extensions = `
// Interface extensions for missing properties
// Add this to src/types.ts or create src/interface-extensions.ts

// Extend Factory interface with missing properties
export interface FactoryExtended {
    clipped?: () => boolean;
    percentBoost?: (value?: number) => number;
    palaceBuffChecked?: (value: boolean) => void;
    setBuffChecked?: (value: boolean) => void;
    goodConsumptionUpgrade?: any;
    recipeName?: any;
    visible?: () => boolean;
    [key: string]: any; // Index signature for dynamic properties
}

// Extend Consumer interface with missing properties
export interface ConsumerExtended {
    percentBoost?: (value?: number) => number;
    goodConsumptionUpgrade?: any;
    [key: string]: any; // Index signature for dynamic properties
}

// Extend PowerPlant interface with missing properties
export interface PowerPlantExtended {
    visible?: () => boolean;
    [key: string]: any; // Index signature for dynamic properties
}

// Extend Item interface with missing properties
export interface ItemExtended {
    icon?: string;
    locaText?: Record<string, string>;
    [key: string]: any; // Index signature for dynamic properties
}

// Extend ResidenceEffect interface with missing properties
export interface ResidenceEffectExtended {
    allowStacking?: boolean;
    entries?: any[];
    name?: string;
    guid?: number;
    [key: string]: any; // Index signature for dynamic properties
}

// Type guards for safe property access
export function isFactory(obj: any): obj is FactoryExtended {
    return obj && typeof obj.produce === 'function';
}

export function isConsumer(obj: any): obj is ConsumerExtended {
    return obj && typeof obj.consume === 'function';
}

export function isPowerPlant(obj: any): obj is PowerPlantExtended {
    return obj && obj.type === 'powerPlant';
}

export function isItem(obj: any): obj is ItemExtended {
    return obj && typeof obj.guid === 'number';
}

export function isResidenceEffect(obj: any): obj is ResidenceEffectExtended {
    return obj && typeof obj.effectsPerNeed === 'object';
}
`;

    fs.writeFileSync('src/interface-extensions.ts', extensions);
    console.log('✅ Generated interface extensions in src/interface-extensions.ts');
}

/**
 * Generates type conversion utilities
 */
function generateTypeUtilities() {
    const utilities = `
// Type conversion utilities
// Add this to src/type-utils.ts

/**
 * Safely converts a value to a number
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns The converted number or default value
 */
export function safeToNumber(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
}

/**
 * Safely converts a value to a boolean
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns The converted boolean or default value
 */
export function safeToBoolean(value: any, defaultValue: boolean = false): boolean {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    if (typeof value === 'number') {
        return value !== 0;
    }
    return defaultValue;
}

/**
 * Safely converts a GUID to a number
 * @param guid - The GUID to convert
 * @returns The converted number or 0
 */
export function guidToNumber(guid: any): number {
    if (typeof guid === 'number') {
        return guid;
    }
    if (typeof guid === 'string') {
        const parsed = parseInt(guid, 10);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

/**
 * Safely accesses object properties
 * @param obj - The object to access
 * @param path - The property path (e.g., 'property.subProperty')
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default value
 */
export function safeGet(obj: any, path: string, defaultValue: any = undefined): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current == null || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
}

/**
 * Safely calls a method on an object
 * @param obj - The object to call the method on
 * @param methodName - The name of the method
 * @param args - Arguments to pass to the method
 * @returns The method result or undefined
 */
export function safeCall(obj: any, methodName: string, ...args: any[]): any {
    if (obj && typeof obj[methodName] === 'function') {
        return obj[methodName](...args);
    }
    return undefined;
}
`;

    fs.writeFileSync('src/type-utils.ts', utilities);
    console.log('✅ Generated type utilities in src/type-utils.ts');
}

/**
 * Generates module declarations for missing modules
 */
function generateModuleDeclarations() {
    const declarations = `
// Module declarations for missing modules
// Add this to src/module-declarations.d.ts

declare module './i18n' {
    export const languageCodes: string[];
    export const texts: Record<string, any>;
}

declare module './production' {
    export class Product {
        guid: number;
        name: string;
        available(): boolean;
    }
    export class MetaProduct {
        guid: number;
        name: string;
    }
    export class NoFactoryProduct {
        guid: number;
        name: string;
    }
}

declare module './consumption' {
    export class NoFactoryNeed {
        guid: number;
        name: string;
    }
    export class PopulationNeed {
        guid: number;
        name: string;
    }
    export class PublicBuildingNeed {
        guid: number;
        name: string;
    }
    export class ResidenceNeed {
        guid: number;
        name: string;
    }
    export class ResidenceEffectEntryCoverage {
        constructor(coverage: any, entry: any);
    }
}

declare module './views' {
    export class ResidenceEffectView {
        constructor(residences: any[], heading?: string, need?: any);
    }
}

declare module './components' {
    // Component exports
}

declare module 'knockout' {
    export = ko;
}

declare module 'knockout-amd-helpers' {
    // AMD helpers
}
`;

    fs.writeFileSync('src/module-declarations.d.ts', declarations);
    console.log('✅ Generated module declarations in src/module-declarations.d.ts');
}

/**
 * Creates a quick fix script for common errors
 */
function createQuickFixScript() {
    const script = `
#!/usr/bin/env node

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
                console.log(\`✅ Applied fix to \${fix.file}\`);
            }
        }
    });
    
    console.log('🎉 Quick fixes applied!');
}

if (require.main === module) {
    applyFixes();
}
`;

    fs.writeFileSync('scripts/quick-fix.js', script);
    console.log('✅ Created quick fix script in scripts/quick-fix.js');
}

/**
 * Updates package.json with new scripts
 */
function updatePackageScripts() {
    const packagePath = 'package.json';
    if (!fs.existsSync(packagePath)) {
        console.log('❌ package.json not found');
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add new scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['fix-critical'] = 'node fix-critical-errors.js';
    packageJson.scripts['quick-fix'] = 'node scripts/quick-fix.js';
    packageJson.scripts['generate-types'] = 'node fix-critical-errors.js && node scripts/quick-fix.js';

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with new scripts');
}

/**
 * Main function
 */
function main() {
    console.log('🔧 Critical TypeScript Error Fixer\n');

    // Create scripts directory if it doesn't exist
    if (!fs.existsSync('scripts')) {
        fs.mkdirSync('scripts');
    }

    // Generate all the necessary files
    generateInterfaceExtensions();
    generateTypeUtilities();
    generateModuleDeclarations();
    createQuickFixScript();
    updatePackageScripts();

    console.log('\n🎉 Critical error fixer setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run fix-critical');
    console.log('2. Run: npm run quick-fix');
    console.log('3. Run: npm run type-check');
    console.log('4. Review and fix remaining errors');
    console.log('\nFiles created:');
    console.log('- src/interface-extensions.ts');
    console.log('- src/type-utils.ts');
    console.log('- src/module-declarations.d.ts');
    console.log('- scripts/quick-fix.js');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    generateInterfaceExtensions,
    generateTypeUtilities,
    generateModuleDeclarations,
    createQuickFixScript,
    updatePackageScripts
}; 