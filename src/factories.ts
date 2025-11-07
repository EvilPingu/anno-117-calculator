import { NamedElement, ACCURACY, EPSILON, ko, BuildingsCalc } from './util';
import { Workforce, WorkforceDemand } from './population';
import { Demand, Product, AqueductBuff, Item, Buff, ExtraGoodProduction } from './production';
import { AppliedBuff } from './buffs';
import {
    ConsumerConfig,
    AssetsMap,
    LiteralsMap,
} from './types';
import { Island, Region } from './world';
import { FactoryConfig, ModuleConfig } from './types.config';
import { Supplier } from './suppliers';


/**
 * Base class for all consumers in the game
 * Represents buildings that consume goods and require workforce
 * 
 * CONSUMER vs FACTORY DISTINCTION:
 * - Consumer: Base class for all buildings that consume resources (population buildings, public buildings, factories)
 * - Factory: Extends Consumer, specifically produces goods that other consumers can use
 * - PublicConsumerBuilding: Extends Consumer, provides services to population but doesn't produce goods
 * - Module: Extends Consumer, provides buffs to factories they're attached to
 */
export class Consumer extends NamedElement{
    // === BASIC PROPERTIES ===
    public guid: number;
    public isFactory: boolean;
    public island: Island;
    public associatedRegions: Region[];

    // === PRODUCTION CONFIGURATION ===
    public needsFuelInput: boolean;
    public defaultInputs: Map<Product, number>;
    public cycleTime: number;
    public maintenances: Map<Product|Workforce, number>;
    public connectedWorkforce?: Workforce;

    // === BUFF SYSTEM ===
    public items: AppliedBuff[];           // Applied item effects
    public buffs: AppliedBuff[];           // All applied effects (items + other sources)
    public aqueductBuff?: AqueductBuff;    // Special aqueduct productivity buff
    public modules: Module[];              // Attached modules (for factories)

    // === INPUT DEMAND SYSTEM ===
    public inputDemandsMap: Map<Product, Demand>;
    public inputDemands: KnockoutObservableArray<Demand>;
    public inputDemandFuel?: Demand;
    public workforceDemand!: WorkforceDemand;

    // === AMOUNT CALCULATION ===
    public boost: KnockoutObservable<number>;                    // Productivity multiplier from buffs
    public inputAmountByOutput: KnockoutObservable<number>;      // Required input based on desired output
    public inputAmountByExistingBuildings: KnockoutComputed<number>; // Required input based on constructed buildings
    public inputAmount: KnockoutComputed<number>;                // Final calculated input amount
    public useinputAmountByExistingBuildings: KnockoutObservable<boolean>; // Whether to use existing buildings for calculation

    // === BUILDING MANAGEMENT ===
    public buildings: BuildingsCalc;       // Building count calculations (constructed/required/utilized)
    public editable: KnockoutObservable<boolean>; // Whether user can edit this consumer

    // === REACTIVE SUBSCRIPTIONS ===
    public boostSubscription!: KnockoutComputed<void>;           // Updates boost from buffs
    public buildingsSubscription!: KnockoutComputed<void>;       // Updates building requirements
    public inputDemandsSubscription!: KnockoutComputed<void>;    // Updates input demands based on replacements
    public workforceDemandSubscription?: KnockoutComputed<void>; // Updates workforce demand from buffs

    // === UI/DISPLAY ===
    public availableItems!: KnockoutComputed<AppliedBuff[]>;     // Items available for this consumer
    public product!: Product | null;                             // Primary product (for factories)


