import { createIntInput, NamedElement, ACCURACY, EPSILON, ko } from './util';
import { Workforce, WorkforceDemand } from './population';
import { Demand, ExtraGoodProductionList } from './production';
import { TradeList } from './trade';
import { 
    ConsumerConfig, 
    BuffConfig,
    AssetsMap,
    Output,
    Module as ModuleInterface,
    Buff as BuffInterface,
    Island,
    Region,
    Item,
    Product
} from './types';


/**
 * Base class for all consumers in the game
 * Represents buildings that consume goods and require workforce
 */
export class Consumer extends NamedElement {
    public isFactory: boolean;
    public inputs: { Product: string; Amount: number }[];
    public maintenances: { Product: string; Amount: number; percentBoost?: number }[];
    public tpmin: number;
    public forceRegionExtendedName: boolean;
    public island: Island;
    public region: Region | null;
    public items: Item[];
    public inputDemandsMap: Map<string, Demand>;
    public inputDemands: KnockoutObservableArray<Demand>;
    public workforceDemand: WorkforceDemand | null;
    public boost: KnockoutObservable<number>;
    public editable: KnockoutObservable<boolean>;
    public existingBuildings: KnockoutObservable<number>;
    public useinputAmountByExistingBuildings: KnockoutObservable<boolean>;
    public inputAmountByOutput: KnockoutObservable<number>;
    public inputAmountByExistingBuildings: KnockoutComputed<number>;
    public inputAmount: KnockoutComputed<number>;
    public buildings: KnockoutComputed<number>;
    public availableItems!: KnockoutComputed<Item[]>;
    public inputDemandsSubscription!: KnockoutComputed<void>;
    public workforceDemandSubscription?: KnockoutComputed<void>;
    public product!: Product | null;
    public icon?: string;
    public percentBoost?: KnockoutObservable<number>; // Added for dynamic assignment

    /**
     * Creates a new Consumer instance
     * @param config - Configuration object for the consumer
     * @param assetsMap - Map of all available assets
     * @param island - The island this consumer belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: Island) {
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
        this.region = config.region ? assetsMap.get(parseInt(config.region)) : null;
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

        // availableItems and inputDemandsSubscription are initialized in referenceProducts()
    }

    /**
     * Gets the input requirements for this consumer
     * @returns Array of input requirements
     */
    getInputs(): { Product: string; Amount?: number }[] {
        return this.inputs || [];
    }

