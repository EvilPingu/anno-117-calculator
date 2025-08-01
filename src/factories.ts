import { createIntInput, NamedElement, dummyComputed, dummyObservable } from './util';
import { Workforce, WorkforceDemand } from './population';
import { ExtraGoodProductionList, Demand } from './production';
import { TradeList } from './trade';
import { 
    ConsumerConfig, 
    BuffConfig,
    KnockoutObservable,
    KnockoutComputed,
    KnockoutObservableArray,
    AssetsMap
} from './types';

const ko = require("knockout");

/**
 * Base class for all consumers in the game
 * Represents buildings that consume goods and require workforce
 */
export class Consumer extends NamedElement {
    public isFactory: boolean;
    public inputs: any[];
    public maintenances: any[];
    public tpmin: number;
    public forceRegionExtendedName: boolean;
    public island: any;
    public region: any;
    public items: any[];
    public inputDemandsMap: Map<string, any>;
    public inputDemands: KnockoutObservableArray<any>;
    public workforceDemand: any;
    public boost: KnockoutObservable<number>;
    public editable: KnockoutObservable<boolean>;
    public existingBuildings: KnockoutObservable<number>;
    public useinputAmountByExistingBuildings: KnockoutObservable<boolean>;
    public inputAmountByOutput: KnockoutObservable<number>;
    public inputAmountByExistingBuildings: KnockoutComputed<number>;
    public inputAmount: KnockoutComputed<number>;
    public buildings: KnockoutComputed<number>;
    public availableItems: KnockoutComputed<any[]>;
    public inputDemandsSubscription: KnockoutComputed<void>;
    public workforceDemandSubscription?: KnockoutComputed<void>;
    public product?: any;
    public icon?: string;
    public percentBoost?: KnockoutObservable<number>; // Added for dynamic assignment

    /**
     * Creates a new Consumer instance
     * @param config - Configuration object for the consumer
     * @param assetsMap - Map of all available assets
     * @param island - The island this consumer belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: any) {
        // Validate required parameters
        if (!config) {
            throw new Error('Consumer config is required');
        }
        if (!assetsMap) {
            throw new Error('Consumer assetsMap is required');
        }
        if (!island) {
            throw new Error('Consumer island is required');
        }

        super(config);
        
        // Explicit assignments
        this.isFactory = false;
        this.inputs = config.inputs || [];
        this.maintenances = config.maintenances || [];
        this.tpmin = config.tpmin || 0;
        this.forceRegionExtendedName = config.forceRegionExtendedName || false;
        this.island = island;
        this.region = config.region ? assetsMap.get(config.region) : null;
        this.items = [];
        this.inputDemandsMap = new Map();
        this.inputDemands = ko.observableArray([]);
        this.workforceDemand = null;
        this.boost = ko.observable(1);
        this.editable = ko.observable(false);
        this.existingBuildings = createIntInput(0, 0).extend({ deferred: true });
        this.lockDLCIfSet(this.existingBuildings);
        this.useinputAmountByExistingBuildings = ko.observable(true);
        this.inputAmountByOutput = ko.observable(0);

        // Set up computed observables
        this.inputAmountByExistingBuildings = ko.computed(() => {
            return this.existingBuildings() * this.boost() * this.tpmin;
        });

        this.inputAmount = ko.pureComputed(() => {
            let amount = this.inputAmountByOutput();
            if (this.useinputAmountByExistingBuildings()) {
                amount = Math.max(amount, this.inputAmountByExistingBuildings());
            }
            return amount;
        });

        this.buildings = ko.computed(() => this.inputAmount() / this.tpmin / this.boost()).extend({ deferred: true });
        this.lockDLCIfSet(this.buildings);
        
        this.notes = ko.observable("");

        // Dummy assignments for late-initialized properties
        this.availableItems = dummyComputed<any[]>('Consumer.availableItems');
        this.inputDemandsSubscription = dummyComputed<void>('Consumer.inputDemandsSubscription');
    }

    /**
     * Gets the input requirements for this consumer
     * @returns Array of input requirements
     */
    getInputs(): any[] {
        return this.inputs || [];
    }

