import { ALL_ISLANDS, setDefaultFixedFactories, NamedElement, Option, ko } from './util';
import { texts } from './i18n';
import { 
    RegionConfig, 
    SessionConfig, 
    AssetsMap, 
    GameParams,
} from './types';

import { Workforce, ResidenceBuilding, PopulationLevel } from './population';
import { NoFactoryProduct, Product, MetaProduct, Item, ProductCategory } from './production';
import { PublicConsumerBuilding, Module, Factory, Consumer, Buff } from './factories';
import { ResidenceEffectView } from './views';
import { RecipeList, ResidenceEffect } from './consumption';

declare const $: any;
declare const view: any;
declare const window: any;
declare const params: any;
declare const localStorage: any;


/**
 * Manages persistent storage for island data
 * Handles saving and loading of configuration data to/from localStorage
 */
class Storage {
    public key: string;
    public json: Record<string, any>;
    public map: Map<string, any>;
    public savingScheduled: boolean;
    public length: number;

    /**
     * Creates a new Storage instance
     * @param key - The localStorage key for this storage instance
     */
    constructor(key: string) {
        // Validate required parameters
        if (!key) {
            throw new Error('Storage key is required');
        }

        // Explicit assignments
        this.key = key;
        var text = localStorage.getItem(key);
        this.json = text ? JSON.parse(text) : {};
        this.map = new Map();

        this.savingScheduled = false;

        this.length = 0;
        for (var attr in this.json) {
            this.length = this.length + 1;
            this.map.set(attr, this.json[attr]);
        }
    }

    /**
     * Sets an item in the storage
     * @param itemKey - The key for the item
     * @param value - The value to store
     */
    setItem(itemKey: string, value: any): void {
        this.map.set(itemKey, value);

        if (this.json[itemKey] == null)
            this.length = this.length + 1;

        this.json[itemKey] = value;
        this.save();
    }

    /**
     * Gets an item from the storage
     * @param itemKey - The key for the item
     * @returns The stored value
     */
    getItem(itemKey: string): any {
        return this.map.get(itemKey);
    }

    /**
     * Removes an item from the storage
     * @param itemKey - The key for the item to remove
     */
    removeItem(itemKey: string): void {
        this.map.delete(itemKey);

        if (this.json[itemKey] != null)
            this.length = this.length - 1;

        delete this.json[itemKey];
        this.save();
    }

    /**
     * Gets the key at the specified index
     * @param index - The index of the key to retrieve
     * @returns The key at the specified index or null
     */
    getKey(index: number): string | null {
        var i = 0;
        for (let attr in this.json)
            if (i++ == index)
                return attr;

        return null;
    }

    /**
     * Updates the storage key and migrates data
     * @param key - The new key for this storage
     */
    updateKey(key: string): void {
        localStorage.removeItem(this.key);
        this.key = key;
        this.save();
    }

    /**
     * Clears all data from the storage
     */
    clear(): void {
        this.json = {}
        this.map = new Map();
        this.save();
        this.length = 0;
    }

    /**
     * Saves the current data to localStorage
     * Uses debouncing to prevent excessive writes
     */
    save(): void {
        if (this.savingScheduled)
            return;

        this.savingScheduled = true;
        setTimeout(() => {
            this.savingScheduled = false;
            localStorage.setItem(this.key, JSON.stringify(this.json, null, 4));            
        }, 0);
    }
}

/**
 * Represents a region in the game: all sessions of a region have the same products, factories, residences.
 */
export class Region extends NamedElement {
    constructor(config: RegionConfig) {
        // Use locaText.englisch as the name if available, otherwise use a fallback
        const regionConfig = {
            ...config,
            name: config.locaText?.englisch || config.name || 'Unknown Region'
        };
        
        super(regionConfig);
    }
}

export class Session extends NamedElement {
    public region: Region | null;
    public islands: KnockoutObservableArray<Island>;
    public workforce: Workforce[] = [];
    
    constructor(config: SessionConfig, assetsMap: AssetsMap) {
        // Validate config before calling super
        if (!config) {
            throw new Error('Session config is required');
        }
        if (!config.guid) {
            console.error('Session config missing guid:', config);
            throw new Error('Session config.guid is required');
        }
        
        // Use locaText.englisch as the name if available, otherwise use a fallback
        const sessionConfig = {
            ...config,
            name: config.locaText?.englisch || config.name || 'Unknown Session'
        };
        
        super(sessionConfig);
        this.region = config.region ? assetsMap.get(parseInt(config.region)) : null;
        this.islands = ko.observableArray([]);
    }
    
