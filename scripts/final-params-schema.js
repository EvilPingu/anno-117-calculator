#!/usr/bin/env node

/**
 * Final script to generate comprehensive JSON schema for params.js
 * Based on analysis of the actual file structure
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_SCHEMA = 'src/params-complete-schema.json';
const OUTPUT_TYPES = 'src/params-complete-types.ts';

/**
 * Generates comprehensive JSON schema based on analysis
 */
function generateCompleteSchema() {
    console.log('📝 Generating comprehensive JSON schema...');
    
    // Based on the analysis, create a detailed schema
    const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Anno 1800 Calculator Complete Params Schema',
        description: 'Complete schema for the game parameters configuration',
        type: 'object',
        properties: {
            dlcs: {
                type: 'array',
                description: 'Downloadable content configurations',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        id: { type: 'string', description: 'DLC identifier' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        name: { type: 'string', description: 'DLC name' },
                        available: { type: 'boolean', description: 'Whether DLC is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'id', 'name']
                }
            },
            regions: {
                type: 'array',
                description: 'Game regions configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Region name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        islands: { 
                            type: 'array', 
                            description: 'Islands in this region',
                            items: { type: 'string' }
                        },
                        available: { type: 'boolean', description: 'Whether region is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            products: {
                type: 'array',
                description: 'Game products configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Product name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        region: { type: 'string', description: 'Region this product belongs to' },
                        factory: { type: 'string', description: 'Factory that produces this product' },
                        fixedFactory: { type: 'string', description: 'Fixed factory assignment' },
                        additionalOutputCycle: { type: 'number', description: 'Additional output cycle' },
                        amount: { type: 'number', description: 'Production amount' },
                        available: { type: 'boolean', description: 'Whether product is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            factories: {
                type: 'array',
                description: 'Game factories configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Factory name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        region: { type: 'string', description: 'Region this factory belongs to' },
                        workforce: { 
                            type: 'array', 
                            description: 'Workforce requirements',
                            items: { type: 'string' }
                        },
                        products: { 
                            type: 'array', 
                            description: 'Products this factory produces',
                            items: { type: 'string' }
                        },
                        inputs: { 
                            type: 'array', 
                            description: 'Input materials',
                            items: { type: 'string' }
                        },
                        productionTime: { type: 'number', description: 'Production time in seconds' },
                        workforceDemands: { 
                            type: 'array', 
                            description: 'Detailed workforce demands',
                            items: { type: 'object' }
                        },
                        available: { type: 'boolean', description: 'Whether factory is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            consumers: {
                type: 'array',
                description: 'Game consumers configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Consumer name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        region: { type: 'string', description: 'Region this consumer belongs to' },
                        workforce: { 
                            type: 'array', 
                            description: 'Workforce requirements',
                            items: { type: 'string' }
                        },
                        products: { 
                            type: 'array', 
                            description: 'Products this consumer needs',
                            items: { type: 'string' }
                        },
                        inputs: { 
                            type: 'array', 
                            description: 'Input materials',
                            items: { type: 'object' }
                        },
                        maintenances: { 
                            type: 'array', 
                            description: 'Maintenance requirements',
                            items: { type: 'object' }
                        },
                        tpmin: { type: 'number', description: 'Tons per minute' },
                        forceRegionExtendedName: { type: 'boolean', description: 'Force region extended name' },
                        product: { type: 'string', description: 'Main product' },
                        outputs: { 
                            type: 'array', 
                            description: 'Output products',
                            items: { type: 'object' }
                        },
                        productionTime: { type: 'number', description: 'Production time in seconds' },
                        workforceDemands: { 
                            type: 'array', 
                            description: 'Detailed workforce demands',
                            items: { type: 'object' }
                        },
                        available: { type: 'boolean', description: 'Whether consumer is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            items: {
                type: 'array',
                description: 'Game items configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Item name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        factories: { 
                            type: 'array', 
                            description: 'Factories that can use this item',
                            items: { type: 'string' }
                        },
                        replacements: { 
                            type: 'object', 
                            description: 'Item replacements',
                            additionalProperties: { type: 'string' }
                        },
                        replacementArray: { 
                            type: 'array', 
                            description: 'Array of replacements',
                            items: { type: 'string' }
                        },
                        replacingWorkforce: { type: 'object', description: 'Workforce replacement' },
                        additionalOutputs: { 
                            type: 'array', 
                            description: 'Additional outputs',
                            items: { type: 'object' }
                        },
                        equipments: { 
                            type: 'array', 
                            description: 'Equipment configurations',
                            items: { type: 'object' }
                        },
                        available: { type: 'boolean', description: 'Whether item is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            effects: {
                type: 'array',
                description: 'Game effects configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Effect name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        allowStacking: { type: 'boolean', description: 'Whether effects can stack' },
                        entries: { 
                            type: 'array', 
                            description: 'Effect entries',
                            items: { type: 'object' }
                        },
                        effectsPerNeed: { 
                            type: 'object', 
                            description: 'Effects per need',
                            additionalProperties: { type: 'object' }
                        },
                        residences: { 
                            type: 'array', 
                            description: 'Affected residences',
                            items: { type: 'string' }
                        },
                        panoramaLevel: { type: 'number', description: 'Panorama level' },
                        available: { type: 'boolean', description: 'Whether effect is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            needs: {
                type: 'array',
                description: 'Game needs configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Need name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        tpmin: { type: 'number', description: 'Tons per minute' },
                        isBonusNeed: { type: 'boolean', description: 'Whether this is a bonus need' },
                        excludePopulationFromMoneyAndConsumptionCalculation: { type: 'boolean', description: 'Exclude from calculations' },
                        residents: { type: 'number', description: 'Number of residents' },
                        requiredFloorLevel: { type: 'number', description: 'Required floor level' },
                        available: { type: 'boolean', description: 'Whether need is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            residences: {
                type: 'array',
                description: 'Game residences configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Residence name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        populationLevel: { type: 'string', description: 'Population level' },
                        residentMax: { type: 'number', description: 'Maximum residents' },
                        region: { type: 'string', description: 'Region this residence belongs to' },
                        residenceNeedsMap: { 
                            type: 'object', 
                            description: 'Residence needs mapping',
                            additionalProperties: { type: 'object' }
                        },
                        existingBuildings: { type: 'number', description: 'Number of existing buildings' },
                        residentsPerNeed: { 
                            type: 'object', 
                            description: 'Residents per need',
                            additionalProperties: { type: 'number' }
                        },
                        available: { type: 'boolean', description: 'Whether residence is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            workforce: {
                type: 'array',
                description: 'Game workforce configuration',
                items: {
                    type: 'object',
                    properties: {
                        guid: { type: 'number', description: 'Unique identifier' },
                        name: { type: 'string', description: 'Workforce name' },
                        iconPath: { type: 'string', description: 'Path to icon image' },
                        locaText: { 
                            type: 'object', 
                            description: 'Localized text strings',
                            additionalProperties: { type: 'string' }
                        },
                        demands: { 
                            type: 'array', 
                            description: 'Workforce demands',
                            items: { type: 'object' }
                        },
                        available: { type: 'boolean', description: 'Whether workforce is available' },
                        notes: { type: 'string', description: 'Additional notes' }
                    },
                    required: ['guid', 'name']
                }
            },
            settings: {
                type: 'object',
                description: 'Game settings configuration',
                properties: {
                    language: { type: 'string', description: 'Default language' },
                    options: { 
                        type: 'array', 
                        description: 'Game options',
                        items: { type: 'object' }
                    },
                    serverOptions: { 
                        type: 'array', 
                        description: 'Server options',
                        items: { type: 'object' }
                    },
                    serverAddress: { type: 'string', description: 'Default server address' }
                }
            },
            version: {
                type: 'string',
                description: 'Parameters version'
            }
        },
        required: ['version'],
        additionalProperties: true
    };
    
    return schema;
}

/**
 * Generates TypeScript interfaces from schema
 */
function generateTypeScriptInterfaces() {
    console.log('📝 Generating TypeScript interfaces...');
    
    const typesContent = `// Complete TypeScript interfaces for params.js
// Generated on: ${new Date().toISOString()}

// Base interface for all game items
export interface BaseGameItem {
    guid: number;
    name: string;
    iconPath?: string;
    locaText?: Record<string, string>;
    available?: boolean;
    notes?: string;
}

// DLC configuration
export interface DLC extends BaseGameItem {
    id: string;
}

// Region configuration
export interface Region extends BaseGameItem {
    islands?: string[];
}

// Product configuration
export interface Product extends BaseGameItem {
    region?: string;
    factory?: string;
    fixedFactory?: string;
    additionalOutputCycle?: number;
    amount?: number;
}

// Factory configuration
export interface Factory extends BaseGameItem {
    region?: string;
    workforce?: string[];
    products?: string[];
    inputs?: string[];
    productionTime?: number;
    workforceDemands?: any[];
}

// Consumer configuration
export interface Consumer extends BaseGameItem {
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

// Item configuration
export interface Item extends BaseGameItem {
    factories?: string[];
    replacements?: Record<string, string>;
    replacementArray?: string[];
    replacingWorkforce?: any;
    additionalOutputs?: any[];
    equipments?: any[];
}

// Effect configuration
export interface Effect extends BaseGameItem {
    allowStacking?: boolean;
    entries?: any[];
    effectsPerNeed?: Record<string, any>;
    residences?: string[];
    panoramaLevel?: number;
}

// Need configuration
export interface Need extends BaseGameItem {
    tpmin?: number;
    isBonusNeed?: boolean;
    excludePopulationFromMoneyAndConsumptionCalculation?: boolean;
    residents?: number;
    requiredFloorLevel?: number;
}

// Residence configuration
export interface Residence extends BaseGameItem {
    populationLevel?: string;
    residentMax?: number;
    region?: string;
    residenceNeedsMap?: Record<string, any>;
    existingBuildings?: number;
    residentsPerNeed?: Record<string, number>;
}

// Workforce configuration
export interface Workforce extends BaseGameItem {
    demands?: any[];
}

// Settings configuration
export interface Settings {
    language?: string;
    options?: any[];
    serverOptions?: any[];
    serverAddress?: string;
}

// Main params interface
export interface Params {
    version: string;
    dlcs?: DLC[];
    regions?: Region[];
    products?: Product[];
    factories?: Factory[];
    consumers?: Consumer[];
    items?: Item[];
    effects?: Effect[];
    needs?: Need[];
    residences?: Residence[];
    workforce?: Workforce[];
    settings?: Settings;
    [key: string]: any; // Allow additional properties
}

export default Params;
`;
    
    return typesContent;
}

/**
 * Main function
 */
async function generateCompleteFiles() {
    try {
        // Generate JSON schema
        const schema = generateCompleteSchema();
        fs.writeFileSync(OUTPUT_SCHEMA, JSON.stringify(schema, null, 2));
        console.log(`✅ Complete JSON schema written to ${OUTPUT_SCHEMA}`);
        
        // Generate TypeScript interfaces
        const typesContent = generateTypeScriptInterfaces();
        fs.writeFileSync(OUTPUT_TYPES, typesContent);
        console.log(`✅ Complete TypeScript interfaces written to ${OUTPUT_TYPES}`);
        
        console.log('\n🎉 Complete params schema generation finished!');
        console.log('\n📁 Generated files:');
        console.log(`  - ${OUTPUT_SCHEMA}: Complete JSON schema`);
        console.log(`  - ${OUTPUT_TYPES}: Complete TypeScript interfaces`);
        console.log(`  - src/params.ts: TypeScript implementation`);
        console.log(`  - src/params-schema.json: Basic JSON schema`);
        console.log(`  - src/params-types.ts: Basic TypeScript interfaces`);
        
        console.log('\n🎯 Next steps:');
        console.log('1. Review the generated schemas and types');
        console.log('2. Update your TypeScript files to use the new interfaces');
        console.log('3. Validate your params.js against the JSON schema');
        
    } catch (error) {
        console.error('❌ Error generating complete files:', error.message);
        process.exit(1);
    }
}

// Run the generation
generateCompleteFiles(); 