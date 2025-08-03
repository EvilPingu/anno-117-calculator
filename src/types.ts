// Core type definitions for the Anno 1800 Calculator

import { NamedElement } from "./util";

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


// Base configuration interfaces
export interface NamedElementConfig {
  guid?: number;
  id?: string;
  name?: string;
  locaText: LocaTextConfig;
  iconPath?: string;
  dlcs?: string[];
  available?: boolean;
  notes?: string;
}

export interface OptionConfig extends NamedElementConfig {
  checked?: boolean;
}

export interface DLCConfig extends OptionConfig {
  id?: string;
  dependentObjects?: any[];
}

// Configuration interfaces for different components
export interface ConsumerConfig extends NamedElementConfig {
  guid:number;
  associatedRegions: string[];
  inputs: {
    product: number;
    amount: number;
  }[];
  needsFuelInput: boolean;

  maintenances: {
    product: number;
    amount: number;
  }[];
  cycleTime: number;
}

export interface BuffConfig extends NamedElementConfig {
  guid:number;
  additionalOutputCycle?: number;
  amount?: number;
  factory?: string;
  product?: string;
}

export interface WorkforceDemandConfig {
  factory: string;
  workforce: string;
  amount: number;
  percentBoost?: number;
}

export interface FactoryConfig extends ConsumerConfig {

  outputs: {
    product: number;
    amount: number;
  }[];
  modulesLimit: number;
}

export interface PopulationLevelConfig extends NamedElementConfig {
  populationLevel: number;
  residentMax: number;
  residentsPerNeed?: Map<string, number>;
  fullHouse: number;
  region: number;
  residence: number; 
  skyscraperLevels?: number[];
  specialResidence?: number;
  needs: NeedConfig[];
}

export interface NeedConfig {
  guid: number;
  tpmin?: number;
  isBonusNeed?: boolean;
  excludePopulationFromMoneyAndConsumptionCalculation?: boolean;
  residents?: number;
  requiredFloorLevel?: number;
}

export interface ResidenceNeedConfig {
  need: number;
  needConsumptionRate: number;
}

export interface ResidenceBuildingConfig extends NamedElementConfig {
  populationLevel?: string;
  residentMax?: number;
  region?: string;
  residenceNeedsMap?: Map<string, any>;
  existingBuildings?: number;
  residentsPerNeed?: Record<string, number>;
  upgradedBuilding?: number;
}


export interface WorkforceConfig extends NamedElementConfig {
  demands?: any[];
}

export interface RegionConfig extends NamedElementConfig {
  islands?: string[];
}

export interface SessionConfig extends NamedElementConfig {
  islands?: string[];
  region?: string;
}

export interface IslandConfig extends NamedElementConfig {
  region?: string;
  assetsMap?: Map<string, any>;
}

export interface TradeConfig extends NamedElementConfig {
  region?: string;
  products?: string[];
  amounts?: number[];
}

export interface NPCTraderConfig extends TradeConfig {
  demands?: any[];
}

export interface TradeManagerConfig extends NamedElementConfig {
  demands?: any[];
}

export interface ViewConfig {
  settings: {
    language: KnockoutObservable<string>;
    options: any[];
    serverOptions: any[];
    serverAddress: KnockoutObservable<string>;
  };
  texts: Record<string, any>;
  dlcs: any[];
  dlcsMap: Map<string, any>;
  islands?: KnockoutObservableArray<any>;
  selectedIsland?: KnockoutObservable<any>;
  selectedResidenceEffectView?: KnockoutObservable<any>;
}

// Utility function types
export interface NumberInputHandlerParams {
  obs: KnockoutObservable<number>;
  id: string;
}

export interface NumericBounds {
  precision?: number;
  min: number;
  max: number;
  callback?: (value: number, current: number, newValue: any) => number | null;
}

// Asset map type - any type that extends NamedElement
export type AssetsMap = Map<number, any>;
export type LiteralsMap = Map<string, NamedElement>;