        /**
     * Adds an island to this session
     * @param {Island} isl - The island to add
     */
    addIsland(island: Island): void {
        this.islands.push(island);
    }

        /**
     * Removes an island from this session
     * @param {Island} isl - The island to remove
     */
        deleteIsland(isl: Island): void {
            this.islands.remove(isl);
        }
}

export class IslandManager {
    public allIslands: Island;
    public showIslandOnCreation: Option;
    public islandNameInput: KnockoutObservable<string>;
    public availableSessions: KnockoutComputed<Session[]>;
    public sessionInput: KnockoutObservable<Session>;
    public renameIsland: KnockoutObservable<Island>;
    public islandExists: KnockoutObservable<boolean>;
    public params: GameParams;
    public currentIslandSubscription: KnockoutComputed<void>;
    
    constructor(params: GameParams, isFirstRun: boolean) {
        // Explicit assignments
        const islandKey = "islandName";
        const islandsKey = "islandNames";

        // Create the showIslandOnCreation option
        this.showIslandOnCreation = new (require('./util').Option)({
            name: "Show Island on Creation",
            guid: "showIslandOnCreation",
            locaText: texts.showIslandOnCreation
        });
        this.showIslandOnCreation.checked(true);
        
        // Create other required properties
        this.islandNameInput = ko.observable();
        this.availableSessions = ko.pureComputed(() => (window as any).view.sessions.filter((s: any) => s.available()));
        this.sessionInput = ko.observable();
        this.renameIsland = ko.observable();
        this.params = params;
        
        var islandNames = [];
        if (localStorage && localStorage.getItem(islandsKey))
            islandNames = JSON.parse(localStorage.getItem(islandsKey) || '[]')

        var islandName = localStorage.getItem(islandKey);
        view.islands = ko.observableArray();
        view.island = ko.observable();

        view.island.subscribe((isl: Island) => window.document.title = isl.name());

        for (var name of islandNames) {
            var island = new Island(params, new Storage(name), false, null);
            view.islands.push(island);

            if (name == islandName)
                view.island(island);
        }

        this.sortIslands();

        var allIslands = new Island(params, localStorage, isFirstRun, null);
        this.allIslands = allIslands;
        view.islands.unshift(allIslands);
        if (!view.island())
            view.island(allIslands);


        view.islands.subscribe((islands: Island[]) => {
            let islandNames = JSON.stringify(islands.filter(i => !i.isAllIslands()).map(i => i.name()));
            localStorage.setItem(islandsKey, islandNames);
        });

        this.currentIslandSubscription = ko.computed(() => {
            var name = view.island().name();
            localStorage.setItem(islandKey, name);
        });


        // Create islandExists computed
        this.islandExists = ko.computed(() => {
            const name = this.islandNameInput();
            if (!name || name === 'All Islands' || name === (window as any).view.texts?.allIslands?.name?.())
                return true;
            return false; // Simplified for now
        });
        

    }

        /**
     * Creates a new island with the specified name and session
     * @param {string} name - The name for the new island
     * @param {Session} session - The session to create the island in
     */
        create(name: string, session: Session) {
            if (name == null) {
                if (this.islandExists())
                    return;
    
                name = this.islandNameInput();
            }
    
    
            var island = new Island(this.params, new Storage(name), true, session);
            view.islands.push(island);
            this.sortIslands();
    
            if (this.showIslandOnCreation.checked())
                view.island(island);
    

            if (name == this.islandNameInput())
                this.islandNameInput("");
        }
    
        /**
         * Deletes an island and cleans up associated data
         * @param {Island} island - The island to delete
         */
        delete(island: Island) {
            if (island == null)
                island = view.island();
    
            if (island.name() == ALL_ISLANDS || island.isAllIslands())
                return;
    
            if (view.island() == island)
                view.island(view.islands()[0]);
    
            if (view.tradeManager) {
                view.tradeManager.islandDeleted(island);
            }
    
            for (var a of island.assetsMap.values())
                if (a instanceof NamedElement)
                    a.delete();
    
            view.islands.remove(island);
            island.session.deleteIsland(island);
            if (localStorage)
                localStorage.removeItem(island.name());
    
        }
    
