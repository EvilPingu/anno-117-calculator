// Generated TypeScript interfaces from params.schema.json
// This file contains configuration interfaces for Anno 117 calculator parameters

// Common interface for localized text
export interface LocaTextConfig {
  english: string;
  french: string;
  polish: string;
  spanish: string;
  italian: string;
  german: string;
  brazilian: string;
  russian: string;
  simplified_chinese: string;
  traditional_chinese: string;
  japanese: string;
  korean: string;
  [key: string]: string; // Allow string indexing
}

// Constants configuration interface
export interface ConstantsConfig {
  fuelProductionTime: number;
  fuelProduct: number;
}

// Language configuration interface
export interface LanguageConfig {
  // This interface represents individual items in the languages array
  // The actual array type is string[]

}

// NeedConsumption configuration interface
export interface NeedConsumptionConfig {
  id: string;
  name: string;
  locaText: LocaTextConfig;
  consumptionFactor: number;
}

// Region configuration interface
export interface RegionConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText?: LocaTextConfig;
  id: string;
}

// Session configuration interface
export interface SessionConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  region: number;
}

// NeedAttribute configuration interface
export interface NeedAttributeConfig {
  id: string;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
}

// NeedCategory configuration interface
export interface NeedCategoryConfig {
  id: string;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
}

// Need configuration interface
export interface NeedConfig {
  guid: number;
  name: string;
  needProduct: number;
  needCategory: string;
  supplyWeight: number;
  isBuilding: boolean;
  needAttributes: {
    Population: number;
    Money: number;
    Happiness: number;
    Health: number;
    FireSafety: number;
    Belief: number;
    Knowledge: number;
    Prestige: number;
    [key: string]: number; // Allow string indexing
  };
  iconPath?: string;
  locaText?: LocaTextConfig;
}

// PopulationGroup configuration interface
export interface PopulationGroupConfig {
  guid: number;
  name: string;
  locaText: LocaTextConfig;
  populationLevels: number[];
  region: string;
}

// ResidenceBuilding configuration interface
export interface ResidenceBuildingConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  associatedRegions: string[];
  possibleUpgrades?: number[];
  populationLevel: number;
  needsList: {
    need: number;
    needConsumptionRate?: number;
  }[];
}

// PopulationLevel configuration interface
export interface PopulationLevelConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  connectedWorkforce: number;
  populationToWorkforceFactor: number;
  associatedRegions: string[];
}

// Product configuration interface
export interface ProductConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  isAbstract: boolean;
  associatedRegions?: string[];
}

// Workforce configuration interface
export interface WorkforceConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  associatedRegions: string[];
}

// ProductFilter configuration interface
export interface ProductFilterConfig {
  iconPath: string;
  locaText: LocaTextConfig;
  guid: number;
  products: number[];
}

// Factory configuration interface
export interface FactoryConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  associatedRegions: string[];
  needsFuelInput: boolean;
  outputs: {
    product: number;
    amount: number;
  }[];
  maintenances: {
    product: number;
    amount: number;
  }[];
  cycleTime: number;
  modulesLimit: number;
  inputs?: {
    product: number;
    amount: number;
  }[];
}

// Module configuration interface
export interface ModuleConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  associatedRegions: string[];
  inputs: {
    product: number;
    amount: number;
  }[];
  needsFuelInput: boolean;
  cycleTime: number;
  modulesLimit: number;
}

// Icon configuration interface
export interface IconConfig {
  [iconPath: string]: string;

}

// Root configuration interface combining all parameter types
export interface ParamsConfig {
  constants: ConstantsConfig;
  languages: string[];
  needConsumptions: NeedConsumptionConfig[];
  regions: RegionConfig[];
  sessions: SessionConfig[];
  needAttributes: NeedAttributeConfig[];
  needCategories: NeedCategoryConfig[];
  needs: NeedConfig[];
  populationGroups: PopulationGroupConfig[];
  residenceBuildings: ResidenceBuildingConfig[];
  populationLevels: PopulationLevelConfig[];
  products: ProductConfig[];
  workforce: WorkforceConfig[];
  productFilters: ProductFilterConfig[];
  factories: FactoryConfig[];
  modules: ModuleConfig[];
  icons: IconConfig;
}
