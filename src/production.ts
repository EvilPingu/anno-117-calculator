import { NamedElement, EPSILON, ko, dummyObservableArray } from './util';
import {  AssetsMap } from './types';
import { ProductConfig, BuildingBuffConfig, PatronsConfig, EffectConfig, ItemConfig } from './types.config';
import { Workforce } from './population';
import { Region, Constructible, isConstructible } from './world';

import type { Factory } from './factories';
import { AppliedBuff, ExtraGoodProduction } from './buffs';
export { AppliedBuff, ExtraGoodProduction };


declare const view: any;
declare const $: any;

/**
 * Represents a product that can be produced by factories
 * Manages production relationships and factory assignments
 */
export class Product extends NamedElement {
    public guid: number;
    public isAbstract: boolean;
    public factories: Factory[];
    public availableFactories: KnockoutObservableArray<Factory>;
    public fixedFactory: KnockoutObservable<Factory | null>;
    public visible: KnockoutComputed<boolean>;

    /**
     * Creates a new Product instance
     * @param config - Configuration object for the product
     * @param assetsMap - Map of all available assets
     */
    constructor(config: ProductConfig, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('Product name is required');
        }
        if (!config.guid) {
            throw new Error('Product GUID is required');
        }


        // Prepare config for parent constructor
        const parentConfig = {
            guid: config.guid,
            name: config.name,
            locaText: config.locaText || {},
            iconPath: config.iconPath || "",
        };
        
        super(parentConfig);
        this.guid = config.guid;
        
        this.isAbstract = config.isAbstract || false;

        this.factories = [];
        this.availableFactories = dummyObservableArray("Product.availableFactories");

        this.fixedFactory = ko.observable(null);

        this.visible = ko.pureComputed(() => this.available());
    }

    addFactory(factory: Factory){
        this.factories.push(factory);
        this.availableFactories = ko.pureComputed(() => this.factories.filter((f: Factory) => f.available()));
    }
}

/**
 * Represents a meta product that groups other products
 * Used for organizing products into categories
 */
export class MetaProduct extends NamedElement {
    public isAbstract: boolean;

    /**
     * Creates a new MetaProduct instance
     * @param config - Configuration object for the meta product
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('MetaProduct name is required');
        }
        if (!config.guid) {
            throw new Error('MetaProduct GUID is required');
        }

        // Prepare config for parent constructor
        const parentConfig = {
            guid: config.guid,
            name: config.name,
            locaText: config.locaText || {},
            iconPath: config.iconPath || "",
            dlcs: config.dlcs || []
        };
        
        super(parentConfig);
        
        // Explicit assignments
        this.isAbstract = config.isAbstract || true;
    }
}



/**
 * Represents a demand for a product from a consumer
 * Manages the relationship between consumers and the products they need
 */
export class Demand {
    public consumer: Constructible;
    public amount: KnockoutObservable<number>;
    public product: Product;
    public factory: KnockoutObservable<Factory>;
    public factor: KnockoutComputed<number>;

    /**
     * Creates a new Demand instance
     * @param product - The product being demanded
     * @param consumer - The consumer creating the demand
     * @param assetsMap - Map of all available assets
     */
    constructor(product: Product, consumer: Constructible,  _assetsMap: AssetsMap, observableFactor: KnockoutComputed<number>) {

        this.product = product;
        this.consumer = consumer;
        this.factor = observableFactor;

        this.amount = ko.observable(0);

        this.factory = ko.observable(null);
        this.updateFixedProductFactory(this.product.fixedFactory());
        this.product.fixedFactory.subscribe((f: Factory | null) => this.updateFixedProductFactory(f));

    }

    /**
     * Updates the factory assigned to this demand
     * @param f - The factory to assign
     */
    updateFixedProductFactory(f: Factory | null): void {
        if (f == null) { // find factory in the same region as consumer
            let region = this.consumer.associatedRegions[0];
            if (region) {
                for (let fac of this.product.factories) {
                    if (fac.associatedRegions.indexOf(region) != -1) {
                        f = fac;
                        break;
                    }
                }
            }
        }

        if (f == null) // region based approach not successful
            f = this.product.factories[0];

        if (f != this.factory()) {
            if (this.factory())
                this.factory().remove(this);

            this.factory(f);
            f.add(this);
        }
    }

    /**
     * Updates the amount of this demand
     * @param amount - The new amount
     */
    updateAmount(amount: number): void {
        const adjustedAmount = amount * this.factor();
        if (Math.abs(this.amount() - adjustedAmount) >= EPSILON) {
            this.amount(adjustedAmount);
        }
    }
}


/**
 * Represents a category of products
 * Groups related products together for organization
 */
export class ProductCategory extends NamedElement {
    public guid: number;
    public products: Product[];

