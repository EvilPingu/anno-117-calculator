import { NamedElement, Option, EPSILON } from './util';

declare const ko: any;
declare const view: any;
declare const $: any;

// Temporary type definitions until full conversion
interface Factory {
    available(): boolean;
    outputAmount(): number;
    region: any;
    add(demand: any): void;
    remove(demand: any): void;
    getOutputs(): any[];
    items: any[];
    extraGoodProductionList: ExtraGoodProductionList;
    clipped?: any;
    inputAmount(): number;
}

interface Region {
    // Placeholder until converted
}

/**
 * Represents a product that can be produced by factories
 * Manages production relationships and factory assignments
 */
export class Product extends NamedElement {
    public producers: number[];
    public mainFactory: Factory | null;
    public isAbstract: boolean;
    public factories: Factory[];
    public availableFactories: any;
    public fixedFactory: any;
    public visible: any;

    /**
     * Creates a new Product instance
     * @param config - Configuration object for the product
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('Product name is required');
        }
        if (!config.guid) {
            throw new Error('Product GUID is required');
        }
        if (!config.producers || !Array.isArray(config.producers)) {
            throw new Error('Product producers array is required');
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
        this.producers = config.producers;
        this.mainFactory = config.mainFactory || null;
        this.isAbstract = config.isAbstract || false;

        this.factories = this.producers.map((p: number) => _assetsMap.get(p.toString())).filter((p: any) => !!p);
        this.availableFactories = ko.pureComputed(() => this.factories.filter((f: Factory) => f.available()));

        this.fixedFactory = ko.observable(null);
        // this.mainFactory is already a Factory object, not a string key
        // if (this.mainFactory)
        //     this.mainFactory = assetsMap.get(this.mainFactory);

        if (this.producers && this.factories.length) {
            //this.amount = ko.computed(() => this.factories.map(f => f.outputAmount()).reduce((a, b) => a + b));
            //this.lockDLCIfSet(this.amount); // if routes sum up to exactly zero, usage might still end up at 0.
        }

        this.visible = ko.pureComputed(() => this.available());
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
    constructor(config: any, _assetsMap: Map<string, any>) {
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
        this.isAbstract = config.isAbstract || false;
    }
}

/**
 * Represents a product that doesn't require a factory to produce
 * Used for goods obtained through other means (e.g., trade, special buildings)
 */
export class NoFactoryProduct extends NamedElement {
    public guid: string;
    public residentsInputFactor: number;
    public needs: any;
    public amount: any;
    public residentsInput: any;
    public visible: any;

    /**
     * Creates a new NoFactoryProduct instance
     * @param config - Configuration object for the product
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('NoFactoryProduct name is required');
        }
        if (!config.guid) {
            throw new Error('NoFactoryProduct GUID is required');
        }
        if (typeof config.residentsInputFactor !== 'number') {
            throw new Error('NoFactoryProduct residentsInputFactor is required and must be a number');
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
        this.guid = config.guid;
        this.residentsInputFactor = config.residentsInputFactor;

        this.needs = ko.observableArray([]);
        this.amount = ko.computed(() => this.needs().map((n: any) => n.amount()).reduce((a: number, b: number) => a + b, 0));
        this.lockDLCIfSet(this.amount);

        this.residentsInput = ko.pureComputed(() => {
            return this.amount() * this.residentsInputFactor;
        });

        this.visible = ko.computed(() => {
            return this.available() && this.amount() > 0;
        });
    }

    /**
     * Adds a need to this product
     * @param need - The need to add
     */
    addNeed(need: any): void {
        this.needs.push(need);
    }
}

/**
 * Represents a demand for a product from a consumer
 * Manages the relationship between consumers and the products they need
 */
export class Demand extends NamedElement {
    public guid: string;
    public factor: number;
    public consumer: any;
    public region: any;
    public amount: any;
    public product: Product;
    public factory: any;

