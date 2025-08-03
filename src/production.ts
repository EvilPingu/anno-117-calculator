import { NamedElement, Option, EPSILON, ko, dummyObservableArray } from './util';
import {  AssetsMap } from './types';
import { ProductConfig } from './types.config';
import { Workforce } from './population';
import { Factory } from './factories';
import { Region, Constructible } from './world';


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
    public factor: number;
    public consumer: Constructible;
    public amount: KnockoutObservable<number>;
    public product: Product;
    public factory: KnockoutObservable<Factory>;

    /**
     * Creates a new Demand instance
     * @param config - Configuration object for the demand
     * @param assetsMap - Map of all available assets
     */
    constructor(product: Product, consumer: Constructible,  _assetsMap: AssetsMap, factor: number = 1) {

        this.factor = factor || 1;
        this.product = product;
        this.consumer = consumer;

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
            let region = this.consumer.island.region;
            if (region) {
                for (let fac of this.product.factories) {
                    if (fac.island.region === region) {
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
 * Represents an item that can be equipped to factories
 * Provides bonuses and modifications to factory production
 */
export class Item extends NamedElement {
    public additionalOutputs: Map<Product, number>;
    public replacements?: Map<Product, Product>;
    public replacementArray?: {old: Product, new: Product}[];
    public factories: Factory[];
    public extraGoods?: Product[];
    public availableExtraGoods?: KnockoutComputed<Product[]>;
    public replacingWorkforce?: Workforce;
    public equipments: EquippedItem[];
    public availableEquipments: KnockoutObservableArray<EquippedItem>;
    public checked: KnockoutComputed<boolean>;
    public visible: KnockoutComputed<boolean>;

    /**
     * Creates a new Item instance
     * @param config - Configuration object for the item
     * @param assetsMap - Map of all available assets
     * @param region - The region this item belongs to
     */
    constructor(config: any, _assetsMap: AssetsMap, _region: Region) {
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
        this.additionalOutputs = config.additionalOutputs || null;

        if (config.replaceInputs) {
            this.replacements = new Map();
            this.replacementArray = [];

            config.replaceInputs.forEach((r: any) => {
                if (!r.OldInput) {
                    throw new Error('ReplaceInputs must have OldInput and NewInput properties');
                }
                const oldProduct = _assetsMap.get(parseInt(r.OldInput));
                if (!oldProduct) {
                    throw new Error(`Old input product with GUID ${r.OldInput} not found in assetsMap`);
                }
                const newProduct = _assetsMap.get(parseInt(r.NewInput));
                if (!newProduct) {
                    throw new Error(`New input product with GUID ${r.NewInput} not found in assetsMap`);
                }
                this.replacementArray!.push({
                    old: oldProduct,
                    new: newProduct
                });
                this.replacements!.set(r.OldInput, r.NewInput);
            });
        }

        this.factories = config.factories.map((f: number) => {
            const factory = _assetsMap.get(f);
            if (!factory) {
                throw new Error(`Factory with GUID ${f} not found in assetsMap`);
            }
            return factory;
        }).filter((f: any) => !!f);

        if (config.additionalOutputs) {
            this.extraGoods = [];
            for (var p of config.additionalOutputs) {
                if (p.forceProductSameAsFactoryOutput)
                    for (var f of this.factories)
                        this.extraGoods!.push(f.getProduct() as Product);
                else {
                    const product = _assetsMap.get(parseInt(p.Product));
                    if (!product) {
                        throw new Error(`Product with GUID ${p.Product} not found in assetsMap`);
                    }
                    this.extraGoods!.push(product);
                }
            }
            this.availableExtraGoods = ko.pureComputed(() => this.extraGoods!.filter((p: Product) => p.available()));
        }

        if (config.replacingWorkforce) {
            const workforce = _assetsMap.get(parseInt(config.replacingWorkforce));
            if (!workforce) {
                throw new Error(`Workforce with GUID ${config.replacingWorkforce} not found in assetsMap`);
            }
            this.replacingWorkforce = workforce;
        }

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
export class EquippedItem extends Option {
    public item: Item;
    public factory: Factory;
    public replacements?: Map<Product, Product>;
    public replacementArray?: {old: Product, new: Product}[];
    public replacingWorkforce?: Workforce;
    public extraGoods?: ExtraGoodProduction[];
    public visible: KnockoutComputed<boolean>;

    /**
     * Creates a new EquippedItem instance
     * @param config - Configuration object for the equipped item
     * @param assetsMap - Map of all available assets
     */
    constructor(config: any, _assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config.item) {
            throw new Error('EquippedItem item is required');
        }
        if (!config.factory) {
            throw new Error('EquippedItem factory is required');
        }

        // Prepare config for parent constructor
        const parentConfig = {
            guid: config.item.guid + config.factory.guid,
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

        this.factory.items.push(this as any);

        this.visible = ko.pureComputed(() => {
            if (!this.available())
                return false;

            if (!view.island || !view.island())
                return true;

            var region = view.island().region;
            if (!region)
                return true;

            return this.factory.island.region === region;
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
    constructor(config: any, _assetsMap: AssetsMap) {
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
        const productObj = _assetsMap.get(parseInt(product));
        if (!productObj) {
            throw new Error(`Product with GUID ${product} not found in assetsMap`);
        }
        this.product = productObj;

        this.amount = ko.computed(() => (this.item.checked() ? 1 : 0) * config.Amount * (this.factory.clipped && this.factory.clipped() ? 2 : 1) * this.factory.inputAmount() / this.additionalOutputCycle);

        for (var f of this.product.factories) {
            if (f.extraGoodProductionList) {
                f.extraGoodProductionList.entries.push(this as any);

                if (f == this.factory)
                    f.extraGoodProductionList.selfEffecting.push(this as any);
            }
        }
    }
}

/**
 * Manages a list of extra goods production for a factory
 * Handles the collection and calculation of additional goods production
 */
export class ExtraGoodProductionList {
    public factory: Factory;
    public checked: KnockoutObservable<boolean>;
    public selfEffecting: any;
    public entries: any;
    public nonZero: any;
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
        })
    }
} 