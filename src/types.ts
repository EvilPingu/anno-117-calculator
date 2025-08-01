// Core type definitions for the Anno 1800 Calculator

// Knockout.js type definitions
export interface KnockoutObservable<T> {
  (): T; // Callable to get value
  (value: T): void; // Callable with value to set it
  subscribe(callback: () => void): void;
  unsubscribe(callback: () => void): void;
  extend(options: any): KnockoutObservable<T>;
  notifySubscribers(): void;
}

export interface KnockoutComputed<T> {
  (): T; // Callable to get value
  subscribe(callback: () => void): void;
  unsubscribe(callback: () => void): void;
  notifySubscribers(): void;
}

export interface KnockoutPureComputed<T> {
  (): T; // Callable to get value
  subscribe(callback: () => void): void;
  unsubscribe(callback: () => void): void;
}

export interface KnockoutObservableArray<T> {
  (): T[]; // Callable to get array
  subscribe(callback: () => void): void;
  unsubscribe(callback: () => void): void;
  
  // Array reading methods
  indexOf(item: T): number;
  slice(start?: number, end?: number): T[];
  
  // Array manipulation methods
  push(value: T): void;
  pop(): T | undefined;
  unshift(value: T): void;
  shift(): T | undefined;
  reverse(): KnockoutObservableArray<T>;
  sort(compareFunction?: (a: T, b: T) => number): KnockoutObservableArray<T>;
  splice(start: number, deleteCount?: number, ...items: T[]): T[];
  
  // Knockout-specific methods
  sorted(compareFunction?: (a: T, b: T) => number): T[];
  reversed(): T[];
  replace(oldItem: T, newItem: T): void;
  remove(item: T): T[];
  remove(predicate: (item: T) => boolean): T[];
  removeAll(items: T[]): T[];
  removeAll(): T[];
  destroy(item: T): void;
  destroy(predicate: (item: T) => boolean): void;
  destroyAll(items: T[]): void;
  destroyAll(): void;
}

// Base configuration interfaces
export interface NamedElementConfig {
  guid: string;
  name: string;
  locaText: Record<string, string>;
  iconPath: string;
  dlcs: string[];
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
  workforceDemands?: WorkforceDemandConfig[];
}