    /**
     * Creates a new Demand instance
     * @param config - Configuration object for the demand
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config.guid) {
            throw new Error('Demand GUID is required');
        }

        // Prepare config for parent constructor
        const parentConfig = {
            guid: config.guid,
            name: `Demand ${config.guid}`,
            locaText: config.locaText || {},
            iconPath: "",
            dlcs: []
        };
        
        super(parentConfig);
        
        // Explicit assignments
        this.guid = config.guid;
        this.factor = config.factor || 1;
        this.consumer = config.consumer || null;
        this.region = config.region || null;

        this.amount = ko.observable(0);

        this.product = _assetsMap.get(this.guid);
        if (!this.product)
            throw `No Product ${this.guid}`;
        this.factory = ko.observable(config.factory || null);

        if (this.product && this.product.fixedFactory) {
            this.updateFixedProductFactory(this.product.fixedFactory());
            this.product.fixedFactory.subscribe((f: Factory) => this.updateFixedProductFactory(f));
        }
    }

    /**
     * Updates the factory assigned to this demand
     * @param f - The factory to assign
     */
    updateFixedProductFactory(f: Factory | null): void {
        if (f == null && (this.consumer || this.region)) { // find factory in the same region as consumer
            let region = this.region || this.consumer.region;
            if (region && !(this.product.mainFactory && this.product.mainFactory.region === region)) {
                for (let fac of this.product.factories) {
                    if (fac.region === region) {
                        f = fac;
                        break;
                    }
                }
            }
        }

        if (f == null) // region based approach not successful
            f = this.product.mainFactory || this.product.factories[0];

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
        amount *= this.factor;
        if (Math.abs(this.amount() - amount) >= EPSILON)
            this.amount(amount);
    }
}

/**
 * Represents a category of products
 * Groups related products together for organization
 */
export class ProductCategory extends NamedElement {
    public guid: string;
    public products: Product[];

    /**
     * Creates a new ProductCategory instance
     * @param config - Configuration object for the category
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('ProductCategory name is required');
        }
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
        
        // Explicit assignments
        this.guid = config.guid;
        this.products = config.products;

        this.products = config.products.map((p: number) => _assetsMap.get(p.toString())).filter((p: any) => p != null && p instanceof Product);
    }
}

/**
 * Represents an item that can be equipped to factories
 * Provides bonuses and modifications to factory production
 */
export class Item extends NamedElement {
    public guid: string;
    public replaceInputs: any;
    public additionalOutputs: any;
    public replacements?: Map<string, string>;
    public replacementArray?: any[];
    public factories: Factory[];
    public extraGoods?: Product[];
    public availableExtraGoods?: any;
    public replacingWorkforce?: any;
    public equipments: EquippedItem[];
    public availableEquipments: any;
    public checked: any;
    public visible: any;