    /**
     * Creates a new ProductCategory instance
     * @param config - Configuration object for the category
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.guid) {
            throw new Error('ProductCategory GUID is required');
        }
        if (!config.products || !Array.isArray(config.products)) {
            throw new Error('ProductCategory products array is required');
        }

        // Prepare config for parent constructor
        const parentConfig = {
            guid: config.guid,
            name: config.name,
            locaText: config.locaText || {},
            iconPath: config.iconPath || "",
            dlcs: config.dlcs || []
        };
        
        super(parentConfig);
        this.guid = config.guid;
        
        // Explicit assignments
        this.guid = config.guid;
        this.products = config.products;

        this.products = config.products.map((p: number) => {
            const product = _assetsMap.get(p);
            if (!product) {
                throw new Error(`Product with GUID ${p} not found in assetsMap`);
            }
            return product;
        }).filter((p: any) => p != null && p instanceof Product);
    }
}

/**
 * Represents a buff that can be applied to buildings/factories
 * Provides modifiers for productivity, workforce, and additional outputs
 */
export class Buff extends NamedElement {
    public guid: number;
    public isStackable: boolean;
    public workforceModifierInPercent: number;
    public productivityUpgrade: number;
    public fuelDurationPercent: number;
    public replaceInputs: {
        oldInput: Product;
        newInput: Product;
    }[];
    public replaceWorkforce?: {
        newWorkforce: Workforce;
        oldWorkforce: Workforce;
    };
    public workforceMaintenanceFactorUpgrade: number;
    public additionalOutputs: {
        product: Product;
        forceProductSameAsFactoryOutput: boolean;
        additionalOutputCycle: number;
        amount: number;
    }[];
    public additionalWorkforces?: Workforce[];

    /**
     * Creates a new Buff instance
     * @param config - Configuration object for the buff
     * @param assetsMap - Map of all available assets
     */
    constructor(config: BuildingBuffConfig, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.guid) {
            throw new Error('Buff GUID is required');
        }
        if (!config.name) {
            throw new Error('Buff name is required');
        }
        
        super(config);
        this.guid = config.guid;
        this.isStackable = config.isStackable;
        this.workforceModifierInPercent = config.workforceModifierInPercent;
        this.productivityUpgrade = config.productivityUpgrade;
        this.fuelDurationPercent = config.fuelDurationPercent;
        this.workforceMaintenanceFactorUpgrade = config.workforceMaintenanceFactorUpgrade;
        
        // Look up workforce replacements
        if (config.replaceWorkforce.oldWorkforce != 0){
            const newWorkforce = _assetsMap.get(config.replaceWorkforce.newWorkforce);
            if (!newWorkforce) {
                throw new Error(`New workforce with GUID ${config.replaceWorkforce.newWorkforce} not found in assetsMap`);
            }
            const oldWorkforce = _assetsMap.get(config.replaceWorkforce.oldWorkforce);
            if (!oldWorkforce) {
                throw new Error(`Old workforce with GUID ${config.replaceWorkforce.oldWorkforce} not found in assetsMap`);
            }
            this.replaceWorkforce = {
                newWorkforce: newWorkforce as Workforce,
                oldWorkforce: oldWorkforce as Workforce
            };
        }
        
        this.replaceInputs = []
        if (config.replaceInputs) {
            config.replaceInputs.map((output) => {
                const oldInput = _assetsMap.get(output.oldInput);
                if (!oldInput) {
                    throw new Error(`Product with GUID ${output.oldInput} not found in assetsMap`);
                }
                const newInput = _assetsMap.get(output.newInput);
                if (!newInput) {
                    throw new Error(`Product with GUID ${output.newInput} not found in assetsMap`);
                }
                return {
                    oldInput: oldInput,
                    newInput: newInput
                };
            });
        }

        // Look up products for additionalOutputs
        this.additionalOutputs = [];
        if (config.additionalOutputs) {
            this.additionalOutputs = config.additionalOutputs.map(output => {
                const product = _assetsMap.get(output.product);
                if (!product && !output.forceProductSameAsFactoryOutput) {
                    throw new Error(`Product with GUID ${output.product} not found in assetsMap`);
                }
                return {
                    product: product as Product,
                    forceProductSameAsFactoryOutput: output.forceProductSameAsFactoryOutput,
                    additionalOutputCycle: output.additionalOutputCycle,
                    amount: output.amount
                };
            }).filter(a => a != null);
        }
        
