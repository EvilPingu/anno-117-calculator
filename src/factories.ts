import { NamedElement, ACCURACY, EPSILON, ko, BuildingsCalc } from './util';
import { Workforce, WorkforceDemand } from './population';
import { Demand, AppliedBuff, ExtraGoodProductionList, Product, AqueductBuff, Item } from './production';
import { TradeList } from './trade';
import { 
    ConsumerConfig, 
    AssetsMap,
    LiteralsMap,
} from './types';
import { Island, Region } from './world';
import { FactoryConfig } from './types.config';


/**
 * Base class for all consumers in the game
 * Represents buildings that consume goods and require workforce
 */
export class Consumer extends NamedElement{
    public guid: number;
    public isFactory: boolean;
    public needsFuelInput: boolean;
    public defaultInputs: Map<Product, number>;
    public associatedRegions: Region[];

    public maintenances: Map<Product|Workforce, number>;
    public connectedWorkforce?: Workforce;
    public cycleTime: number;
    public island: Island;

    public items: AppliedBuff[];
    public buffs: AppliedBuff[]; // from items and other effects, for calculation
    public inputDemandsMap: Map<Product, Demand>;
    public inputDemands: KnockoutObservableArray<Demand>;
    public buildingInputDemands: KnockoutObservableArray<Demand>;
    public workforceDemand!: WorkforceDemand;
    public boost: KnockoutObservable<number>;
    public boostSubscription!: KnockoutComputed<void>;
    public editable: KnockoutObservable<boolean>;
    public buildings: BuildingsCalc;
    public useinputAmountByExistingBuildings: KnockoutObservable<boolean>;
    public inputAmountByOutput: KnockoutObservable<number>;
    public inputAmountByExistingBuildings: KnockoutComputed<number>;
    public inputAmount: KnockoutComputed<number>;
    public availableItems!: KnockoutComputed<AppliedBuff[]>;
    public buildingsSubscription!: KnockoutComputed<void>;
    public inputDemandsSubscription!: KnockoutComputed<void>;
    public workforceDemandSubscription?: KnockoutComputed<void>;
    public fuelSubscription?: KnockoutComputed<void>;
    public product!: Product | null;
    public aqueductBuff?: AqueductBuff;


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
        this.buildingInputDemands = ko.observableArray([]);

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
            var percentBuff = this.buffs.reduce((a:number, b: AppliedBuff)=> a+b.productivityUpgrade() , 0);
            if (this.aqueductBuff != null)
                percentBuff += this.aqueductBuff.productivityUpgrade();
            const factor = Math.max(ACCURACY, percentBuff / 100 + 1);
            this.boost(factor);
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
                    d = new Demand(p, this,assetsMap, inputs.get(p));
                    d.updateAmount(amount);
                    demands.push(d);
                    map.set(p, d);
                }
            }

            for (const d of this.inputDemandsMap.values()) {
                d.factory().remove(d);
            }

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

            this.buildingInputDemands.push(new Demand(product, this, assetsMap));
            this.fuelSubscription = ko.computed(() => {
                const percentBuff = this.buffs.reduce((a:number, b: AppliedBuff)=> a+b.fuelDurationPercent() , 0);
                const factor = percentBuff / 100 + 1;

                let amount = this.buildings.utilized() * this.cycleTime / (factor * cycleTime) / this.boost();
                this.buildingInputDemands()[0].updateAmount(amount);
            });
        }

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

        return `${this.name()} (${this.island.region.name() || 'Unknown Region'})`;
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
}

/**
 * Represents a module that can be attached to factories
 */
export class Module extends Consumer {
    public additionalOutputCycle: number;
    public productivityUpgrade: number;
    public workforceAmountUpgrade?: { Value: number } | undefined;

    public checked: KnockoutObservable<boolean>;
    public visible: KnockoutComputed<boolean>;
    
    /**
     * Creates a new Module instance
     * @param config - Configuration object for the module
     * @param assetsMap - Map of all available assets
     * @param island - The island this module belongs to
     */
    constructor(config: any, assetsMap: AssetsMap, literalsMap: LiteralsMap, island: Island) {
        super({...config, maintenances: []}, assetsMap, literalsMap, island);
        
        // Module-specific initialization
        this.additionalOutputCycle = config.additionalOutputCycle || 0;
        this.productivityUpgrade = config.productivityUpgrade || 0;
        this.workforceAmountUpgrade = config.workforceAmountUpgrade;


        // Module-specific initialization
        this.isFactory = false;

        this.checked = ko.observable(false);
        this.lockDLCIfSet(this.checked);
        this.visible = ko.pureComputed(() => !!config && this.available());
    }
    
    getInputs(): Map<Product, number> {
        return this.defaultInputs || [];
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
 * Represents a factory that produces goods
 * Extends Consumer to provide factory-specific functionality
 */
export class Factory extends Consumer {
    public isFactory: boolean;
    public canClip: boolean;
    public clipped: KnockoutObservable<boolean>;
    public outputs: Product[];
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
    constructor(config: FactoryConfig, assetsMap: AssetsMap, literalsMap: LiteralsMap, island: Island) {
        super(config, assetsMap, literalsMap, island);
        
        // Explicit assignments
        this.isFactory = true;
        this.canClip = false;
        this.clipped = ko.observable(false);
        this.outputs = []
        for (let entry of config.outputs) {
            const product = assetsMap.get(entry.product);
            if (!product) {
                throw new Error(`Product with GUID ${entry.product} not found in assetsMap`);
            }
            this.outputs.push(product);
        }
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



        /*
        if (config.module) {
            const module = assetsMap.get(parseInt(config.module));
            if (!module) {
                throw new Error(`Module with GUID ${config.module} not found in assetsMap`);
            }
            this.module = module;
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
            const fertilizerModule = assetsMap.get(parseInt(config.fertilizerModule));
            if (!fertilizerModule) {
                throw new Error(`Fertilizer module with GUID ${config.fertilizerModule} not found in assetsMap`);
            }
            this.fertilizerModule = fertilizerModule;
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
*/
        this.extraGoodFactor = ko.computed(() => 1);

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
        
        if (this.extraGoodProductionList) {
            this.extraGoodsDisplayAmount = ko.pureComputed(() => this.extraGoodProductionList.checked() ? this.extraGoodProductionList.nonZero().reduce((a: number, b: any) => a + b.amount(), 0) : 0);
        }

        this.visible = ko.computed(() => {
            if (!this.available())
                return false;

            if (Math.abs(this.inputAmount()) > EPSILON ||
                this.totalDemands() > EPSILON ||
                this.externalProduction() > EPSILON ||
                this.buildings.constructed() > 0 ||
                this.extraGoodProductionList.amount() > EPSILON)
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

        this.product = this.getProduct();
        if (!this.icon && this.product)
            this.icon = this.product.icon as string;

        /*
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
        */

        this.buildings.utilized.subscribe((b: number) => {
            if (this.workforceDemand)
                this.workforceDemand.updateAmount(b);

             /*
            for (const m of ["module", "fertilizerModule"]) {
                const module = (this as any)[m];
                const checked = (this as any)[m + "Checked"];
                const demand = (this as any)[m + "Demand"];

                if (module) {
                    if (checked && checked())
                        demand.updateAmount(b * 60 / module.cycleTime);
                    else
                        demand.updateAmount(0);
                }
            }
                */
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


    // inputAmount is now handled as a computed property in the constructor

    /**
     * Gets the extended name including region information
     * @returns The extended name
     */
    getRegionExtendedName(): string {
        return `${this.name()} (${this.island.region.name()})`;
    }
} 