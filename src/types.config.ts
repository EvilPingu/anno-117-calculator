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

// Language configuration interface
export interface LanguageConfig {
  // This interface represents individual items in the languages array
  // The actual array type is string[]

}

// Region configuration interface
export interface RegionConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
}

// Session configuration interface
export interface SessionConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  region: number;
}

// PopulationGroup configuration interface
export interface PopulationGroupConfig {
  guid: number;
  name: string;
  locaText: LocaTextConfig;
  populationLevels: number[];
}

// PopulationLevel configuration interface
export interface PopulationLevelConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  region: number;
  fullHouse: number;
  needs: {
    guid: number;
    residents: number;
    tpmin: number;
  }[];
  residence: number;
}

// ResidenceBuilding configuration interface
export interface ResidenceBuildingConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
  populationLevel: number;
  region: number;
  residentMax: number;
  residentsPerNeed: {
    2097: number;
    2108: number;
    2137: number;
    2139: number;
    2141: number;
    2143: number;
    2149: number;
    2156: number;
    2159: number;
    6706: number;
    6709: number;
    6710: number;
    8405: number;
    16201: number;
    31700: number;
    [key: number]: number; 
  };
}

// Workforce configuration interface
export interface WorkforceConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
}

// Product configuration interface
export interface ProductConfig {
  guid: number;
  name: string;
  iconPath: string;
  locaText: LocaTextConfig;
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
  region: number;
  outputs: {
    Product: number;
    Amount: number;
  }[];
  maintenances: {
    Product: number;
    Amount: number;
  }[];
  tpmin: number;
}

// Icon configuration interface
export interface IconConfig {
  [iconPath: string]: string;

}

// Root configuration interface combining all parameter types
export interface ParamsConfig {
  languages: string[];
  regions: RegionConfig[];
  sessions: SessionConfig[];
  populationGroups: PopulationGroupConfig[];
  populationLevels: PopulationLevelConfig[];
  residenceBuildings: ResidenceBuildingConfig[];
  workforce: WorkforceConfig[];
  products: ProductConfig[];
  productFilter: ProductFilterConfig[];
  factories: FactoryConfig[];
  icons: IconConfig;
}