// Helper functions for AssetsMap operations
export function getFromAssetsMap(assetsMap: AssetsMap, guid: string | number): any {
    const numericGuid = typeof guid === 'string' ? parseInt(guid) : guid;
    return isNaN(numericGuid) ? undefined : assetsMap.get(numericGuid);
}

export function setInAssetsMap(assetsMap: AssetsMap, guid: string | number, element: any): void {
    const numericGuid = typeof guid === 'string' ? parseInt(guid) : guid;
    if (!isNaN(numericGuid)) {
        assetsMap.set(numericGuid, element);
    }
}

export function generateGuidIfMissing(element: any): string {
    if (!element.guid) {
        // Generate a unique guid if missing - use timestamp + random for uniqueness
        element.guid = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }
    return element.guid;
}

// Core game interfaces with comprehensive property definitions
export interface PopulationLevel {
  guid: number;
  name: string;
  residents: KnockoutObservable<number>;
  residence: ResidenceBuilding;
  allResidences: ResidenceBuilding[];
  region: any;
  skyscraperLevels?: any;
  hasSkyscrapers(): boolean;
  needsMap: Map<string, any>;
  needs: any[];
  buildingNeeds: any[];
  notes?: KnockoutObservable<string>;
  [key: string]: any; // Allow dynamic properties
}

export interface ResidenceBuilding {
  guid: number;
  name: string;
  existingBuildings: KnockoutObservable<number>;
  consumingLimit(): number;
  residentsPerNeed: Map<string | number, number>;
  getConsumptionEntries(need: any): any[];
  addEffect(effect: any): void;
  applyEffects(effects: Record<string, any>): void;
  populationLevel: PopulationLevel;
  upgradedBuilding?: ResidenceBuilding;
  canEdit(): boolean;
  floorCount: number;
  [key: string]: any; // Allow dynamic properties
}

export interface PopulationNeed {
  guid: number;
  name: string;
  checked(): boolean;
  amount?: number;
  tpmin: number;
  isInactive(): boolean;
  banned(): boolean;
  addResidenceNeed(need: ResidenceNeed): void;
  notes?: KnockoutObservable<string>;
  [key: string]: any; // Allow dynamic properties
}

export interface ResidenceNeed {
  residence: ResidenceBuilding; // Non-nullable
  need: PopulationNeed; // Non-nullable
  substitution: KnockoutObservable<number>;
  fulfillment: KnockoutObservable<number>;
  amount?: KnockoutComputed<number>;
  residentsPerHouse: KnockoutComputed<number>;
  residents: KnockoutComputed<number>;
  residenceNeedsMap?: Map<string, any>;
  substitutionSubscription?: KnockoutComputed<void>;
  [key: string]: any; // Allow dynamic properties
}

export interface Region {
  guid: number;
  name: KnockoutObservable<string>;
  icon?: string;
  [key: string]: any;
}

export interface Demand {
  guid: number;
  consumer: Factory;
  factor: number;
  amount: KnockoutObservable<number>;
  updateAmount(amount: number): void;
}

export interface Output {
  Product: string;
  Amount: number;
  product?: Product;
}

export interface Item {
  guid: number;
  name(): string;
  icon?: string;
  locaText?: LocaTextConfig;
  factories: Factory[];
  replacements?: Map<Product, Product>;
  replacementArray?: Product[];
  replacingWorkforce?: Workforce;
  additionalOutputs?: Map<Product, number>;
  equipments: Equipment[];
  checked: KnockoutComputed<boolean>;
  visible(): boolean;
  notes?: KnockoutObservable<string>;
  [key: string]: any; // Allow dynamic properties
}