    /**
     * Creates a new Item instance
     * @param config - Configuration object for the item
     * @param assetsMap - Map of all available assets
     * @param region - The region this item belongs to
     */
    constructor(config: any, _assetsMap: Map<string, any>, _region: Region) {
        // Validate required parameters
        if (!config.name) {
            throw new Error('Item name is required');
        }
        if (!config.guid) {
            throw new Error('Item GUID is required');
        }
        if (!config.factories || !Array.isArray(config.factories)) {
            throw new Error('Item factories array is required');
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
        this.guid = config.guid;
        this.replaceInputs = config.replaceInputs || null;
        this.additionalOutputs = config.additionalOutputs || null;

        if (this.replaceInputs) {
            this.replacements = new Map();
            this.replacementArray = [];

            this.replaceInputs.forEach((r: any) => {
                if (!r.OldInput) {
                    throw new Error('ReplaceInputs must have OldInput and NewInput properties');
                }
                this.replacementArray!.push({
                    old: _assetsMap.get(r.OldInput),
                    new: _assetsMap.get(r.NewInput)
                });
                this.replacements!.set(r.OldInput, r.NewInput);
            });
        }

        this.factories = config.factories.map((f: number) => _assetsMap.get(f.toString())).filter((f: any) => !!f);

        if (config.additionalOutputs) {
            this.extraGoods = [];
            for (var p of config.additionalOutputs) {
                if (p.ForceProductSameAsFactoryOutput)
                    for (var f of this.factories)
                        this.extraGoods!.push(_assetsMap.get(f.getOutputs()[0].Product));
                else {
                    p = _assetsMap.get(p.Product);
                    if (p)
                        this.extraGoods!.push(p);
                }
            }
            this.availableExtraGoods = ko.pureComputed(() => this.extraGoods!.filter((p: Product) => p.available()));
        }

        if (config.replacingWorkforce)
            this.replacingWorkforce = _assetsMap.get(config.replacingWorkforce);

        this.equipments =
            this.factories.map((f: Factory) => new EquippedItem({ item: this, factory: f, icon: config.iconPath, locaText: config.locaText, dlcs: config.dlcs }, _assetsMap));
        this.availableEquipments = ko.pureComputed(() => this.equipments.filter((e: EquippedItem) => e.factory.available()));

        this.checked = ko.pureComputed({
            read: () => {
                for (var eq of this.equipments)
                    if (!eq.checked())
                        return false;

                return true;
            },
            write: (checked: boolean) => {
                this.equipments.forEach(e => e.checked(checked));
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
                if (f.region === region)
                    return true;

            return false;
        });
    }
}

/**
 * Represents an item equipped to a specific factory
 * Manages the relationship between items and factories
 */
class EquippedItem extends Option {
    public item: Item;
    public factory: Factory;
    public replacements?: Map<string, string>;
    public replacementArray?: any[];
    public replacingWorkforce?: any;
    public extraGoods?: ExtraGoodProduction[];
    public visible: any;

    /**
     * Creates a new EquippedItem instance
     * @param config - Configuration object for the equipped item
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config.item) {
            throw new Error('EquippedItem item is required');
        }
        if (!config.factory) {
            throw new Error('EquippedItem factory is required');
        }

        // Prepare config for parent constructor
        const parentConfig = {
            guid: `${config.item.guid}_${config.factory.guid}`,
            name: config.item.name(),
            locaText: config.locaText || {},
            iconPath: config.icon || "",
            dlcs: config.dlcs || []
        };
        
        super(parentConfig);
        
        // Explicit assignments
        this.item = config.item;
        this.factory = config.factory;

        this.lockDLCIfSet(this.checked);

        this.replacements = config.item.replacements;
        this.replacementArray = config.item.replacementArray;
        this.replacingWorkforce = config.item.replacingWorkforce;

        if (config.item.additionalOutputs) {
            this.extraGoods = []
            for (var cfg of config.item.additionalOutputs) {
                try {
                    var config = $.extend(true, {}, cfg, { item: this, factory: this.factory });
                    this.extraGoods!.push(new ExtraGoodProduction(config, _assetsMap));
                } catch (e) { }
            }
        }

        this.factory.items.push(this);

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            return this.factory.region === region;
        });
    }
}

/**
 * Represents additional goods production from equipped items
 * Manages extra goods produced by factories with specific items
 */
class ExtraGoodProduction {
    public item: EquippedItem;
    public factory: Factory;
    public Amount: number;
    public additionalOutputCycle: number;
    public ForceProductSameAsFactoryOutput: boolean;
    public Product: number | null;
    public product: Product;
    public amount: any;

    /**
     * Creates a new ExtraGoodProduction instance
     * @param config - Configuration object for the extra good production
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: Map<string, any>) {
        // Validate required parameters
        if (!config.item) {
            throw new Error('ExtraGoodProduction item is required');
        }
        if (!config.factory) {
            throw new Error('ExtraGoodProduction factory is required');
        }
        if (typeof config.Amount !== 'number') {
            throw new Error('ExtraGoodProduction Amount is required and must be a number');
        }
        if (typeof config.AdditionalOutputCycle !== 'number') {
            throw new Error('ExtraGoodProduction AdditionalOutputCycle is required and must be a number');
        }

        // Explicit assignments
        this.item = config.item;
        this.factory = config.factory;
        this.Amount = config.Amount;
        this.additionalOutputCycle = config.AdditionalOutputCycle;
        this.ForceProductSameAsFactoryOutput = config.ForceProductSameAsFactoryOutput || false;
        this.Product = config.Product || null;

        var product = config.ForceProductSameAsFactoryOutput ? config.factory.getOutputs()[0].Product : config.Product;
        this.product = _assetsMap.get(product);
        if (!this.product)
            throw "Product " + product + " not found";

        this.amount = ko.computed(() => (this.item.checked() ? 1 : 0) * config.Amount * (this.factory.clipped && this.factory.clipped() ? 2 : 1) * this.factory.inputAmount() / this.additionalOutputCycle);

        for (var f of this.product.factories) {
            f.extraGoodProductionList.entries.push(this);

            if (f == this.factory)
                f.extraGoodProductionList.selfEffecting.push(this);
        }
    }
}

/**
 * Manages a list of extra goods production for a factory
 * Handles the collection and calculation of additional goods production
 */
export class ExtraGoodProductionList {
    public factory: Factory;
    public checked: any;
    public selfEffecting: any;
    public entries: any;
    public nonZero: any;
    public amount: any;
    public amountWithSelf: any;

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
        })
    }
} 