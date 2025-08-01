// Complete TypeScript interfaces for params.js
// Generated on: 2025-07-13T15:43:58.392Z

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