        /**
         * Renames an island
         * @param {Island} island - The island to rename
         * @param {string} name - The new name for the island
         */
        rename(island: Island, name: string) {
            if (this.islandExists())
                return;
    
            island.name(name);
            this.sortIslands();   
            this.islandNameInput("");
        }
    
        /**
         * Starts the rename process for an island
         * @param {Island} island - The island to rename
         */
        startRename(island: Island) {
            if (island.isAllIslands())
                return;
    
            this.renameIsland(island);
            this.islandNameInput(island.name());
            $('#island-rename-dialog').modal("show");
        }
    

    
        /**
         * Compares two names and returns a similarity score
         * @param {string} name1 - The first name to compare
         * @param {string} name2 - The second name to compare
         * @returns {number} A similarity score between 0 and 1, or NaN if not similar
         */
        compareNames(name1: string, name2: string) {
            var totalLength = Math.max(name1.length, name2.length);
            var minLcsLength = totalLength - Math.round(-0.677 + 1.51 * Math.log(totalLength));
            var lcsLength = this.lcsLength(name1, name2);
    
            if (lcsLength >= minLcsLength)
                return lcsLength / totalLength;
            else
                return NaN;
        }
    
        /**
         * Sorts the islands by session and name
         */
        sortIslands() {
            view.islands.sort((a: Island, b: Island) => {
                if (a.isAllIslands() || a.name() == ALL_ISLANDS)
                    return -Infinity;
                else if (b.isAllIslands() || b.name() == ALL_ISLANDS)
                    return Infinity;
    
                var sIdxA = view.sessions.indexOf(a.session);
                var sIdxB = view.sessions.indexOf(b.session);
    
                if (sIdxA == sIdxB) {
                    return a.name().localeCompare(b.name());
                } else {
                    return sIdxA - sIdxB;
                }
            });
        }
    

    
        /**
         * Calculates the length of the longest common subsequence between two strings
         * Used for fuzzy name matching
         * @param {string} X - The first string
         * @param {string} Y - The second string
         * @returns {number} The length of the longest common subsequence
         */
        lcsLength(X: string, Y: string) {
            var m = X.length, n = Y.length;
    
            // lookup table stores solution to already computed sub-problems
            // i.e. lookup[i][j] stores the length of LCS of substring
            // X[0..i-1] and Y[0..j-1]
            var lookup = [];
            for (var i = 0; i <= m; i++)
                lookup.push(new Array(n + 1).fill(0));
    
            // fill the lookup table in bottom-up manner
            for (var i = 1; i <= m; i++) {
                for (var j = 1; j <= n; j++) {
                    // if current character of X and Y matches
                    if (X[i - 1] == Y[j - 1])
                        lookup[i][j] = lookup[i - 1][j - 1] + 1;
    
                    // else if current character of X and Y don't match
                    else
                        lookup[i][j] = Math.max(lookup[i - 1][j], lookup[i][j - 1]);
                }
            }
    
            // LCS will be last entry in the lookup table
            return lookup[m][n];
        }
}

/**
 * Represents an island in the game world
 * Manages all buildings, population, and production on a single island
 */
class Island {
    public name: KnockoutObservable<string>;
    public isAllIslands: () => boolean;
    public storage: Storage;
    public session: Session;
    public region: Region;
    public sessionExtendedName: KnockoutComputed<string>;
    public populationLevels: PopulationLevel[];
    public residenceBuildings: ResidenceBuilding[];
    public publicServices: PublicConsumerBuilding[];
    public publicRecipeBuildings: PublicConsumerBuilding[];
    public consumers: Consumer[];
    public factories: Factory[];
    public categories: ProductCategory[];
    public multiFactoryProducts: Product[];
    public items: Item[];
    public replaceInputItems: Item[];
    public extraGoodItems: Item[];
    public recipeLists: RecipeList[];
    public workforce: Workforce[];

    public assetsMap: AssetsMap;
    public products: Product[];
    public noFactoryProducts: NoFactoryProduct[];
    public top2Population: KnockoutComputed<PopulationLevel[]>;
    public top5Factories: KnockoutComputed<Factory[]>;
    public workforceSectionVisible: KnockoutComputed<boolean>;
    public publicBuildingsSectionVisible: KnockoutComputed<boolean>;