    /**
     * References products and sets up input demands
     * @param assetsMap - Map of all available assets
     */
    referenceProducts(assetsMap: AssetsMap): void {
        if (this.inputs) {
            this.inputs.forEach(i => i.product = assetsMap.get(i.Product));
        }
        this.availableItems = ko.pureComputed(() => this.items.filter(i => i.available()));

        this.inputDemandsSubscription = ko.computed(() => {
            if (!this.inputs) {
                return;
            }

            const amount = this.inputAmount();

            const inputs = new Map();
            this.inputs.forEach(i => { inputs.set(i.Product, i.Amount); });
            const items = this.items.filter(item => item.replacements && item.checked()).sort((a, b) => a.item.guid - b.item.guid);
            
            for (const item of items) {
                for (const replacement of item.replacements) {
                    if (inputs.has(replacement[0])) {
                        const factor = inputs.get(replacement[0]);
                        inputs.delete(replacement[0]);
                        if (replacement[1]) {
                            inputs.set(replacement[1], factor);
                        }
                    }
                }
            }

            const map = new Map();
            const demands = [];
            for (const guid of inputs.keys()) {
                const p = assetsMap.get(guid);

                if (p.isAbstract) {
                    continue;
                }

                let d = this.inputDemandsMap.get(guid);
                if (d) {
                    map.set(guid, d);
                    demands.push(d);
                    this.inputDemandsMap.delete(guid);
                    d.updateAmount(amount);
                } else {
                    d = new Demand({
                        guid: guid,
                        consumer: this,
                        factor: inputs.get(guid),
                    }, assetsMap);
                    d.updateAmount(amount);
                    demands.push(d);
                    map.set(guid, d);
                }
            }

            for (const d of this.inputDemandsMap.values()) {
                d.factory().remove(d);
            }

            this.inputDemandsMap = map;
            this.inputDemands.removeAll();
            for (const d of demands) this.inputDemands.push(d);
        });
    }

    /**
     * Creates workforce demand for this consumer
     * @param assetsMap - Map of all available assets
     * @returns The created workforce demand or null
     */
    createWorkforceDemand(assetsMap: AssetsMap): any {
        for (const m of this.maintenances || []) {
            const a = assetsMap.get(m.Product);
            if (a instanceof Workforce) {
                this.workforceDemand = new WorkforceDemand(
                    this, 
                    a,
                    m.Amount || 0,
                    m.percentBoost || 100
                );

                this.workforceDemandSubscription = ko.computed(() => {
                    // for workforce replacement, the last applied item matters
                    const items = this.items.filter(item => item.replacingWorkforce && item.replacingWorkforce != a && item.checked()).sort((a, b) => b.item.guid - a.item.guid);
                    if (items.length) {
                        this.workforceDemand.updateWorkforce(items[0].replacingWorkforce);
                    } else {
                        this.workforceDemand.updateWorkforce(null);
                    }
                });
                this.buildings.subscribe(() => this.workforceDemand.updateAmount(this.buildings()));
            }
        }
        return null;
    }

    /**
     * Gets the extended name including region information
     * @returns The extended name
     */
    getRegionExtendedName(): string {
        if (!this.forceRegionExtendedName && (!this.region || !this.product || this.product.factories.length <= 1)) {
            return this.name();
        }

        return `${this.name()} (${this.region.name()})`;
    }

    /**
     * Gets the icon for this consumer
     * @returns The icon path
     */
    getIcon(): string {
        return this.icon || '';
    }

    /**
     * Updates the amount for this consumer
     */
    updateAmount(): void {
        // Implementation will be added when needed
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally(): void {
        for (const isl of (window as any).view.islands()) {
            if (this.region && isl.region && this.region != isl.region) {
                continue;
            }

            const other = isl.assetsMap.get(this.guid);
            if (other) {
                other.existingBuildings(this.existingBuildings());
                other.boost(this.boost());
            }
        }
    }
}

/**
 * Represents a module that can be attached to factories
 */
export class Module extends Consumer {
    /**
     * Creates a new Module instance
     * @param config - Configuration object for the module
     * @param assetsMap - Map of all available assets
     * @param island - The island this module belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: any) {
        super(config, assetsMap, island);
        
        // Module-specific initialization
        this.isFactory = false;
    }
}

/**
 * Represents a public consumer building
 */
export class PublicConsumerBuilding extends Consumer {
    public product: any;
    public fixedFactory: KnockoutObservable<any>;
    public fixedFactorySubscription: KnockoutComputed<void>;
    public goodConsumptionUpgrade?: any; // Added for dynamic assignment
    public recipeName?: KnockoutComputed<string>; // Added for dynamic assignment