export interface Factory {
  guid: number;
  name: KnockoutObservable<string>;
  available(): boolean;
  outputAmount?: KnockoutComputed<number>;
  region: Region | null;
  add(demand: Demand): void;
  remove(demand: Demand): void;
  getOutputs(): Output[];
  getInputs(): { Product: string; Amount?: number }[];
  items: Item[];
  extraGoodProductionList?: ExtraGoodProductionList;
  extraGoodProductionAmount?: KnockoutComputed<number>;
  inputAmount(): number;
  demands(): Demand[];
  island: Island;
  getRegionExtendedName(): string;
  percentBoost?: KnockoutObservable<number>;
  palaceBuffChecked?: KnockoutObservable<boolean>;
  setBuffChecked?: KnockoutObservable<boolean>;
  moduleChecked?: KnockoutObservable<boolean>;
  fertilizerModuleChecked?: KnockoutObservable<boolean>;
  existingBuildings: KnockoutObservable<number>;
  buildings(): number;
  visible(): boolean;
  inputDemands(): Demand[];
  overProduction?: KnockoutComputed<number>;
  substitutableOutputAmount?: KnockoutComputed<number>;
  editable?: (value?: boolean) => boolean;
  // Consolidated properties from extensions
  clipped?: () => boolean;
  extraGoodFactor?: KnockoutComputed<number>;
  goodConsumptionUpgrade?: any;
  recipeName?: KnockoutComputed<string>;
  fixedFactory?: KnockoutObservable<Factory | null> | ((factory: Factory | null) => void);
  // Property for factories that accept fixed factory assignment
  fixedFactoryProperty?: KnockoutObservable<any>;
  // Method version for compatibility
  fixedFactoryMethod?: (factory: any) => void;
  [key: string]: any; // Allow dynamic properties for flexibility
}

export interface Workforce {
  guid: number;
  name: string;
  visible(): boolean;
  demands(): any[];
  [key: string]: any;
}

export interface WorkforceDemand {
  percentBoost(): number;
  updateAmount(amount: number): void;
  updateWorkforce(workforce: Workforce | null): void;
}

export interface Consumer extends Factory {
  // Consumer-specific properties
  workforceDemand?: WorkforceDemand;
  percentBoost?: KnockoutObservable<number>;
  existingBuildings: KnockoutObservable<number>;
  product?: Product | null | undefined;
  [key: string]: any; // Allow dynamic properties
}

export interface Need {
  guid: number;
  factory: Factory;
  amount: number;
}

export interface Product {
  guid: number;
  name: string;
  icon: string;
  available(): boolean;
  addNeed(need: Need): void;
  factories: Factory[];
  mainFactory?: Factory | null;
  fixedFactory?: KnockoutObservable<Factory | null>;
  producers?: string[];
  isAbstract?: boolean;
  availableFactories?: KnockoutComputed<Factory[]>;
  visible?: KnockoutComputed<boolean>;
  [key: string]: any; // Allow dynamic properties
}

export interface NoFactoryProduct extends Product {
  residentsInputFactor: number;
  needs: KnockoutObservableArray<Need>;
  amount: KnockoutComputed<number>;
  residentsInput: KnockoutComputed<number>;
  visible: KnockoutComputed<boolean>;
  [key: string]: any; // Allow dynamic properties
}

export interface MetaProduct extends Product {
  guid: number;
  [key: string]: any; // Allow dynamic properties
}

export interface Equipment {
  guid: number;
  name: string;
  checked(): boolean;
}

export interface Module {
  guid: number;
  name: KnockoutObservable<string>;
  lockDLCIfSet(observable: KnockoutObservable<boolean>): void;
  additionalOutputCycle: number;
  productivityUpgrade: number;
  workforceAmountUpgrade?: { Value: number } | undefined;
  tpmin: number;
  getInputs(): { Product: string; Amount?: number }[];
}

export interface Buff {
  guid: number;
  name: KnockoutObservable<string>;
  lockDLCIfSet(observable: KnockoutObservable<boolean>): void;
  additionalOutputCycle: number;
}

export interface TradeList {
  inputAmount(): number;
  outputAmount(): number;
  routes?: any[];
  amount?: KnockoutComputed<number>;
  onShow?: () => void;
  unusedIslands?: any;
}

export interface ExtraGoodProductionEntry {
  item: Item;
  Amount: number;
  additionalOutputCycle: number;
  amount(): number;
}

export interface ExtraGoodProductionList {
  factory: Factory;
  checked: KnockoutObservable<boolean>;
  selfEffecting: KnockoutObservableArray<ExtraGoodProductionEntry>;
  entries: KnockoutObservableArray<ExtraGoodProductionEntry>;
  nonZero: KnockoutComputed<ExtraGoodProductionEntry[]>;
  amount: KnockoutComputed<number>;
  amountWithSelf: KnockoutComputed<number>;
  [key: string]: any; // Allow dynamic properties
}

