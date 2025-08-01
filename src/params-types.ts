// Auto-generated TypeScript interfaces for params.js
// Generated on: 2025-07-13T15:41:37.486Z

export interface GameParams {
    regions?: GameParamsRegionsItem[];
    products?: GameParamsProductsItem[];
    factories?: GameParamsFactoriesItem[];
    consumers?: GameParamsConsumersItem[];
    items?: GameParamsItemsItem[];
    effects?: GameParamsEffectsItem[];
    needs?: GameParamsNeedsItem[];
    residences?: GameParamsResidencesItem[];
    workforce?: GameParamsWorkforceItem[];
    dlcs?: GameParamsDlcsItem[];
    settings?: object;
    version: string;
}

// Missing type definitions for GameParams items
export interface GameParamsRegionsItem extends GameRegion {
    // Extends GameRegion interface
}

export interface GameParamsProductsItem extends GameProduct {
    // Extends GameProduct interface
}

export interface GameParamsFactoriesItem extends GameFactory {
    // Extends GameFactory interface
}

export interface GameParamsConsumersItem extends GameConsumer {
    // Extends GameConsumer interface
}

export interface GameParamsItemsItem extends GameItem {
    // Extends GameItem interface
}

export interface GameParamsEffectsItem {
    guid: string;
    name: string;
    locaText?: Record<string, string>;
    iconPath?: string;
    dlcs?: string[];
    available?: boolean;
    notes?: string;
    allowStacking?: boolean;
    entries?: any[];
    residences?: string[];
    panoramaLevel?: number;
}

export interface GameParamsNeedsItem extends GameNeed {
    // Extends GameNeed interface
}

export interface GameParamsResidencesItem extends GameResidence {
    // Extends GameResidence interface
}

export interface GameParamsWorkforceItem extends GameWorkforce {
    // Extends GameWorkforce interface
}

export interface GameParamsDlcsItem extends GameDLC {
    // Extends GameDLC interface
}

export interface GameItem {
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