    /**
     * Creates a new Island instance
     * @param params - Configuration parameters for the island
     * @param localStorage - Storage instance or localStorage object
     * @param isNew - Whether this is a newly created island
     * @param session - The session this island belongs to
     */
    constructor(params: GameParams, localStorage: Storage | any, isNew: boolean, session: Session | null) {
        // Validate required parameters
        if (!params) {
            throw new Error('Island params is required');
        }
        if (!localStorage) {
            throw new Error('Island localStorage is required');
        }

        // Explicit assignments
        if (localStorage instanceof Storage) {
            this.name = ko.observable(localStorage.key);
            this.name.subscribe(() => this.storage.updateKey(this.name()));
            this.isAllIslands = function () { return false; };
        } else {
            this.name = ko.computed(() => window.view.texts.allIslands.name());
            this.isAllIslands = function () { return true; };
        }
        this.storage = localStorage;

        this.session = session || this.storage.getItem("session");
        this.session = this.session instanceof Session ? this.session : view.assetsMap.get(this.session);
        this.region = this.session ? this.session.region : null as any;

        this.storage.setItem("session", this.session ? this.session.guid : null);

        var assetsMap = new Map();
        for (var key of view.assetsMap.keys())
            assetsMap.set(key, view.assetsMap.get(key));

        this.sessionExtendedName = ko.pureComputed(() => {
            if (!this.session)
                return this.name();

            return `${this.session.name()} - ${this.name()}`;
        });

        // procedures to persist inputs
        var persistBool: (obj: any, attributeName: string, storageName?: string) => void;
        var persistInt: (obj: any, attributeName: string, storageName?: string) => void;
        var persistFloat: (obj: any, attributeName: string, storageName?: string) => void;
        var persistString: (obj: any, attributeName: string, storageName?: string) => void;

        if (localStorage) {
            persistBool = (obj: any, attributeName: string, storageName?: string) => {
                var attr = obj[attributeName];
                if (attr) {
                    let id = storageName ? storageName : (obj.guid + "." + attributeName);
                    if (localStorage.getItem(id) != null)
                        attr(parseInt(localStorage.getItem(id)));

                    attr.subscribe((val: boolean) => localStorage.setItem(id, val ? "1" : "0"));
                }
            }

            persistInt = (obj: any, attributeName: string, storageName?: string) => {
                var attr = obj[attributeName];
                if (attr) {
                    let id = storageName ? storageName : (obj.guid + "." + attributeName);
                    if (localStorage.getItem(id) != null)
                        attr(parseInt(localStorage.getItem(id)));

                    attr.subscribe((val: any) => {
                        val = parseInt(val);

                        if (val == null || !isFinite(val) || isNaN(val))
                            return;

                        localStorage.setItem(id, val.toString());
                    });
                }
            }

            persistFloat = (obj: any, attributeName: string, storageName?: string) => {
                var attr = obj[attributeName];
                if (attr) {
                    let id = storageName ? storageName : (obj.guid + "." + attributeName);
                    if (localStorage.getItem(id) != null)
                        attr(parseFloat(localStorage.getItem(id)));

                    attr.subscribe((val: any) => {
                        val = parseFloat(val);

                        if (val == null || !isFinite(val) || isNaN(val))
                            return;

                        localStorage.setItem(id, val.toString());
                    });
                }
            }

            persistString = (obj: any, attributeName: string, storageName?: string) => {
                var attr = obj[attributeName];
                if (attr) {
                    let id = storageName ? storageName : (obj.guid + "." + attributeName);
                    if (localStorage.getItem(id) != null)
                        attr(localStorage.getItem(id));

                    attr.subscribe((val: string) => localStorage.setItem(id, val));
                }
            }

        } else {
            persistBool = persistFloat = persistInt = persistString = () => { };
        }

        // objects
        this.populationLevels = [];
        this.residenceBuildings = [];
        this.publicServices = [];
        this.publicRecipeBuildings = [];
        this.consumers = [];
        this.factories = [];
        this.categories = [];
        this.multiFactoryProducts = [];
        this.items = [];
        this.replaceInputItems = [];
        this.extraGoodItems = [];
        this.recipeLists = [];
        this.workforce = [];



        for (let workforce of params.workforce) {
            let w = new Workforce(workforce, assetsMap);
            assetsMap.set(w.guid, w);
            this.workforce.push(w);
        }

        for (let consumer of (params.publicServices || [])) {
            let f = new PublicConsumerBuilding(consumer, assetsMap, this as any);
            assetsMap.set(f.guid, f);
            this.consumers.push(f);
            this.publicServices.push(f);
        }

        for (let consumer of (params.publicRecipeBuildings || [])) {
            let f = new PublicConsumerBuilding(consumer, assetsMap, this as any);
            assetsMap.set(f.guid, f);
            this.consumers.push(f);
            this.publicRecipeBuildings.push(f);
        }

        for (let list of (params.recipeLists || [])) {
            if (!list.region || !this.region || list.region === this.region.guid)
                this.recipeLists.push(new RecipeList(list, assetsMap, this as any));
        }

        for (let consumer of (params.modules || [])) {
            let f = new Module(consumer, assetsMap, this as any);
            assetsMap.set(f.guid, f);
            this.consumers.push(f);
        }

        for (let buff of (params.palaceBuffs || [])) {
            let f = new Buff(buff, assetsMap);
            assetsMap.set(f.guid, f);
        }

        for (let buff of (params.setBuffs || [])) {
            let f = new Buff(buff, assetsMap);
            assetsMap.set(f.guid, f);
        }

        for (let factory of params.factories) {
            let f = new (Factory as any)(factory, assetsMap, this);
            assetsMap.set(f.guid, f);
            this.consumers.push(f);
            this.factories.push(f);

            persistBool(f, "moduleChecked", `${f.guid}.module.checked`);
            persistBool(f, "fertilizerModuleChecked", `${f.guid}.fertilizerModule.checked`);
            persistBool(f, "palaceBuffChecked", `${f.guid}.palaceBuff.checked`);
            persistBool(f, "setBuffChecked", `${f.guid}.setBuff.checked`);
            persistInt(f, "percentBoost");
            persistBool(f.extraGoodProductionList, "checked", `${f.guid}.extraGoodProductionList.checked`);
        }

        let products: Product[] = [];
        let noFactoryProducts: NoFactoryProduct[] = [];
        for (let product of params.products) {
            if (product.residentsInputFactor) {
                let p = new NoFactoryProduct(product, assetsMap);
                noFactoryProducts.push(p);
                assetsMap.set((p as any).guid, p);
            } else if (product.producers && product.producers.length) {
                let p = new Product(product, assetsMap);

                products.push(p);
                assetsMap.set((p as any).guid, p);

                if ((p as any).factories.length > 1)
                    this.multiFactoryProducts.push(p);

                if (localStorage) {
                    let id = (p as any).guid + ".fixedFactory";
                    if (localStorage.getItem(id) != null)
                        (p as any).fixedFactory(assetsMap.get(parseInt(localStorage.getItem(id))));
                    (p as any).fixedFactory.subscribe(
                        (f: Factory) => f ? localStorage.setItem(id, (f as any).guid.toString()) : localStorage.removeItem(id));
                }
            } else {
                let p = new MetaProduct(product, assetsMap);
                assetsMap.set(p.guid, p);
            }
        }

        if (isNew)
            setDefaultFixedFactories(assetsMap);

        for (let item of (params.items || [])) {
            let i = new Item(item, assetsMap, this.region);
            if (!(i as any).factories.length)
                continue;  // Affects no factories in this region

            assetsMap.set((i as any).guid, i);
            this.items.push(i);

            if ((i as any).replacements)
                this.replaceInputItems.push(i);

            if ((i as any).additionalOutputs)
                this.extraGoodItems.push(i);

            if (localStorage) {
                let oldId = (i as any).guid + ".checked";
                var oldChecked = false;
                if (localStorage.getItem(oldId) != null)
                    oldChecked = !!parseInt(localStorage.getItem(oldId));

                for (var equip of (i as any).equipments) {
                    let id = `${(equip.factory as any).guid}[${(i as any).guid}].checked`;

                    if (oldChecked)
                        equip.checked(true);

                    if (localStorage.getItem(id) != null)
                        equip.checked(!!parseInt(localStorage.getItem(id)));

                    equip.checked.subscribe((val: boolean) => localStorage.setItem(id, val ? "1" : "0"));
                }

                localStorage.removeItem(oldId);
            }
        }

        this.extraGoodItems.sort((a, b) => (a as any).name().localeCompare((b as any).name()));
        view.settings.language.subscribe(() => {
            this.extraGoodItems.sort((a, b) => (a as any).name().localeCompare((b as any).name()));
        });

        // must be set after items so that extraDemand is correctly handled
        this.consumers.forEach(f => {
            f.createWorkforceDemand(assetsMap);
            f.referenceProducts(assetsMap);
        });

        for (var building of (params.residenceBuildings || [])) {
            var b = new ResidenceBuilding(building, assetsMap, this);
            assetsMap.set(b.guid, b);
            this.residenceBuildings.push(b);
        }

        for (let level of params.populationLevels) {
            let l = new PopulationLevel(level, assetsMap, this);
            assetsMap.set(l.guid, l);
            this.populationLevels.push(l);
        }

        for (var b of this.residenceBuildings) {
            if ((b as any).upgradedBuildingGuid)
                (b as any).upgradedBuilding = assetsMap.get(parseInt((b as any).upgradedBuildingGuid));
        }

        for (let l of this.populationLevels)
            l.initBans(assetsMap);  // must be executed before loading the values for residence buildings

        for (let effect of (params.residenceEffects || [])) {
            let e = new ResidenceEffect(effect, assetsMap);
            assetsMap.set((e as any).guid, e);
            if (localStorage)
                localStorage.removeItem(`${(e as any).guid}.checked`);
        }

        for (let b of this.residenceBuildings) {
            {
                let id = `${(b as any).guid}.effectCoverage`;
                if (localStorage.getItem(id) != null)
                    (b as any).applyEffects(JSON.parse(localStorage.getItem(id)));

                (b as any).effectCoverage.subscribe(() => {
                    localStorage.setItem(id, JSON.stringify((b as any).serializeEffects()));
                });
            }
            persistInt(b, "existingBuildings");
            persistFloat(b, "limitPerHouse");
            persistInt(b, "limit");
            persistBool(b, "fixLimitPerHouse");
        }

        for (let l of this.populationLevels) {
            persistInt(l, "existingBuildings");
            persistFloat(l, "limitPerHouse");
            persistFloat(l, "amountPerHouse");
            persistInt(l, "limit");
            persistInt(l, "amount");
            persistBool(l, "fixLimitPerHouse");
            persistBool(l, "fixAmountPerHouse");
            persistString(l, "notes");

            for (let n of (l as any).needs) {
                persistBool(n, "checked", `${(l as any).guid}[${(n as any).guid}].checked`);
                persistFloat(n, "percentBoost", `${(l as any).guid}[${(n as any).guid}].percentBoost`);
                persistString(n, "notes", `${(l as any).guid}[${(n as any).guid}].notes`);
            }

            for (let n of (l as any).buildingNeeds) {
                persistBool(n, "checked", `${(l as any).guid}[${(n as any).guid}].checked`);
            }
        }

        for (var category of params.productFilter) {
            let c = new ProductCategory(category, assetsMap);
            assetsMap.set(c.guid, c);
            this.categories.push(c);
        }

        for (let p of this.categories[1].products) {
            if (p)
                for (let b of p.factories) {
                    if (b && typeof (b as any).editable === 'function') {
                        (b as any).editable(true);
                    }
                }
        }

        for (let b of this.publicRecipeBuildings) {
            if (b.goodConsumptionUpgrade)
                b.goodConsumptionUpgrade = assetsMap.get(b.goodConsumptionUpgrade);

            b.recipeName = ko.computed(() => {
                return b.name().split(':').slice(-1)[0].trim();
            });
        }

        for (let f of this.consumers) {
            persistInt(f, "existingBuildings");
            persistString(f, "notes");
            if (f.workforceDemand)
                persistInt(f.workforceDemand, "percentBoost", `${f.guid}.workforce.percentBoost`);
        }

        this.workforce = this.workforce.filter(w => w.demands().length);

        this.assetsMap = assetsMap;
        this.products = products;
        this.noFactoryProducts = noFactoryProducts;

        this.top2Population = ko.computed(() => {
            var comp = (a: PopulationLevel, b: PopulationLevel) => b.residents() - a.residents();

            return [...this.populationLevels].sort(comp).slice(0, 2).filter(l => l.residents());
        });

        this.top5Factories = ko.computed(() => {
            var useBuildings = view.settings.missingBuildingsHighlight.checked();
            var comp = useBuildings
                ? (a: Factory, b: Factory) => b.existingBuildings() - a.existingBuildings()
                : (a: Factory, b: Factory) => b.buildings() - a.buildings();

            return [...this.factories].sort(comp).slice(0, 5).filter(f => useBuildings ? f.existingBuildings() : f.buildings());
        });

        if (this.session)
            this.session.addIsland(this);

        this.workforceSectionVisible = ko.pureComputed(() => {
            for (var w of this.workforce)
                if (w.visible())
                    return true;

            return false;
        });

        this.publicBuildingsSectionVisible = ko.pureComputed(() => {
            for (var service of this.publicServices)
                if (service.visible())
                    return true;

            for (var product of this.noFactoryProducts)
                if (product.visible())
                    return true;

            for (var recipeBuilding of this.publicRecipeBuildings)
                if (recipeBuilding.visible())
                    return true;

            for (var recipeList of this.recipeLists)
                if (recipeList.visible())
                    return true;

            return false;
        });
    }