    /**
     * Creates a new Consumer instance
     * @param config - Configuration object for the consumer
     * @param assetsMap - Map of all available assets
     * @param island - The island this consumer belongs to
     */
    constructor(config: ConsumerConfig, assetsMap: AssetsMap, literalsMap: LiteralsMap, island: Island) {
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
        this.guid = config.guid;
        
        // Explicit assignments
        this.isFactory = false;
        this.needsFuelInput = config.needsFuelInput;
        this.cycleTime = config.cycleTime;
        this.island = island;
        this.associatedRegions = [];
        for (var r of config.associatedRegions)
            this.associatedRegions.push(literalsMap.get(r) as Region);
 
        this.items = [];
        this.buffs = [];
        this.inputDemandsMap = new Map();
        this.inputDemands = ko.observableArray([]);

        // Initialize modules array
        this.modules = [];

        this.boost = ko.observable(1);
        this.editable = ko.observable(false);
        this.buildings = new BuildingsCalc();
        this.lockDLCIfSet(this.buildings.constructed);
        this.useinputAmountByExistingBuildings = ko.observable(true);
        this.inputAmountByOutput = ko.observable(0);

        // Set up computed observables
        this.inputAmountByExistingBuildings = ko.computed(() => {
            return this.buildings.constructed() * this.boost() * 60 /  this.cycleTime ;
        });

        this.inputAmount = ko.pureComputed(() => {
            let amount = this.inputAmountByOutput();
            if (this.useinputAmountByExistingBuildings()) {
                amount = Math.max(amount, this.inputAmountByExistingBuildings());
            }
            return amount;
        });

        this.buildingsSubscription = ko.computed(() => {        
            this.buildings.required(this.inputAmount() / 60 * this.cycleTime / this.boost());
        }).extend({ deferred: true });
        this.lockDLCIfSet(this.buildings);
        
        this.notes = ko.observable("");

        this.defaultInputs = new Map();
        if (config.inputs) {
            for(var i of config.inputs){
                let product = assetsMap.get(i.product);
                if (!product) {
                    throw new Error(`Product with GUID ${i.product} not found in assetsMap`);
                }
                this.defaultInputs.set(product, i.amount);            
            }
        }

        this.maintenances = new Map();
        for(var i of config.maintenances){
            let product = assetsMap.get(i.product);
            if (!product) {
                throw new Error(`Product with GUID ${i.product} not found in assetsMap`);
            }
            this.maintenances.set(product, i.amount);    
            
            if (product instanceof Workforce)
                this.connectedWorkforce = product;
        }


        if (config.aqueductProductivityBuff != null){
            const buff = assetsMap.get(config.aqueductProductivityBuff);
            if (!buff) {
                throw new Error(`AqueductProductivityBuff with GUID ${config.aqueductProductivityBuff} not found in assetsMap`);
            }
            this.aqueductBuff = new AqueductBuff(buff, this, assetsMap);     
        }

        this.availableItems = ko.pureComputed(() => this.items.filter(i => i.available()));
    }


    /**
     * References products and sets up input demands
     * @param assetsMap - Map of all available assets
     */
    initDemands(assetsMap: AssetsMap): void {
        this.boostSubscription = ko.computed(() => {
            // Separate module buffs (multiplicative) from other buffs (additive)
            let additivePercentBuff = 0;
            let multiplicativeFactor = 1;
            
            for (const buff of this.buffs) {
                if (this.isModuleBuff(buff)) {
                    // Module buffs are multiplicative - each adds to the multiplier
                    multiplicativeFactor *= (1 + buff.productivityUpgrade() / 100);
                } else {
                    // Non-module buffs remain additive
                    additivePercentBuff += buff.productivityUpgrade();
                }
            }
            
            // Add aqueduct buff to additive buffs
            if (this.aqueductBuff != null)
                additivePercentBuff += this.aqueductBuff.productivityUpgrade();
            
            // Combine additive and multiplicative factors
            const additiveFactor = Math.max(ACCURACY, additivePercentBuff / 100 + 1);
            const totalFactor = additiveFactor * multiplicativeFactor;
            
            this.boost(Math.max(ACCURACY, totalFactor));
        });

        this.inputDemandsSubscription = ko.computed(() => {
            if (!this.defaultInputs) {
                return;
            }

            const amount = this.inputAmount();

            const inputs = new Map() as Map<Product, number>;
            for (let product of this.defaultInputs.keys())
                inputs.set(product, this.defaultInputs.get(product) as number);

            const buffs = this.buffs.filter(item => item.replacements && item.scaling()).sort((a, b) => a.buff.guid as number - (b.buff.guid as number));
            
            for (const buff of buffs) {
                for (const replacement of buff.replacements || []) {
                    if (inputs.has(replacement[0])) {
                        const factor = inputs.get(replacement[0]) as number;
                        inputs.delete(replacement[0]);
                        if (replacement[1]) {
                            inputs.set(replacement[1], factor);
                        }
                    }
                }
            }

            const map = new Map();
            const demands = [];
            for (const p of inputs.keys()) {

                if (p.isAbstract) {
                    continue;
                }

                let d = this.inputDemandsMap.get(p);
                if (d) {
                    map.set(p, d);
                    demands.push(d);
                    this.inputDemandsMap.delete(p);
                    d.updateAmount(amount);
                } else {
                    d = new Demand(p, this,assetsMap, ko.observable(inputs.get(p)));
                    d.updateAmount(amount);
                    demands.push(d);
                    map.set(p, d);
                }
            }

            // Note: Demand-factory relationship removed - demands now resolved through Product.defaultSupplier

            this.inputDemandsMap = map;
            this.inputDemands.removeAll();
            for (const d of demands) this.inputDemands.push(d);
        });

        if (this.needsFuelInput){
            let product = assetsMap.get(window.view.constants.fuelProduct);
            if (!product) {
                throw new Error(`Fuel product with GUID ${window.view.constants.fuelProduct} not found in assetsMap`);
            }
            let cycleTime = window.view.constants.fuelProductionTime as number;

            const fuelFactor = ko.pureComputed(() => {
                const percentBuff = this.buffs.reduce((a:number, b: AppliedBuff)=> a+b.fuelDurationPercent() , 0);
                const factor = percentBuff / 100 + 1;

                return this.cycleTime / (factor * cycleTime) / this.boost();
            });
            this.inputDemandFuel = new Demand(product, this, assetsMap, fuelFactor);
            this.buildings.utilized.subscribe(buildings => this.inputDemandFuel!.updateAmount(buildings));
        }

        this.modules.forEach(m => m.initDemands(assetsMap));
        // demand for modules is updated when their number of constructed buildings is updated, see constructor of Module

        this.createWorkforceDemand();
    }