    /**
     * Creates a new PublicConsumerBuilding instance
     * @param config - Configuration object for the building
     * @param assetsMap - Map of all available assets
     * @param island - The island this building belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: any) {
        super(config, assetsMap, island);
        
        // Explicit assignments
        this.product = config.product ? assetsMap.get(config.product) : null;
        this.fixedFactory = ko.observable(null);
        
        this.fixedFactorySubscription = ko.computed(() => {
            if (this.fixedFactory()) {
                this.fixedFactory().fixedFactory(this);
            }
        });
    }

    /**
     * Checks if this public consumer building is visible
     * @returns True if the building is visible
     */
    visible(): boolean {
        return this.available();
    }
}

/**
 * Represents a power plant
 */
export class PowerPlant extends PublicConsumerBuilding {
    /**
     * Creates a new PowerPlant instance
     * @param config - Configuration object for the power plant
     * @param assetsMap - Map of all available assets
     * @param island - The island this power plant belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: any) {
        super(config, assetsMap, island);
        
        // Power plant specific initialization
    }

    /**
     * Checks if this power plant is visible
     * @returns True if the power plant is visible
     */
    visible(): boolean {
        return this.available();
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally(): void {
        for (const isl of (window as any).view.islands()) {
            if (this.region && isl.region && this.region != isl.region) {
                continue;
            }

            const other = isl.assetsMap.get(this.guid);
            if (other) {
                other.existingBuildings(this.existingBuildings());
                other.boost(this.boost());
                other.fixedFactory(this.fixedFactory());
            }
        }
    }
}

/**
 * Represents a buff that can be applied to factories
 */
export class Buff extends NamedElement {
    public additionalOutputCycle: number;
    public amount: number;
    public factory: any;
    public product: any;

    /**
     * Creates a new Buff instance
     * @param config - Configuration object for the buff
     * @param assetsMap - Map of all available assets
     */
    constructor(config: BuffConfig, assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config) {
            throw new Error('Buff config is required');
        }
        if (!assetsMap) {
            throw new Error('Buff assetsMap is required');
        }

        super(config);
        
        // Explicit assignments
        this.additionalOutputCycle = config.additionalOutputCycle || 0;
        this.amount = config.amount || 0;
        this.factory = config.factory ? assetsMap.get(config.factory) : null;
        this.product = config.product ? assetsMap.get(config.product) : null;
    }
}

/**
 * Represents a factory that produces goods
 */
export class Factory extends Consumer {
    public product: any;
    public outputs: any[];
    public outputDemands: KnockoutObservableArray<any>;
    public outputDemandsMap: Map<string, any>;
    public fixedFactory: KnockoutObservable<any>;
    public fixedFactorySubscription: KnockoutComputed<void>;
    public extraGoodProductionList: any;
    public tradeList: any;
    public extraGoodProductionHistory: [number, Date][]; // Added from JS
    public extraGoodProductionAmount: KnockoutComputed<number>; // Added from JS
    public totalDemands: KnockoutComputed<number>; // Added from JS
    public externalProduction: KnockoutComputed<number>; // Added from JS
    public inputAmountByExtraGoods: KnockoutObservable<number>; // Added from JS
    public percentBoost: KnockoutObservable<number>; // Already present, ensure correct type
    public module?: any; // Added from JS
    public moduleChecked?: KnockoutObservable<boolean>; // Added from JS
    public moduleExtraGoods?: KnockoutComputed<number>; // Added from JS
    public fertilizerModule?: any; // Added from JS
    public fertilizerModuleChecked?: KnockoutObservable<boolean>; // Added from JS
    public fertilizerModuleExtraGoods?: KnockoutComputed<number>; // Added from JS
    public palaceBuff?: any; // Added from JS
    public palaceBuffChecked?: KnockoutObservable<boolean>; // Already present, ensure correct type
    public palaceBuffExtraGoods?: KnockoutComputed<number>; // Added from JS
    public setBuff?: any; // Added from JS
    public setBuffChecked?: KnockoutObservable<boolean>; // Already present, ensure correct type
    public setBuffExtraGoods?: KnockoutComputed<number>; // Added from JS
    public extraGoodFactor: KnockoutComputed<number>; // Added from JS
    public overProduction: KnockoutComputed<number>; // Added from JS
    public extraGoodsDisplayAmount?: KnockoutComputed<number>; // Added from JS
    public visible: KnockoutComputed<boolean>; // Added from JS
    public requiredInputAmountSubscription?: KnockoutComputed<void>; // Added from JS
    public useInputAmountByExistingBuildingsSubscription?: KnockoutComputed<void>; // Added from JS

