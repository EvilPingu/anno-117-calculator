
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