    /**
     * Creates workforce demand for this consumer
     * @param assetsMap - Map of all available assets
     * @returns The created workforce demand or null
     */
    createWorkforceDemand(): void {
        if (this.connectedWorkforce == null)
            return;


        this.workforceDemand = new WorkforceDemand(
            this, 
            this.connectedWorkforce,
            this.maintenances.get(this.connectedWorkforce) as number
        );

        this.workforceDemandSubscription = ko.computed(() => {
            // for workforce replacement, the last applied item matters
            const buffs = this.buffs.filter(item => item.replacingWorkforce && (item.replacingWorkforce as any) != this.connectedWorkforce && item.scaling()).sort((a, b) => b.parent.guid as number - (a.parent.guid as number));
            if (buffs.length && this.workforceDemand) {
                this.workforceDemand.updateWorkforce(buffs[0].replacingWorkforce);
            } else if (this.workforceDemand) {
                this.workforceDemand.updateWorkforce(null);
            }

            const percentBuff = this.buffs.reduce((a:number, b: AppliedBuff)=> a+b.workforceMaintenanceFactorUpgrade() , 0);
            const factor = Math.max(0, percentBuff / 100 + 1);
            this.workforceDemand.boost(factor);
        });
 
    }

    /**
     * Gets the extended name including region information
     * @returns The extended name
     */
    getRegionExtendedName(): string {
        if (this.product && this.product.factories.length <= 1) {
            return this.name();
        }

        return `${this.name()} (${this.associatedRegions[0].name() || 'Unknown Region'})`;
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
    }

    addBuff(appliedBuff: AppliedBuff){
        this.buffs.push(appliedBuff)

        if(appliedBuff.parent instanceof Item)
            this.items.push(appliedBuff);
    }

    /**
     * Determines if an applied buff comes from a module
     * @param appliedBuff - The applied buff to check
     * @returns True if the buff comes from a module
     */
    isModuleBuff(appliedBuff: AppliedBuff): boolean {
        return appliedBuff.parent instanceof Module;
    }
}

/**
 * Represents a module that can be attached to factories
 * Modules provide buffs to their parent factory when activated
 */
export class Module extends Consumer {
    // === MODULE-SPECIFIC PROPERTIES ===
    public factory: Factory;                               // Parent factory this module is attached to
    public checked: KnockoutObservable<boolean>;           // Whether module is activated
    public visible: KnockoutComputed<boolean>;             // Whether module is visible in UI

    // === BUFF MANAGEMENT ===
    public triggeredBuffsGuids: number[];                  // GUIDs of buffs this module provides
    public triggeredBuffs: AppliedBuff[];                  // Actual buff instances applied to factory

    // === REACTIVE SUBSCRIPTIONS ===
    public constructedSubscription: KnockoutComputed<void>; // Updates constructed buildings based on factory
    