        // Look up workforce for additionalWorkforces
        if (config.additionalWorkforces) {
            this.additionalWorkforces = config.additionalWorkforces.map(workforceId => {
                const workforce = _assetsMap.get(workforceId);
                if (!workforce) {
                    throw new Error(`Workforce with GUID ${workforceId} not found in assetsMap`);
                }
                return workforce as Workforce;
            });
        }
    }
}

/**
 * Represents a patron that provides effects to buildings
 * Manages patron-specific bonuses and modifications
 */
export class Patron extends NamedElement {
    public guid: number;
    public localEffects?: {
        effect: Effect;
        milestones: any[];
    }[];
    public wonder?: Effect;

    /**
     * Creates a new Patron instance
     * @param config - Configuration object for the patron
     * @param assetsMap - Map of all available assets
     */
    constructor(config: PatronsConfig, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.guid) {
            throw new Error('Patron GUID is required');
        }
        if (!config.name) {
            throw new Error('Patron name is required');
        }

        super(config);
        this.guid = config.guid;
        
        // Look up effects for localEffects
        if (config.localEffects) {
            this.localEffects = config.localEffects.map(localEffect => {
                const effect = _assetsMap.get(localEffect.effect);
                if (!effect) {
                    throw new Error(`Effect with GUID ${localEffect.effect} not found in assetsMap`);
                }
                return {
                    effect: effect as Effect,
                    milestones: localEffect.milestones
                };
            });
        }
        
        // Look up wonder object
        if (config.wonder) {
            const wonder = _assetsMap.get(config.wonder);
            if (!wonder) {
                throw new Error(`Wonder with GUID ${config.wonder} not found in assetsMap`);
            }
            this.wonder = wonder;
        }
    }
}

/**
 * Represents an effect that can be applied to buildings
 * Manages effect-specific buffs and targeting
 */
export class Effect extends NamedElement {

    public guid: number;
    public buffGuids: number[];
    public buffs: Buff[];
    public targets: Constructible[];
    public targetGuids?: number[];
    public effectScope: string;
    public excludeEffectSourceGUID: boolean;
    public isStackable: boolean;

    public scaling: KnockoutObservable<number>;

    /**
     * Creates a new Effect instance
     * @param config - Configuration object for the effect
     * @param assetsMap - Map of all available assets
     */
    constructor(config: EffectConfig, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.guid) {
            throw new Error('Effect GUID is required');
        }
        if (!config.name) {
            throw new Error('Effect name is required');
        }
        if (!config.buffs || !Array.isArray(config.buffs)) {
            throw new Error('Effect buffs array is required');
        }

        
        super(config);
        this.guid = config.guid;
        this.effectScope = config.effectScope;
        this.excludeEffectSourceGUID = config.excludeEffectSourceGUID;
        this.buffGuids = config.buffs;
        this.buffs = []; // only for displaying
        this.targets = [];
        if(config.targets)
            this.targetGuids = config.targets;

        this.scaling = ko.observable(0);
        this.isStackable = false;
 
    }

    // for session and global buffs this method is called mutliple times on the same object
    applyBuffs(assetsMap: AssetsMap) {
        if(this.targetGuids == null)
            return;

        // Look up buffs
        const buffs = this.buffGuids.map(buffId => {
            const buff = assetsMap.get(buffId);
            if (!buff) {
                throw new Error(`Buff with GUID ${buffId} not found in assetsMap`);
            }
            if (buff.isStackable)
                this.isStackable = true;
            return buff as Buff;
        });
        if (this.buffs.length == 0)
            this.buffs = buffs;
        
        // Look up targets (Residences or Consumers/Constructibles)

        const targets = this.targetGuids.map(targetId => assetsMap.get(targetId) ).filter(t => isConstructible(t));
        if (this.targets.length == 0)
            this.targets = targets;

        for (const target of targets)
            for (const buff of buffs)
                new AppliedBuff(this, buff, target, assetsMap) // constructor stores created object in target
    }
}

/**
 * Represents an item that can be equipped to factories
 * Provides bonuses and modifications to factory production
 */
export class Item extends NamedElement {
    public guid: number;
    public additionalOutputs: Map<Product, number>;
    public replacements?: Map<Product, Product>;
    public replacementArray?: {old: Product, new: Product}[];
    public factories: Constructible[];
    public extraGoods?: Product[];
    public availableExtraGoods?: KnockoutComputed<Product[]>;
    public replacingWorkforce?: Workforce;
    public equipments: AppliedBuff[];
    public availableEquipments: KnockoutObservableArray<AppliedBuff>;
    public checked: KnockoutComputed<boolean>;
    public visible: KnockoutComputed<boolean>;