export interface BuffConfig extends NamedElementConfig {
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

export interface FactoryConfig extends NamedElementConfig {
  region?: string;
  workforce?: string[];
  products?: string[];
  inputs?: string[];
  productionTime?: number;
  workforceDemands?: WorkforceDemandConfig[];
}

export interface PopulationLevelConfig extends NamedElementConfig {
  populationLevel?: string;
  residentMax?: number;
  residentsPerNeed?: Map<string, number>;
  fullHouse?: boolean;
  region?: string;
  residence?: string;
  upgradedBuilding?: string;
  skyscraperLevels?: string[];
  specialResidence?: string;
  needs?: NeedConfig[];
}

export interface NeedConfig {
  guid: string;
  tpmin?: number;
  isBonusNeed?: boolean;
  excludePopulationFromMoneyAndConsumptionCalculation?: boolean;
  residents?: number;
  requiredFloorLevel?: number;
}

export interface ResidenceBuildingConfig extends NamedElementConfig {
  populationLevel?: string;
  residentMax?: number;
  region?: string;
  residenceNeedsMap?: Map<string, any>;
  existingBuildings?: number;
  residentsPerNeed?: Record<string, number>;
}


export interface WorkforceConfig extends NamedElementConfig {
  demands?: any[];
}

export interface RegionConfig extends NamedElementConfig {
  islands?: string[];
}

export interface SessionConfig extends NamedElementConfig {
  islands?: string[];
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

// Asset map type
export type AssetsMap = Map<string, any>;

// Core game interfaces with comprehensive property definitions
export interface PopulationLevel {
  guid: string;
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
  guid: string;
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
  guid: string;
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

export interface Factory {
  guid: string;
  name: string;
  available(): boolean;
  outputAmount?: () => number; // Make optional to match FactoryExtended
  region: any;
  add(demand: any): void;
  remove(demand: any): void;
  getOutputs(): any[];
  items: any[];
  extraGoodProductionList: ExtraGoodProductionList;
  clipped?: KnockoutObservable<boolean>;
  inputAmount(): number;
  demands(): any[];
  island: any;
  getRegionExtendedName(): string;
  percentBoost?: KnockoutObservable<number>;
  palaceBuffChecked?: KnockoutObservable<boolean>;
  setBuffChecked?: KnockoutObservable<boolean>;
  moduleChecked?: KnockoutObservable<boolean>;
  fertilizerModuleChecked?: KnockoutObservable<boolean>;
  existingBuildings: KnockoutObservable<number>;
  buildings(): number;
  visible(): boolean;
  inputDemands(): any[];
  outputDemands(): any[];
  editable?: (value?: boolean) => boolean;
  [key: string]: any; // Allow dynamic properties
}

export interface Consumer extends Factory {
  // Consumer-specific properties
  workforceDemand?: any;
  percentBoost?: KnockoutObservable<number>;
  existingBuildings: KnockoutObservable<number>;
  [key: string]: any; // Allow dynamic properties
}

export interface Product {
  guid: string;
  name: string;
  available(): boolean;
  addNeed(need: any): void;
  factories: Factory[];
  mainFactory?: Factory;
  fixedFactory?: KnockoutObservable<Factory>;
  [key: string]: any; // Allow dynamic properties
}

export interface NoFactoryProduct extends Product {
  residentsInputFactor: number;
  needs: KnockoutObservableArray<any>;
  amount: KnockoutComputed<number>;
  residentsInput: KnockoutComputed<number>;
  visible(): boolean; // Method version
  [key: string]: any; // Allow dynamic properties
}

export interface MetaProduct extends Product {
  guid: string;
  [key: string]: any; // Allow dynamic properties
}

export interface Item {
  guid: string;
  name(): string;
  icon?: string;
  locaText?: Record<string, string>;
  factories: Factory[];
  replacements?: Map<string, string>;
  replacementArray?: any[];
  replacingWorkforce?: any;
  additionalOutputs?: any[];
  equipments: any[];
  checked: KnockoutComputed<boolean>;
  visible(): boolean; // Method version
  notes?: KnockoutObservable<string>;
  [key: string]: any; // Allow dynamic properties
}

export interface ExtraGoodProductionList {
  factory: Factory;
  checked: KnockoutObservable<boolean>;
  selfEffecting: KnockoutObservableArray<any>;
  entries: KnockoutObservableArray<any>;
  nonZero: KnockoutComputed<any[]>;
  amount: KnockoutComputed<number>;
  amountWithSelf: KnockoutComputed<number>;
  [key: string]: any; // Allow dynamic properties
}

export interface Region {
  guid: string;
  name: string;
  icon?: string;
  [key: string]: any; // Allow dynamic properties
}

export interface Island {
  guid: string;
  name: KnockoutObservable<string>;
  region: Region;
  assetsMap: Map<string, any>;
  session: Session;
  isAllIslands(): boolean;
  deleteIsland(island: Island): void;
  [key: string]: any; // Allow dynamic properties
}

export interface Session {
  deleteIsland(island: Island): void;
  available(): boolean;
  [key: string]: any; // Allow dynamic properties
}

export interface IslandManager {
  params: any;
  serverNamesMap: Map<string, Island>;
  islandCandidates: KnockoutObservableArray<IslandCandidate>;
  unusedNames: Set<string>;
  allIslands: Island;
  compareNames(name1: string, name2: string): number;
  getIsland(name: string): Island | null;
  createIsland(name: string | null, session: Session): Island;
  deleteIsland(name: string): void;
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
  guid: string;
  name: KnockoutObservable<string>;
  [key: string]: any; // Allow dynamic properties for assignment
}

export interface PowerPlant {
  visible(): boolean;
  guid: string;
  name: string;
  [key: string]: any; // Allow dynamic properties
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
export const ALL_ISLANDS = "All Islands";

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
  guid: string;
  name: string;
  visible(): boolean; // Method version
  [key: string]: any; // Allow dynamic properties
} 