    /**
     * Creates a new Module instance
     * @param config - Configuration object for the module
     * @param assetsMap - Map of all available assets
     * @param island - The island this module belongs to
     * @param factory - The factory this module is attached to
     */
    constructor(config: ModuleConfig, assetsMap: AssetsMap, literalsMap: LiteralsMap, factory: Factory) {
        super({...config, maintenances: []}, assetsMap, literalsMap, factory.island);
        
        // Module-specific initialization
        this.isFactory = false;
        this.factory = factory;
        this.triggeredBuffs = [];
        this.triggeredBuffsGuids = config.buffs

        this.checked = ko.observable(false);
        this.lockDLCIfSet(this.checked);
        this.visible = ko.pureComputed(() => this.available());



        this.constructedSubscription = ko.computed(() => {
            this.buildings.constructed(this.checked() ? this.factory.buildings.utilized() : 0);
        })
    }

    applyBuffs(assetsMap: AssetsMap): void {
        // Create AppliedBuff if factory is provided and module has functional effects
        for (const buffGuid of this.triggeredBuffsGuids) {
            const buff = assetsMap.get(buffGuid) as Buff;
            if(buff != null){
                const appliedBuff = new AppliedBuff(
                    this,
                    buff,
                    this.factory,
                    assetsMap,
                    false // Don't use parent scaling
                );
                // Initially set scaling to 0 (unchecked)
                appliedBuff.scaling(0);
                this.triggeredBuffs.push(appliedBuff);
            }            
        }

        // Set up checked observable subscription for buff scaling
        this.checked.subscribe((checked: boolean) => {
            for (const triggeredBuff of this.triggeredBuffs) {
                triggeredBuff.scaling(checked ? 1 : 0);
            }
        });
    }
    
    getInputs(): Map<Product, number> {
        return this.defaultInputs || [];
    }
}

/**
 * Represents a public consumer building (schools, hospitals, fire stations, etc.)
 * These buildings provide services to population but don't produce goods for consumption chains
 */
export class PublicConsumerBuilding extends Consumer {
    // === PUBLIC BUILDING PROPERTIES ===
    public product: Product;                              // Associated product/service (if any)


    // === OPTIONAL RECIPE SYSTEM ===
    public goodConsumptionUpgrade?: Product;                     // Product used for consumption upgrades
    public recipeName?: KnockoutComputed<string>;                // Display name for recipe variants