    /**
     * References products and sets up input demands
     * @param assetsMap - Map of all available assets
     */
    referenceProducts(assetsMap: AssetsMap): void {
        if (this.inputs) {
            this.inputs.forEach((i: any) => i.product = assetsMap.get(parseInt(i.Product)));
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
                for (const replacement of item.replacements || []) {
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
                const p = assetsMap.get(parseInt(guid));

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
    createWorkforceDemand(assetsMap: AssetsMap): WorkforceDemand | null {
        for (const m of this.maintenances || []) {
            const a = assetsMap.get(parseInt(m.Product));
            if (a instanceof Workforce) {
                this.workforceDemand = new WorkforceDemand(
                    this, 
                    a,
                    m.Amount || 0,
                    m.percentBoost || 100
                );

                this.workforceDemandSubscription = ko.computed(() => {
                    // for workforce replacement, the last applied item matters
                    const items = this.items.filter(item => item.replacingWorkforce && (item.replacingWorkforce as any) != (a as any) && item.checked()).sort((a, b) => b.item.guid - a.item.guid);
                    if (items.length && this.workforceDemand) {
                        this.workforceDemand.updateWorkforce(items[0].replacingWorkforce);
                    } else if (this.workforceDemand) {
                        this.workforceDemand.updateWorkforce(null);
                    }
                });
                if (this.workforceDemand) {
                    this.buildings.subscribe(() => this.workforceDemand!.updateAmount(this.buildings()));
                }
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

        return `${this.name()} (${this.region?.name() || 'Unknown Region'})`;
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
export class Module extends Consumer implements ModuleInterface {
    public additionalOutputCycle: number;
    public productivityUpgrade: number;
    public workforceAmountUpgrade?: { Value: number } | undefined;
    public tpmin: number;
    public checked: KnockoutObservable<boolean>;
    public visible: KnockoutComputed<boolean>;
    
    /**
     * Creates a new Module instance
     * @param config - Configuration object for the module
     * @param assetsMap - Map of all available assets
     * @param island - The island this module belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: Island) {
        super(config, assetsMap, island);
        
        // Module-specific initialization
        this.additionalOutputCycle = config.additionalOutputCycle || 0;
        this.productivityUpgrade = config.productivityUpgrade || 0;
        this.workforceAmountUpgrade = config.workforceAmountUpgrade;
        this.tpmin = config.tpmin || 0;

        // Module-specific initialization
        this.isFactory = false;

        this.checked = ko.observable(false);
        this.lockDLCIfSet(this.checked);
        this.visible = ko.pureComputed(() => !!config && this.available());
    }
    
    getInputs(): { Product: string; Amount?: number }[] {
        return this.inputs || [];
    }
}

/**
 * Represents a public consumer building
 */
export class PublicConsumerBuilding extends Consumer {
    public product: Product | null;
    public fixedFactory: KnockoutObservable<Factory | null>;
    public fixedFactorySubscription: KnockoutComputed<void>;
    public goodConsumptionUpgrade?: Product; // Added for dynamic assignment
    public recipeName?: KnockoutComputed<string>; // Added for dynamic assignment

    /**
     * Creates a new PublicConsumerBuilding instance
     * @param config - Configuration object for the building
     * @param assetsMap - Map of all available assets
     * @param island - The island this building belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: Island) {
        super(config, assetsMap, island);

        // Explicit assignments
        this.product = config.product ? assetsMap.get(parseInt(config.product)) : null;
        this.fixedFactory = ko.observable(null);
        
        this.fixedFactorySubscription = ko.computed(() => {
            if (this.fixedFactory()) {
                const factory = this.fixedFactory() as any;
                if (factory && typeof factory.fixedFactory === 'function') {
                    factory.fixedFactory(this);
                } else if (factory && factory.fixedFactory) {
                    factory.fixedFactory(this);
                }
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
 * Represents a buff that can be applied to factories
 */
export class Buff extends NamedElement implements BuffInterface {
    public additionalOutputCycle: number;
    public amount: number;
    public factory: Factory | null;
    public product: Product | null;
    public visible: KnockoutComputed<boolean>;

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
        this.factory = config.factory ? assetsMap.get(parseInt(config.factory)) : null;
        this.product = config.product ? assetsMap.get(parseInt(config.product)) : null;

        this.visible = ko.pureComputed(() => this.available());
    }
}

/**
 * Represents a factory that produces goods
 * Extends Consumer to provide factory-specific functionality
 */
export class Factory extends Consumer {
    public isFactory: boolean;
    public canClip: boolean;
    public outputs: Output[];
    public demands: KnockoutObservableArray<Demand>;
    public tradeList: TradeList;
    public extraGoodProductionList: ExtraGoodProductionList;
    public extraGoodProductionHistory: [number, Date][];
    public extraGoodProductionAmount: KnockoutComputed<number>;
    public totalDemands: KnockoutComputed<number>;
    public externalProduction: KnockoutComputed<number>;
    public inputAmountByExtraGoods: KnockoutObservable<number>;
    public inputAmount: KnockoutComputed<number>;
    public module?: Module;
    public moduleChecked?: KnockoutObservable<boolean>;
    public moduleExtraGoods?: KnockoutComputed<number>;
    public moduleDemand?: Demand;
    public fertilizerModule?: Module;
    public fertilizerModuleChecked?: KnockoutObservable<boolean>;
    public fertilizerModuleExtraGoods?: KnockoutComputed<number>;
    public fertilizerModuleDemand?: Demand;
    public palaceBuff?: Buff;
    public palaceBuffChecked?: KnockoutObservable<boolean>;
    public palaceBuffExtraGoods?: KnockoutComputed<number>;
    public setBuff?: Buff;
    public setBuffChecked?: KnockoutObservable<boolean>;
    public setBuffExtraGoods?: KnockoutComputed<number>;
    public extraGoodFactor: KnockoutComputed<number>;
    public outputAmount: KnockoutComputed<number>;
    public substitutableOutputAmount: KnockoutComputed<number>;
    public isHighlightedAsMissing: KnockoutComputed<boolean>;
    public requiredInputAmountSubscription?: KnockoutComputed<void>;
    public useInputAmountByExistingBuildingsSubscription?: KnockoutComputed<void>;
    public overProduction: KnockoutComputed<number>;
    public extraGoodsDisplayAmount?: KnockoutComputed<number>;
    public visible: KnockoutComputed<boolean>;
    public buildingSubscription?: KnockoutComputed<void>;

    /**
     * Creates a new Factory instance
     * @param config - Configuration object for the factory
     * @param assetsMap - Map of all available assets
     * @param island - The island this factory belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, island: Island) {
        super(config, assetsMap, island);
        
        // Explicit assignments
        this.isFactory = true;
        this.canClip = config.canClip || false;
        this.outputs = config.outputs || [];
        this.demands = ko.observableArray([]);

        this.tradeList = new TradeList(island, this);

        this.extraGoodProductionList = new ExtraGoodProductionList(this as any);

        // use the history to break the cycle: extra good (lumberjack) -> building materials need (timber) -> production (sawmill) -> production (lumberjack)
        // that cycles between two values by adding a damper
        // [[prev val, timestamp], [prev prev val, timestamp]]
        this.extraGoodProductionHistory = [];
        this.extraGoodProductionAmount = ko.pureComputed(() => {
            const val = this.extraGoodProductionList.checked() ? this.extraGoodProductionList.amount() : 0;

            if (this.extraGoodProductionHistory.length && Math.abs(val - this.extraGoodProductionHistory[0][0]) < ACCURACY)
                return this.extraGoodProductionHistory[0][0];

            const time = new Date();

            if (this.extraGoodProductionHistory.length >= 2) {
                // after initialization, we have this.extraGoodProductionHistory = [val, 0]
                // when the user manually sets it to 0, the wrong value is propagated
                // restrict to cycles triggered by automatic updates, i.e. update interval < 200 ms
                if (Math.abs(this.extraGoodProductionHistory[1][0] - val) < ACCURACY && this.extraGoodProductionHistory[1][0] !== 0 && time.getTime() - this.extraGoodProductionHistory[1][1].getTime() < 200)
                    return (val + this.extraGoodProductionHistory[0][0]) / 2;
            }

            this.extraGoodProductionHistory.unshift([val, time]);
            if (this.extraGoodProductionHistory.length > 2)
                this.extraGoodProductionHistory.pop();
            return val;
        });

        this.totalDemands = ko.pureComputed(() => {
            let sum = 0;
            this.demands().forEach((d: Demand) => {
                sum += d.amount();
            });

            sum += this.tradeList.inputAmount();

            return sum;
        });

        this.externalProduction = ko.pureComputed(() => {
            let sum = 0;

            sum += this.tradeList.outputAmount();
            sum += this.extraGoodProductionAmount();

            return sum;
        });

        this.inputAmountByExtraGoods = ko.observable(0);

        this.percentBoost = createIntInput(100, 1);
        this.percentBoost.subscribe(() => {
            if (this.percentBoost)
                this.boost(this.percentBoost() / 100);
        });

        if (config.module) {
            this.module = assetsMap.get(parseInt(config.module));
            this.moduleChecked = ko.observable(false);
            if (this.module && this.module.lockDLCIfSet && this.moduleChecked) {
                this.module.lockDLCIfSet(this.moduleChecked);
                const workforceUpgrade = this.module.workforceAmountUpgrade ? this.module.workforceAmountUpgrade.Value : 0;
                this.moduleChecked.subscribe(() => {
                    const checked = this.moduleChecked && this.moduleChecked();
                    if (checked) {
                        if (this.percentBoost)
                            this.percentBoost(parseInt(this.percentBoost() as any) + this.module!.productivityUpgrade);
                        if (this.workforceDemand)
                            this.workforceDemand.percentBoost(this.workforceDemand.percentBoost() + workforceUpgrade);
                    } else {
                        if (this.percentBoost) {
                            const val = Math.max(1, parseInt(this.percentBoost() as any) - this.module!.productivityUpgrade);
                            this.percentBoost(val);
                        }

                        if (this.workforceDemand)
                            this.workforceDemand.percentBoost(Math.max(0, this.workforceDemand.percentBoost() - workforceUpgrade));
                    }
                });
                this.moduleExtraGoods = ko.pureComputed(() => this.moduleChecked && this.moduleChecked() ? this.inputAmount() / this.module!.additionalOutputCycle : 0);
            }
        }

        if (config.fertilizerModule) {
            this.fertilizerModule = assetsMap.get(parseInt(config.fertilizerModule));
            this.fertilizerModuleChecked = ko.observable(false);
            if (this.fertilizerModule && this.fertilizerModule.lockDLCIfSet && this.fertilizerModuleChecked) {
                this.fertilizerModule.lockDLCIfSet(this.fertilizerModuleChecked);
                this.fertilizerModuleChecked.subscribe(() => {
                    const checked = this.fertilizerModuleChecked && this.fertilizerModuleChecked();
                    if (checked) {
                        if (this.percentBoost)
                            this.percentBoost(parseInt(this.percentBoost() as any) + this.fertilizerModule!.productivityUpgrade);
                    } else {
                        if (this.percentBoost) {
                            const val = Math.max(1, parseInt(this.percentBoost() as any) - this.fertilizerModule!.productivityUpgrade);
                            this.percentBoost(val);
                        }
                    }
                });
                this.fertilizerModuleExtraGoods = ko.pureComputed(() => this.fertilizerModuleChecked && this.fertilizerModuleChecked() ? this.inputAmount() / this.fertilizerModule!.additionalOutputCycle : 0);
            }
        }

        if (config.palaceBuff) {
            this.palaceBuff = assetsMap.get(parseInt(config.palaceBuff));
            this.palaceBuffChecked = ko.observable(false);
            if (this.palaceBuff && this.palaceBuffChecked) {
                this.palaceBuff.lockDLCIfSet(this.palaceBuffChecked);

                this.palaceBuffExtraGoods = ko.pureComputed(() => {
                    if (!this.palaceBuffChecked || !this.palaceBuffChecked())
                        return 0;
                    return this.inputAmount() / this.palaceBuff!.additionalOutputCycle;
                });
            }
        }

        if (config.setBuff) {
            this.setBuff = assetsMap.get(parseInt(config.setBuff));
            this.setBuffChecked = ko.observable(false);
            if (this.setBuff && this.setBuffChecked) {
                this.setBuff.lockDLCIfSet(this.setBuffChecked);

                this.setBuffExtraGoods = ko.pureComputed(() => {
                    if (!this.setBuffChecked || !this.setBuffChecked())
                        return 0;
                    return this.inputAmount() / this.setBuff!.additionalOutputCycle;
                });
            }
        }

        this.extraGoodFactor = ko.computed(() => {
            let factor = 1;

            for (const m of ["module", "fertilizerModule"]) {
                const module = (this as any)[m];
                const checked = (this as any)[m + "Checked"];

                if (module && checked && checked() && module.additionalOutputCycle)
                    factor += 1 / module.additionalOutputCycle;
            }

            if (this.palaceBuff && this.palaceBuffChecked && this.palaceBuffChecked())
                factor += 1 / this.palaceBuff.additionalOutputCycle;

            if (this.setBuff && this.setBuffChecked && this.setBuffChecked())
                factor += 1 / this.setBuff.additionalOutputCycle;

            if (this.extraGoodProductionList && this.extraGoodProductionList.selfEffecting && this.extraGoodProductionList.checked())
                for (const e of this.extraGoodProductionList.selfEffecting())
                    if (e.item.checked())
                        factor += (e.Amount || 1) / e.additionalOutputCycle;

            return factor;
        });

        this.outputAmount = ko.pureComputed(() => {
            const diff = Math.max(this.inputAmountByExtraGoods() * this.extraGoodFactor(), 
                this.totalDemands() - this.externalProduction(),
                this.useinputAmountByExistingBuildings && this.useinputAmountByExistingBuildings() ? this.inputAmountByExistingBuildings() * this.extraGoodFactor() : 0);
            return diff > EPSILON ? diff : 0;
        });

        this.substitutableOutputAmount = ko.pureComputed(() => Math.max(0, this.totalDemands() - this.externalProduction() - Math.max(this.inputAmountByExtraGoods(), this.inputAmountByExistingBuildings ? this.inputAmountByExistingBuildings() : 0) * this.extraGoodFactor()));
        
        this.isHighlightedAsMissing = ko.pureComputed(() => {
            if (!(window as any).view.settings.missingBuildingsHighlight || !(window as any).view.settings.missingBuildingsHighlight.checked())
                return false;

            return this.buildings() > this.existingBuildings() + ACCURACY;
        });

        this.requiredInputAmountSubscription = ko.computed(() => {
            this.inputAmountByOutput(this.outputAmount() / this.extraGoodFactor());
        });

        this.useInputAmountByExistingBuildingsSubscription = ko.computed(() => {
            if (this.useinputAmountByExistingBuildings) {
                this.useinputAmountByExistingBuildings(this.editable() || ((window as any).view.settings.utilizeExistingFactories && (window as any).view.settings.utilizeExistingFactories.checked()));
            }
        });
        
        if (this.workforceDemand) {
            this.buildings.subscribe(() => this.workforceDemand!.updateAmount(Math.max(this.buildings(), this.buildings())));
        }

        // Set up inputAmount as a computed property
        this.inputAmount = ko.pureComputed(() => {
            return this.outputAmount() / this.extraGoodFactor();
        });

        this.overProduction = ko.pureComputed(() => Math.max(0, this.inputAmount() * this.extraGoodFactor() + this.externalProduction() - this.totalDemands()));
        
        if (this.extraGoodProductionList) {
            this.extraGoodsDisplayAmount = ko.pureComputed(() => this.extraGoodProductionList.checked() ? this.extraGoodProductionList.nonZero().reduce((a: number, b: any) => a + b.amount(), 0) : 0);
        }

        this.visible = ko.computed(() => {
            if (!this.available())
                return false;

            if (Math.abs(this.inputAmount()) > EPSILON ||
                this.totalDemands() > EPSILON ||
                this.externalProduction() > EPSILON ||
                this.existingBuildings() > 0 ||
                this.extraGoodProductionList.amount() > EPSILON)
                return true;

            if (this.region && this.island.region && this.region != this.island.region)
                return false;

            if ((window as any).view.settings.showAllConstructableFactories && (window as any).view.settings.showAllConstructableFactories.checked())
                return true;

            if (this.editable()) {
                if (this.region && this.island.region)
                    return this.region === this.island.region;

                if (!this.region || this.region.guid === 5000000)
                    return true;

                return false;
            }

            return false;
        });
    }

    /**
     * Gets the output products for this factory
     * @returns Array of output products
     */
    getOutputs(): Output[] {
        return this.outputs || [];
    }

    /**
     * References products and sets up factory-specific relationships
     * @param assetsMap - Map of all available assets
     */
    referenceProducts(assetsMap: AssetsMap): void {
        super.referenceProducts(assetsMap);
        this.getOutputs().forEach((i: Output) => i.product = assetsMap.get(parseInt(i.Product)));

        this.product = this.getProduct();
        if (!this.icon && this.product)
            this.icon = this.product.icon;

        for (const m of ["module", "fertilizerModule"]) {
            const module = (this as any)[m];

            if (module) {
                (this as any)[m + "Demand"] = new (require('./production').Demand)({ 
                    guid: module.getInputs()[0].Product, 
                    consumer: this, 
                    module: module 
                }, assetsMap);
            }
        }

        this.buildingSubscription = ko.computed(() => {
            const b = Math.ceil(this.buildings() - ACCURACY);

            if ((window as any).view.settings.utilizeExistingFactories && (window as any).view.settings.utilizeExistingFactories.checked()) {
                Math.max(b, this.existingBuildings());
            }

            if (this.workforceDemand)
                this.workforceDemand.updateAmount(b);

            for (const m of ["module", "fertilizerModule"]) {
                const module = (this as any)[m];
                const checked = (this as any)[m + "Checked"];
                const demand = (this as any)[m + "Demand"];

                if (module) {
                    if (checked && checked())
                        demand.updateAmount(b * module.tpmin);
                    else
                        demand.updateAmount(0);
                }
            }
        });
    }

    /**
     * Gets the primary product produced by this factory
     * @returns The primary product or null
     */
    getProduct(): Product | null {
        return this.getOutputs()[0] ? this.getOutputs()[0].product || null : null;
    }

    /**
     * Gets the icon for this factory
     * @returns The icon path
     */
    getIcon(): string {
        const product = this.getProduct();
        return product ? product.icon : super.getIcon();
    }

    /**
     * Increments the number of buildings while maintaining productivity
     */
    incrementBuildings(): void {
        if (!this.percentBoost || this.buildings() <= 0 || parseInt(this.percentBoost() as any) <= 1)
            return;

        const minBuildings = Math.ceil(this.buildings() * parseInt(this.percentBoost() as any) / (parseInt(this.percentBoost() as any) - 1));
        const nextBoost = Math.ceil(parseInt(this.percentBoost() as any) * this.buildings() / minBuildings);
        this.percentBoost(Math.min(nextBoost, parseInt(this.percentBoost() as any) - 1));
    }

    /**
     * Decrements the number of buildings while maintaining productivity
     */
    decrementBuildings(): void {
        const currentBuildings = Math.ceil(this.buildings() * 100) / 100;
        let nextBuildings = Math.floor(currentBuildings);
        if (nextBuildings <= 0)
            return;

        if (currentBuildings - nextBuildings < ACCURACY)
            nextBuildings = Math.floor(nextBuildings - ACCURACY);
        const nextBoost = Math.ceil(100 * this.boost() * this.buildings() / nextBuildings);
        if (this.percentBoost) {
            if (nextBoost - parseInt(this.percentBoost() as any) < 1)
                this.percentBoost(parseInt(this.percentBoost() as any) + 1);
            else
                this.percentBoost(nextBoost);
        }
    }

    /**
     * Increments the productivity boost percentage
     */
    incrementPercentBoost(): void {
        if (this.percentBoost)
            this.percentBoost(parseInt(this.percentBoost() as any) + 1);
    }

    /**
     * Decrements the productivity boost percentage
     */
    decrementPercentBoost(): void {
        if (this.percentBoost)
            this.percentBoost(parseInt(this.percentBoost() as any) - 1);
    }

    /**
     * Adds a demand to this factory
     * @param demand - The demand to add
     */
    add(demand: Demand): void {
        this.demands.push(demand);
        this.updateAmount();
    }

    /**
     * Removes a demand from this factory
     * @param demand - The demand to remove
     */
    remove(demand: Demand): void {
        this.demands.remove(demand);
        this.updateAmount();
    }

    /**
     * Applies configuration globally to all islands
     */
    applyConfigGlobally(): void {
        for (const isl of (window as any).view.islands()) {
            if (this.region && isl.region && this.region != isl.region)
                continue;

            const other = isl.assetsMap.get(this.guid);

            for (let i = 0; i < this.items.length; i++)
                other.items[i].checked(this.items[i].checked());

            for (const m of ["module", "fertilizerModule"]) {
                const checked = (this as any)[m + "Checked"];
                if (checked && checked())
                    (other as any)[m + "Checked"](checked());
            }

            if (this.palaceBuffChecked)
                other.palaceBuffChecked(this.palaceBuffChecked());

            if (this.setBuffChecked)
                other.setBuffChecked(this.setBuffChecked());

            if (this.workforceDemand && this.workforceDemand.percentBoost)
                other.workforceDemand.percentBoost(this.workforceDemand.percentBoost());

            // set boost after modules
            if (this.percentBoost)
                other.percentBoost(this.percentBoost());
        }
    }

    // inputAmount is now handled as a computed property in the constructor

    /**
     * Gets the extended name including region information
     * @returns The extended name
     */
    getRegionExtendedName(): string {
        if (!this.region || !this.product) {
            return this.name();
        }
        return `${this.name()} (${this.region.name()})`;
    }
} 