    /**
     * Resets all island data to default values
     * Clears all buildings, effects, and configurations
     */
    reset(): void {

        {
            var deletedRoutes = view.tradeManager.routes().filter((r: any) => r.to === this || r.from === this);
            deletedRoutes.forEach((r: any) => view.tradeManager.remove(r));
        }

        {
            var deletedRoutes = view.tradeManager.npcRoutes().filter((r: any) => r.to === this);
            deletedRoutes.forEach((r: any) => view.tradeManager.remove(r));
        }

        this.assetsMap.forEach(a => {
            if (a instanceof Option)
                a.checked(false);
            if (a instanceof Product)
                a.fixedFactory(null);
            if (a instanceof Consumer) {
                a.existingBuildings(0);
                if (a.workforceDemand && a.workforceDemand.percentBoost)
                    a.workforceDemand.percentBoost(100);
                if (typeof a.percentBoost === 'function')
                    a.percentBoost(100);
            }
            if (a instanceof Factory) {
                for (var m of ["module", "fertilizerModule"]) {
                    var checked = (a as any)[m + "Checked"];
                    if (typeof checked === 'function')
                        checked(false);
                }
                if (typeof a.palaceBuffChecked === 'function')
                    a.palaceBuffChecked(false);
                if (typeof a.setBuffChecked === 'function')
                    a.setBuffChecked(false);
                if (typeof a.percentBoost === 'function')
                    a.percentBoost(100);
                if (a.extraGoodProductionList && typeof a.extraGoodProductionList.checked === 'function')
                    a.extraGoodProductionList.checked(true);
            }
            if (a instanceof ResidenceBuilding) {
                a.existingBuildings(0);
                a.applyEffects({});
            }
            if (a instanceof PopulationLevel) {
                 for (var n of (a.needs || []))
                    if (n.notes)
                        n.notes("");
            }
            if (a instanceof Item) {
                a.checked(false);
                for (var i of a.equipments)
                    i.checked(false);
            }
            if (a.notes)
                a.notes("");
        });

        setDefaultFixedFactories(this.assetsMap);

        this.populationLevels.forEach(l => l.needs.forEach(n => {
            if (n.checked)
                if (n.isBonusNeed || n.excludePopulationFromMoneyAndConsumptionCalculation)
                    n.checked(false);
                else
                    n.checked(true);
        }));

        this.populationLevels.forEach(l => l.buildingNeeds.forEach(n => {
            if (n.checked)
                if (n.isBonusNeed || n.excludePopulationFromMoneyAndConsumptionCalculation)
                    n.checked(false);
                else
                    n.checked(true);
        }));
    }

    /**
     * Prepares the residence effect view for this island
     */
    prepareResidenceEffectView(): void {
        view.selectedResidenceEffectView(new ResidenceEffectView(this.residenceBuildings));
    }
    
    /**
     * Deletes an island (stub method for interface compatibility)
     * @param island - The island to delete
     */
    deleteIsland(_island: Island): void {
        // Implementation handled by IslandManager
    }
} 