    /**
     * Creates a new PublicConsumerBuilding instance
     * @param config - Configuration object for the building
     * @param assetsMap - Map of all available assets
     * @param island - The island this building belongs to
     */
    constructor(config: any, assetsMap: AssetsMap, literalsMap: LiteralsMap, island: Island) {
        super(config, assetsMap, literalsMap, island);

        // Explicit assignments
        this.product = config.product ? (() => {
            const product = assetsMap.get(parseInt(config.product));
            if (!product) {
                throw new Error(`Product with GUID ${config.product} not found in assetsMap`);
            }
            return product;
        })() : null;
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
 * Represents a factory that produces goods for consumption by other consumers
 * Extends Consumer to provide production chain functionality
 * Implements Supplier interface to participate in the supplier selection system
 *
 * KEY DIFFERENCE FROM CONSUMER:
 * - Consumer: Consumes resources (inputs) for internal use (population needs, public services)
 * - Factory: Consumes resources (inputs) to PRODUCE goods (outputs) that feed other consumers
 * - Factory outputs become inputs for other consumers in the production chain
 */
export class Factory extends Consumer implements Supplier {
    // === SUPPLIER INTERFACE ===
    public readonly type: 'factory' = 'factory';            // Supplier type identifier
    // product and island properties inherited from Consumer

    // === FACTORY IDENTIFICATION ===
    public isFactory: boolean;                              // Always true for Factory instances

    // === PRODUCTION OUTPUTS ===
    public outputs: Product[];                              // Products this factory produces

    // === DEMAND MANAGEMENT ===
    public demands: KnockoutObservableArray<Demand>;        // Other consumers demanding this factory's output
    public totalDemands: KnockoutComputed<number>;          // Total demand from all consumers

    // === EXTERNAL PRODUCTION SOURCES ===
    public selfEffectingExtraGoods: ExtraGoodProduction[];                  // Extra good entries where factory produces extra of its own output
    public extraGoodProductionHistory: [number, Date][];    // History for cycle breaking in extra goods
    public extraGoodProductionAmount: KnockoutComputed<number>; // Amount from extra goods (from Product)
    public externalProduction: KnockoutComputed<number>;    // Total from trade + extra goods

    // === PRODUCTION CALCULATION ===
    public demandByExtraGoodSupplier: KnockoutObservable<number>; // Demand from extra good supplier
    public inputAmount: KnockoutComputed<number>;            // Total input required (overrides Consumer)
    public extraGoodFactor: KnockoutComputed<number>;        // Multiplier from extra goods affecting this factory
    public outputAmount: KnockoutComputed<number>;           // Total output produced
    public substitutableOutputAmount: KnockoutComputed<number>; // Output that can be substituted
    public overProduction: KnockoutComputed<number>;         // Excess production over demand

    // === UI/DISPLAY ===
    public isHighlightedAsMissing: KnockoutComputed<boolean>; // Whether to highlight missing buildings
    public extraGoodsDisplayAmount?: KnockoutComputed<number>; // Extra goods amount for display
    public visible: KnockoutComputed<boolean>;               // Whether factory is visible in UI

    // === REACTIVE SUBSCRIPTIONS ===
    public requiredInputAmountSubscription?: KnockoutComputed<void>; // Updates input requirements
    public useInputAmountByExistingBuildingsSubscription?: KnockoutComputed<void>; // Updates building usage mode
    public buildingSubscription?: KnockoutComputed<void>;    // Additional building calculations


    /**
     * Creates a new Factory instance
     * @param config - Configuration object for the factory
     * @param assetsMap - Map of all available assets
     * @param island - The island this factory belongs to
     * @param moduleConfigs - Optional module configurations from params
     */
    constructor(config: FactoryConfig, assetsMap: AssetsMap, literalsMap: LiteralsMap, island: Island, moduleConfigs?: ModuleConfig[]) {
        super(config, assetsMap, literalsMap, island);
        
        // Explicit assignments
        this.isFactory = true;
        this.outputs = []
        for (let entry of config.outputs) {
            const product = assetsMap.get(entry.product);
            if (!product) {
                throw new Error(`Product with GUID ${entry.product} not found in assetsMap`);
            }
            this.outputs.push(product);
        }
        this.demands = ko.observableArray([]);

        // Self-effecting extra goods will be populated when ExtraGoodProduction entries are created
        this.selfEffectingExtraGoods = [];

        // use the history to break the cycle: extra good (lumberjack) -> building materials need (timber) -> production (sawmill) -> production (lumberjack)
        // that cycles between two values by adding a damper
        // [[prev val, timestamp], [prev prev val, timestamp]]
        this.extraGoodProductionHistory = [];
        this.extraGoodProductionAmount = ko.pureComputed(() => {
            const product = this.getProduct();
            if (!product || !product.extraGoodProductionList) return 0;
            const val = product.extraGoodProductionList.amount();

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

            const product = this.getProduct();
            if (product && product.tradeList) {
                sum += product.tradeList.inputAmount();
            }

            return sum;
        });

        this.externalProduction = ko.pureComputed(() => {
            let sum = 0;

            const product = this.getProduct();
            if (product && product.tradeList) {
                sum += product.tradeList.outputAmount();
            }
            sum += this.extraGoodProductionAmount();

            return sum;
        });

        this.demandByExtraGoodSupplier = ko.observable(0);



        // Create Module instance if factory has additionalModule
        if (config.additionalModule && moduleConfigs) {
            const moduleConfig = moduleConfigs.find(m => m.guid === config.additionalModule);
            if (moduleConfig) {
                const module = new Module(moduleConfig, assetsMap, literalsMap, this);
                this.modules.push(module);
                
            }
        }

        this.extraGoodFactor = ko.computed(() => {
            let factor = 1;

            // Self-effecting extra goods boost this factory's production
            for (const e of this.selfEffectingExtraGoods) {
                factor += e.item.scaling() * e.defaultAmount / e.additionalOutputCycle;
            }

            return factor;
        });



        this.outputAmount = ko.pureComputed(() => {
            const diff = Math.max(this.demandByExtraGoodSupplier() * this.extraGoodFactor(),
                this.totalDemands() - this.externalProduction(),
                this.useinputAmountByExistingBuildings && this.useinputAmountByExistingBuildings() ? this.inputAmountByExistingBuildings() * this.extraGoodFactor() : 0);
            return diff > EPSILON ? diff : 0;
        });

        this.substitutableOutputAmount = ko.pureComputed(() => Math.max(0, this.totalDemands() - this.externalProduction() - Math.max(this.demandByExtraGoodSupplier(), this.inputAmountByExistingBuildings ? this.inputAmountByExistingBuildings() : 0) * this.extraGoodFactor()));
        
        this.isHighlightedAsMissing = ko.pureComputed(() => {
            if (!(window as any).view.settings.missingBuildingsHighlight || !(window as any).view.settings.missingBuildingsHighlight.checked())
                return false;

            return this.buildings.required() > this.buildings.constructed() + ACCURACY;
        });

        this.requiredInputAmountSubscription = ko.computed(() => {
            this.inputAmountByOutput(this.outputAmount() / this.extraGoodFactor());
        });

        this.useInputAmountByExistingBuildingsSubscription = ko.computed(() => {
            if (this.useinputAmountByExistingBuildings) {
                this.useinputAmountByExistingBuildings(this.editable() || this.buildings.fullyUtilizeConstructed());
            }
        });
        

        // Set up inputAmount as a computed property
        this.inputAmount = ko.pureComputed(() => {
            return this.outputAmount() / this.extraGoodFactor();
        });

        this.overProduction = ko.pureComputed(() => Math.max(0, this.inputAmount() * this.extraGoodFactor() + this.externalProduction() - this.totalDemands()));

        // Extra goods display amount comes from Product now
        this.extraGoodsDisplayAmount = ko.pureComputed(() => {
            const product = this.getProduct();
            if (!product || !product.extraGoodProductionList) return 0;
            return product.extraGoodProductionList.nonZero().reduce((a: number, b: ExtraGoodProduction) => a + b.amount(), 0);
        });

        this.visible = ko.computed(() => {
            if (!this.available())
                return false;

            const product = this.getProduct();
            const extraGoodAmount = product && product.extraGoodProductionList ? product.extraGoodProductionList.amount() : 0;

            if (Math.abs(this.inputAmount()) > EPSILON ||
                this.totalDemands() > EPSILON ||
                this.externalProduction() > EPSILON ||
                this.buildings.constructed() > 0 ||
                extraGoodAmount > EPSILON)
                return true;

            if (this.island.region.id != "Meta" && this.associatedRegions.indexOf(this.island.region) == -1)
                return false;

            if ((window as any).view.settings.showAllConstructableFactories && (window as any).view.settings.showAllConstructableFactories.checked())
                return true;

            if (this.editable()) {
                return this.associatedRegions.indexOf(this.island.region) != -1;
            }

            return false;
        });

        
        (this.getProduct() as Product).addFactory(this);
    }

    /**
     * Gets the output products for this factory
     * @returns Array of output products
     */
    getOutputs(): Product[] {
        return this.outputs || [];
    }

    /**
     * References products and sets up factory-specific relationships
     * @param assetsMap - Map of all available assets
     */
    initDemands(assetsMap: AssetsMap): void {
        super.initDemands(assetsMap);

        this.modules.forEach(m => m.applyBuffs(assetsMap));

        this.product = this.getProduct();
        if (!this.icon && this.product)
            this.icon = this.product.icon as string;


        this.buildings.utilized.subscribe((b: number) => {
            if (this.workforceDemand)
                this.workforceDemand.updateAmount(b);

        });
    }

    /**
     * Gets the primary product produced by this factory
     * @returns The primary product or null
     */
    getProduct(): Product | null {
        return this.getOutputs()[0];
    }

    /**
     * Gets the icon for this factory
     * @returns The icon path
     */
    getIcon(): string {
        const product = this.getProduct();
        return product ? product.icon as string : super.getIcon();
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

    // === SUPPLIER INTERFACE IMPLEMENTATION ===

    /**
     * Returns the current production amount (Supplier interface)
     * Includes extra goods factor for accurate production calculation
     */
    defaultProduction(): number {
        return this.inputAmount() * this.extraGoodFactor();
    }

    /**
     * Checks if this factory can supply the requested amount (Supplier interface)
     * @param amount - The requested amount
     * @returns True if factory is available and in correct region
     */
    canSupply(_amount: number): boolean {
        return this.available();
    }

    /**
     * Sets the demand for this factory to produce (Supplier interface)
     * @param amount - The requested production amount
     */
    setDemand(amount: number): void {
        this.inputAmountByOutput(amount / this.extraGoodFactor());
    }


    // inputAmount is now handled as a computed property in the constructor
} 