    /**
     * Creates a new Item instance
     * @param config - Configuration object for the item
     * @param assetsMap - Map of all available assets
     * @param region - The region this item belongs to
     */
    constructor(config: ItemConfig, _assetsMap: AssetsMap, _region: Region) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('Item name is required');
        }
        if (!config.guid) {
            throw new Error('Item GUID is required');
        }
        if (!config.targets || !Array.isArray(config.targets)) {
            throw new Error('Item targets array is required');
        }

       
        super(config);
        
        // Explicit assignments
        this.guid = config.guid;
        this.additionalOutputs = new Map<Product, number>();

        this.factories = (config.targets || []).map((f: number) => _assetsMap.get(f)).filter((f: any) => isConstructible(f)); // ignore not considered buildings, e.g. warehouse

        this.equipments = [];
        for (const b of config.buffs){
            const buff = _assetsMap.get(b);
            if (!buff) {
                throw new Error(`Buff with GUID ${b} not found in assetsMap for item ${this.name()} ${this.guid}`);
            }

            for (const f of this.factories){
                this.equipments.push(new AppliedBuff(this, buff, f, _assetsMap, false));
            }

        }
        this.availableEquipments = ko.pureComputed(() => this.equipments.filter((e: AppliedBuff) => e.available()));

        this.checked = ko.pureComputed({
            read: () => {
                for (var eq of this.equipments)
                    if (!eq.scaling())
                        return false;

                return true;
            },
            write: (checked: boolean) => {
                this.equipments.forEach(e => e.scaling(checked ? 1 : 0));
            }
        });

        this.visible = ko.computed(() => {
            if (!this.available() || this.availableEquipments().length == 0)
                return false;

            if (this.availableExtraGoods && this.availableExtraGoods().length == 0)
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            for (var f of this.factories)
                if (f.island.region === region)
                    return true;

            return false;
        });
    }
}


/**
 * Represents an item equipped to a specific factory
 * Manages the relationship between items and factories
 */
export class AqueductBuff {
    public target: Constructible;
    public buff: Buff;
    public productivityUpgrade: KnockoutObservable<number>;
    public available: KnockoutComputed<boolean>;
    public visible: KnockoutComputed<boolean>;
    public scaling: KnockoutObservable<number>;


    /**
     * Creates a new EquippedItem instance
     * @param config - Configuration object for the equipped item
     * @param assetsMap - Map of all available assets
     */
    constructor(buff: Buff, factory: Constructible, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!buff) {
            throw new Error('AppliedBuff buff is required');
        }
        if (!factory) {
            throw new Error('AppliedBuff factory is required');
        }
        
        // Explicit assignments
        this.target = factory;
        this.buff = buff;
        this.scaling = ko.observable(0); // indicates wheter item/effect is not applied (0), applied (1), multiple times applied (> 1); child class updates this value


        this.productivityUpgrade = ko.pureComputed(() => {
            return this.scaling() * this.buff.productivityUpgrade;
        });

 
        this.available = ko.pureComputed(() => {
            return this.target.available() && this.buff.available();
        });

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            return this.target.island.region === region;
        });

    }
}




/**
 * Manages a list of extra goods production for a factory
 * Handles the collection and calculation of additional goods production
 */
export class ExtraGoodProductionList {
    public factory: Factory;
    public checked: KnockoutObservable<boolean>;
    public selfEffecting: KnockoutObservableArray<ExtraGoodProduction>;
    public entries: KnockoutObservableArray<ExtraGoodProduction>;
    public nonZero: KnockoutComputed<ExtraGoodProduction[]>;
    public amount: KnockoutComputed<number>;
    public amountWithSelf: KnockoutComputed<number>;

    /**
     * Creates a new ExtraGoodProductionList instance
     * @param factory - The factory this list belongs to
     */
    constructor(factory: Factory) {
        if (!factory) {
            throw new Error('ExtraGoodProductionList factory is required');
        }

        this.factory = factory;

        this.checked = ko.observable(true);
        this.selfEffecting = ko.observableArray();

        this.entries = ko.observableArray();
        this.nonZero = ko.computed(() => {
            return this.entries().filter((i: any) => i.amount());
        });
        this.amount = ko.computed(() => {
            var total = 0;
            for (var i of (this.entries() || []))
                if (this.selfEffecting.indexOf(i) == -1) // self effects considered in factory.extraGoodFactor
                    total += i.amount();

            return total;
        });
        this.amountWithSelf = ko.computed(() => {
            var total = 0;
            for (var i of (this.entries() || []))
                total += i.amount();

            return total;
        });
    }
} 