export interface Island {
  guid?: number;
  name: KnockoutObservable<string>;
  region: Region;
  assetsMap: AssetsMap;
  session: Session;
  factories: Factory[];
  populationLevels: PopulationLevel[];
  residenceBuildings: ResidenceBuilding[];
  multiFactoryProducts: Product[];
  extraGoodItems: Item[];
  storage: Storage;
  isAllIslands(): boolean;
  [key: string]: any; // Allow dynamic properties
}

export interface BuildingsCalc {
  constructed: KnockoutObservable<number>;
  planned: KnockoutObservable<number>;
  required: KnockoutObservable<number>;
}


export interface Session {
  addIsland(island: Island): void;
  deleteIsland(island: Island): void;
  available(): boolean;
  [key: string]: any; // Allow dynamic properties
}

export interface GameParams {
  dlcs: DLCConfig[];
  regions: RegionConfig[];
  sessions: SessionConfig[];
  traders: NPCTraderConfig[];
  [key: string]: any;
}

export interface IslandManager {
  params: GameParams;
  serverNamesMap: Map<string, Island>;
  islandCandidates: KnockoutObservableArray<IslandCandidate>;
  unusedNames: Set<string>;
  allIslands: Island;
  compareNames(name1: string, name2: string): number;
  getIsland(name: string): Island | null;
  getByName(name: string): Island | null;
  createIsland(name: string | null, session: Session): Island;
  deleteIsland(name: string): void;
  registerName(name: string, session: Session): void;
  [key: string]: any; // Allow dynamic properties
}

export interface IslandCandidate {
  name: string;
  session: Session;
  [key: string]: any; // Allow dynamic properties
}

export interface Storage {
  constructor(name: string): void;
  [key: string]: any; // Allow dynamic properties
}

export interface PublicConsumerBuilding {
  goodConsumptionUpgrade?: any;
  recipeName?: KnockoutComputed<string>;
  visible(): boolean;
  existingBuildings: KnockoutObservable<number>;
  workforceDemand?: any;
  percentBoost?: KnockoutObservable<number>;
  notes?: KnockoutObservable<string>;
  guid: number;
  name: KnockoutObservable<string>;
  [key: string]: any; // Allow dynamic properties for assignment
}

export interface NPCTrader {
  // NPC trader properties
  [key: string]: any; // Allow dynamic properties
}

export interface TradeManager {
  // Trade manager properties
  routes(): any[];
  npcRoutes(): any[];
  remove(route: any): void;
  [key: string]: any; // Allow dynamic properties
}

export interface DarkMode {
  // Dark mode properties
  [key: string]: any; // Allow dynamic properties
}

export interface ViewMode {
  // View mode properties
  [key: string]: any; // Allow dynamic properties
}

export interface Template {
  // Template properties
  [key: string]: any; // Allow dynamic properties
}

export interface ProductionChainView {
  // Production chain view properties
  [key: string]: any; // Allow dynamic properties
}

export interface ResidenceEffectView {
  // Residence effect view properties
  constructor(residences: any[], heading?: string, need?: any): void;
  [key: string]: any; // Allow dynamic properties
}

export interface CollapsibleStates {
  get(id: string, collapsed: boolean): any;
  [key: string]: any; // Allow dynamic properties
}

// Utility types
export type ALL_ISLANDS = string;

// Global declarations
declare global {
  interface Window {
    view: any;
    params: any;
    ko: any;
    $: any;
    ACCURACY: number;
    formatNumber: (num: number | string, forceSign?: boolean) => string;
    formatPercentage: (num: number | string, forceSign?: boolean) => string;
    factoryReset: () => void;
    exportConfig: () => void;
  }
} 

export interface RecipeList {
  constructor(config: any, assetsMap: any, island: Island): void;
  guid: number;
  name: string;
  visible(): boolean; // Method version
  [key: string]: any; // Allow dynamic properties
} 