    /**
     * Creates a new Factory instance
     * @param config - Configuration object for the factory
     * @param assetsMap - Map of all available assets
     * @param island - The island this factory belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: any) {
        super(config, assetsMap, island);
        this.isFactory = true;
        this.product = config.product ? assetsMap.get(config.product) : null;
        this.outputs = config.outputs || [];
        this.outputDemands = ko.observableArray([]);
        this.outputDemandsMap = new Map();
        this.fixedFactory = ko.observable(null);
        this.fixedFactorySubscription = dummyComputed<void>('Factory.fixedFactorySubscription');
        this.extraGoodProductionList = dummyObservable<any>('Factory.extraGoodProductionList');
        this.tradeList = dummyObservable<any>('Factory.tradeList');
        this.extraGoodProductionHistory = [];
        this.extraGoodProductionAmount = dummyComputed<number>('Factory.extraGoodProductionAmount');
        this.totalDemands = dummyComputed<number>('Factory.totalDemands');
        this.externalProduction = dummyComputed<number>('Factory.externalProduction');
        this.inputAmountByExtraGoods = ko.observable(0);
        this.percentBoost = createIntInput(100, 1);
        this.module = null;
        this.moduleChecked = ko.observable(false);
        this.moduleExtraGoods = dummyComputed<number>('Factory.moduleExtraGoods');
        this.fertilizerModule = null;
        this.fertilizerModuleChecked = ko.observable(false);
        this.fertilizerModuleExtraGoods = dummyComputed<number>('Factory.fertilizerModuleExtraGoods');
        this.palaceBuff = null;
        this.palaceBuffChecked = ko.observable(false);
        this.palaceBuffExtraGoods = dummyComputed<number>('Factory.palaceBuffExtraGoods');
        this.setBuff = null;
        this.setBuffChecked = ko.observable(false);
        this.setBuffExtraGoods = dummyComputed<number>('Factory.setBuffExtraGoods');
        this.extraGoodFactor = dummyComputed<number>('Factory.extraGoodFactor');
        this.overProduction = dummyComputed<number>('Factory.overProduction');
        this.extraGoodsDisplayAmount = dummyComputed<number>('Factory.extraGoodsDisplayAmount');
        this.visible = dummyComputed<boolean>('Factory.visible');
        this.requiredInputAmountSubscription = dummyComputed<void>('Factory.requiredInputAmountSubscription');
        this.useInputAmountByExistingBuildingsSubscription = dummyComputed<void>('Factory.useInputAmountByExistingBuildingsSubscription');
    }

    /**
     * Gets the outputs for this factory
     * @returns Array of outputs
     */
    getOutputs(): any[] {
        return this.outputs || [];
    }

    /**
     * References products and sets up output demands
     * @param assetsMap - Map of all available assets
     */
    referenceProducts(assetsMap: AssetsMap): void {
        super.referenceProducts(assetsMap);
        
        if (this.outputs) {
            this.outputs.forEach(o => o.product = assetsMap.get(o.Product));
        }
    }

    /**
     * Gets the main product of this factory
     * @returns The main product
     */
    getProduct(): any {
        return this.product;
    }

    /**
     * Gets the icon for this factory
     * @returns The icon path
     */
    getIcon(): string {
        return this.product ? this.product.icon : (this.icon || '');
    }

    /**
     * Increments the number of buildings
     */
    incrementBuildings(): void {
        this.existingBuildings(this.existingBuildings() + 1);
    }

    /**
     * Decrements the number of buildings
     */
    decrementBuildings(): void {
        this.existingBuildings(Math.max(0, this.existingBuildings() - 1));
    }

    /**
     * Increments the percent boost
     */
    incrementPercentBoost(): void {
        this.boost(this.boost() + 10);
    }

    /**
     * Decrements the percent boost
     */
    decrementPercentBoost(): void {
        this.boost(Math.max(0, this.boost() - 10));
    }

    /**
     * Adds a demand to this factory
     * @param demand - The demand to add
     */
    add(demand: any): void {
        this.outputDemands.push(demand);
    }

    /**
     * Removes a demand from this factory
     * @param demand - The demand to remove
     */
    remove(demand: any): void {
        this.outputDemands.remove(demand);
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally(): void {
        for (const isl of (window as any).view.islands()) {
            if (this.region && isl.region && this.region != isl.region) {
                continue;
            }

            const other = isl.assetsMap.get(this.guid);
            if (other) {
                other.existingBuildings(this.existingBuildings());
                other.boost(this.boost());
                other.fixedFactory(this.fixedFactory());
            }
        }
    }

    // Stub methods to satisfy TradeList and ExtraGoodProductionList type requirements
    substitutableOutputAmount(): number {
        return 0;
    }
    outputAmount(): number {
        return 0;
    }
} 