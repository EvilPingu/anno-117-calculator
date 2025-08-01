import { createIntInput, NamedElement, ko } from './util';
import { MetaProduct, NoFactoryProduct, Product } from './production';
import { NoFactoryNeed, PopulationNeed, PublicBuildingNeed, ResidenceNeed, ResidenceEffectEntryCoverage, Need } from './consumption';
import { ResidenceEffectView } from './views';
import { 
    Island, 
    Region,
    ResidenceBuildingConfig, 
    PopulationLevelConfig, 
    WorkforceConfig,
    AssetsMap,
} from './types';

declare const view: any;

/**
 * Represents a residence building that houses population
 * Manages population counts, effects, and consumption needs
 */
export class ResidenceBuilding extends NamedElement {
    public populationLevel!: PopulationLevel;
    public residentMax: number;
    public residentsPerNeed: Map<number, number>;
    public island: Island;
    public region: Region;
    public existingBuildings: KnockoutObservable<number>;
    public allEffects: Map<string, any>;
    public effectCoverage: KnockoutObservableArray<any>;
    public panoramaCoverage: KnockoutComputed<number>;
    public entryCoveragePerProduct: KnockoutComputed<Map<any, any[]>>;
    public consumingLimit!: KnockoutComputed<number>;
    public needsMap!: Map<number, Need|PublicBuildingNeed>;
    public residenceNeedsMap: Map<number, any> | null;
    public residents: KnockoutComputed<number>;
    public residentsInput: KnockoutObservable<number>;
    public upgradedBuildingGuid?: number | undefined;
    public upgradedBuilding?: ResidenceBuilding;

    /**
     * Creates a new ResidenceBuilding instance
     * @param config - Configuration object for the residence building
     * @param assetsMap - Map of all available assets
     * @param island - The island this residence belongs to
     */
    constructor(config: ResidenceBuildingConfig, assetsMap: AssetsMap, island: any) {
        // Validate required parameters
        if (!config) {
            throw new Error('ResidenceBuilding config is required');
        }
        if (!assetsMap) {
            throw new Error('ResidenceBuilding assetsMap is required');
        }
        if (!island) {
            throw new Error('ResidenceBuilding island is required');
        }

        super(config);
        
        // Explicit assignments
        this.residentMax = config.residentMax || 0;
        this.residentsPerNeed = new Map();
        this.island = island;
        this.region = config.region ? assetsMap.get(parseInt(config.region)) : null;
        this.upgradedBuildingGuid = config.upgradedBuilding;
        this.existingBuildings = createIntInput(0, 0);
        this.lockDLCIfSet(this.existingBuildings);
        this.allEffects = new Map();
        this.effectCoverage = ko.observableArray([]);
        this.residenceNeedsMap = null;
        this.residents = ko.computed(() => {
            let sum = 0;
            if (this.residenceNeedsMap) {
                for (const n of this.residenceNeedsMap.values()) {
                    if (!n.residents) {
                        console.log(n);
                    }
                    sum += n.residents();
                }
            }
            return sum;
        });
        this.residentsInput = ko.observable(0);

        // Set up computed observables
        this.panoramaCoverage = ko.pureComputed(() => {
            let sum = 0;
            for (const effect of this.effectCoverage()) {
                if (effect.residenceEffect.panoramaLevel != null) {
                    sum += effect.coverage();
                }
            }
            return sum;
        });

        // Initialize residents per need
        if (config.residentsPerNeed) {
            for (const guid in config.residentsPerNeed) {
                this.residentsPerNeed.set(parseInt(guid), config.residentsPerNeed[guid]);
            }
        }

        this.entryCoveragePerProduct = ko.pureComputed(() => {
            const result = new Map();
            for (const coverage of this.effectCoverage()) {
                for (const entry of coverage.residenceEffect.entries) {
                    if (result.has(entry.product)) {
                        result.get(entry.product).push(new ResidenceEffectEntryCoverage(coverage, entry));
                    } else {
                        result.set(entry.product, [new ResidenceEffectEntryCoverage(coverage, entry)]);
                    }
                }
            }
            return result;
        });
    }

    /**
     * Initializes needs and sets up computed observables
     * @param needsMap - Map of all needs for this residence
     */
    initializeNeeds(needsMap: Map<number, Need|PublicBuildingNeed>): void {
        this.needsMap = needsMap;
        this.consumingLimit = ko.pureComputed(() => {
            let sum = 0;
            for (const n of this.needsMap!.values()) {
                if (!n.available() || n.excludePopulationFromMoneyAndConsumptionCalculation) {
                    continue;
                }

                sum += this.existingBuildings() * (this.residentsPerNeed.get(n.guid) || 0);
                
                for (const entry of this.getConsumptionEntries(n)) {
                    sum += this.existingBuildings() * entry.getResidents();
                }
            }
            return sum;
        });

        this.residenceNeedsMap = new Map();
        this.residentsPerNeed.forEach((_, guid) => {
            const n = this.needsMap!.get(guid) as PopulationNeed; // some residence needs come from buff but have no need in population level
            if (n) {
                this.residenceNeedsMap!.set(guid, new ResidenceNeed(this, n));
            }
        });

        this.residenceNeedsMap.forEach(n => n.initDependencies(this.residenceNeedsMap!));
        this.residentsInput.subscribe(() => {
            let sum = 0;
            if (this.residenceNeedsMap) {
                for (const n of this.residenceNeedsMap.values()) {
                    if (!n.residents) {
                        console.log(n);
                    }
                    sum += n.residents();
                }
            }
            this.residentsInput(sum);
        });
    }

    /**
     * Adds an effect to this residence
     * @param effect - The effect to add
     */
    addEffect(effect: any): void {
        this.allEffects.set(effect.guid, effect);
    }

    /**
     * Adds effect coverage to this residence
     * @param effectCoverage - The effect coverage to add
     */
    addEffectCoverage(effectCoverage: any): void {
        this.effectCoverage.push(effectCoverage);
        this.sortEffectCoverage();
    }

    /**
     * Removes effect coverage from this residence
     * @param effectCoverage - The effect coverage to remove
     */
    removeEffectCoverage(effectCoverage: any): void {
        this.effectCoverage.remove(effectCoverage);
    }

    /**
     * Sorts effect coverage by priority
     */
    sortEffectCoverage(): void {
        this.effectCoverage.sort((a: any, b: any) => a.residenceEffect.compare(b.residenceEffect));
    }

    /**
     * Gets the number of residents that don't consume goods
     * @returns Number of non-consuming residents
     */
    getNoConsumptionResidents(): number {
        let residents = 0;

        for (const [guid, res] of this.residentsPerNeed) {
            const populationLevel = this.populationLevel as any;
            const need = populationLevel.needsMap?.get(guid);
            if (need && need.available() &&
                need.excludePopulationFromMoneyAndConsumptionCalculation &&
                (need.requiredBuildings == null || need.requiredBuildings.indexOf(this.guid) != -1)) {
                residents += res;
            }
        }

        return residents * this.existingBuildings();
    }

    /**
     * Gets consumption entries for a specific need
     * @param need - The need to get entries for
     * @returns Array of consumption entries
     */
    getConsumptionEntries(need: any): any[] {
        if (!(need instanceof Product)) {
            if (need instanceof ResidenceNeed) {
                need = need.need;
            }
            need = need.product;
        }

        return this.entryCoveragePerProduct().get(need) || [];
    }

    /**
     * Serializes effects to JSON for storage
     * @returns Serialized effects data
     */
    serializeEffects(): Record<string, any> {
        const coverageMap: Record<string, any> = {};
        for (const coverage of this.effectCoverage()) {
            coverageMap[coverage.residenceEffect.guid] = coverage.coverage();
        }
        return coverageMap;
    }

    /**
     * Applies effects from JSON data
     * @param _json - Serialized effects data
     */
    applyEffects(_json: Record<string, any>): void {
        // Implementation will be added when consumption module is converted
    }

    /**
     * Prepares the residence effect view for this residence building
     */
    prepareResidenceEffectView(): void {
        (window as any).view.selectedResidenceEffectView(new ResidenceEffectView([this], this.name()));
    }
}

/**
 * Represents a population level with specific needs and requirements
 * Manages population counts, needs, and building requirements
 */
export class PopulationLevel extends NamedElement {
    public residentMax: number;
    public residentsPerNeed: Map<number, number>;
    public fullHouse: number;
    public island: Island;
    public hotkey: KnockoutObservable<string | null>;
    public needs: (PublicBuildingNeed | PopulationNeed)[];
    public buildingNeeds: PublicBuildingNeed[];
    public basicNeeds: (PublicBuildingNeed | PopulationNeed)[];
    public luxuryNeeds: (PublicBuildingNeed | PopulationNeed)[];
    public lifestyleNeeds: (PublicBuildingNeed | PopulationNeed)[];
    public needsMap: Map<number, Need|PublicBuildingNeed>;
    public region?: Region;
    public allResidences: ResidenceBuilding[];
    public notes: KnockoutObservable<string>;
    public existingBuildings: KnockoutComputed<number>;
    public residents: KnockoutComputed<number>;
    public residentsInput: KnockoutComputed<string>;
    public visible: KnockoutComputed<boolean>;
    public hasBonusNeeds: KnockoutComputed<boolean>;
    public floorsSummedExistingBuildings?: KnockoutComputed<number>;
    public canEditPerHouse?: KnockoutComputed<boolean>;
    public skyscraperLevels?: ResidenceBuilding[];
    public specialResidence?: ResidenceBuilding;
    public residence: ResidenceBuilding;
    public availableResidences?: KnockoutComputed<any[]>;
    public canEdit?: KnockoutComputed<boolean>;
    public hasSkyscrapers?: () => boolean;
    public getFloorsSummedExistingBuildings?: () => number;

    /**
     * Creates a new PopulationLevel instance
     * @param config - Configuration object for the population level
     * @param assetsMap - Map of all available assets
     * @param island - The island this population level belongs to
     */
    constructor(config: PopulationLevelConfig, assetsMap: AssetsMap, island: any) {
        // Validate required parameters
        if (!config) {
            throw new Error('PopulationLevel config is required');
        }
        if (!assetsMap) {
            throw new Error('PopulationLevel assetsMap is required');
        }
        if (!island) {
            throw new Error('PopulationLevel island is required');
        }

        super(config);
        
        // Explicit assignments
        this.residentMax = config.residentMax || 0;
        this.residentsPerNeed = config.residentsPerNeed || new Map();
        this.fullHouse = config.fullHouse;
        this.island = island;
        this.hotkey = ko.observable(null);
        this.needs = [];
        this.buildingNeeds = [];
        this.basicNeeds = [];
        this.luxuryNeeds = [];
        this.lifestyleNeeds = [];
        this.needsMap = new Map();
        this.region = config.region ? assetsMap.get(config.region) : null;
        this.allResidences = [];
        this.notes = ko.observable("");

        // Initialize residences
        //if (config.residence) {
            this.residence = assetsMap.get(config.residence);
            this.residence.populationLevel = this;
            this.allResidences.push(this.residence);
        //}

        if (config.skyscraperLevels) {
            this.skyscraperLevels = config.skyscraperLevels.map(l => assetsMap.get(l));
            this.skyscraperLevels.forEach(l => l.populationLevel = this);
            this.allResidences = this.allResidences.concat(this.skyscraperLevels);
        }

        if (config.specialResidence) {
            this.specialResidence = assetsMap.get(config.specialResidence);

            if(this.specialResidence){
                this.specialResidence.populationLevel = this;
                this.allResidences.push(this.specialResidence);
            }
        }

        this.availableResidences = ko.pureComputed(() => this.allResidences.filter(r => r.available()));

        this.canEdit = ko.pureComputed(() => {
            for (let i = 1; i < this.allResidences.length; i++) {
                if (this.allResidences[i].existingBuildings() > 0) {
                    return false;
                }
            }
            return true;
        });

        this.existingBuildings = ko.computed({
            read: () => {
                let sum = 0;
                for (const r of this.allResidences) {
                    sum += r.existingBuildings();
                }
                return sum;
            },
            write: (val: number) => {
                if (this.canEdit && this.canEdit()) {
                    this.residence.existingBuildings(val);
                }
            }
        });

        // Set up needs
        if (config.needs) {
            config.needs.forEach(n => {
                let need: PublicBuildingNeed | PopulationNeed;
                const product = assetsMap.get(n.guid);

                if (n.tpmin && n.tpmin > 0 && product && !(product instanceof MetaProduct)) {
                    need = product instanceof NoFactoryProduct ? new NoFactoryNeed(n, this, assetsMap) : new PopulationNeed(n, this, assetsMap);
                    this.needs.push(need);
                } else {
                    need = new PublicBuildingNeed(n, this, assetsMap);
                    this.buildingNeeds.push(need);
                }

                if (n.isBonusNeed || n.excludePopulationFromMoneyAndConsumptionCalculation) {
                    need.checked(false);
                    for (const dlc of (need.dlcs || [])) {
                        dlc.checked.subscribe((checked: boolean) => {
                            if (!checked) {
                                need.checked(false);
                            }
                        });
                    }
                    this.lifestyleNeeds.push(need);
                    this.needsMap.set(need.guid, need);
                    return;
                }

                if (n.residents || n.requiredFloorLevel) {
                    this.basicNeeds.push(need);
                } else {
                    this.luxuryNeeds.push(need);
                }
                this.needsMap.set(need.guid, need);
            });
        }

        this.hasBonusNeeds = ko.pureComputed(() => {
            for (const n of this.lifestyleNeeds || []) {
                if (!n.hidden()) {
                    return true;
                }
            }
            return false;
        });

        this.allResidences.forEach(r => r.initializeNeeds(this.needsMap));

        this.residents = ko.pureComputed(() => {
            let sum = 0;
            for (const r of this.allResidences) {
                sum += r.residents();
            }
            return sum;
        });

        this.residentsInput = ko.pureComputed({
            read: () => (window as any).formatNumber(this.residents()),
            write: (val: string) => {
                const numVal = parseInt(val.replace(/[^\d]/g, ""));
                if (!this.canEdit || !this.canEdit() || !isFinite(numVal) || numVal < 0) {
                    this.residentsInput.notifySubscribers();
                    return;
                }
                
                let perHouse = 0;

                if (this.residence.residenceNeedsMap) {
                    for (const n of this.residence.residenceNeedsMap.values()) {
                        if (n.need.residentsUnlockCondition && numVal < n.need.residentsUnlockCondition) {
                            continue;
                        }

                    const fulfillment = n.need.checked() ? 1 : n.substitution();

                    perHouse += fulfillment * (this.residence.residentsPerNeed.get(n.need.guid) || 0);
                    for (const c of this.residence.getConsumptionEntries(n)) {
                        const coverage = c.residenceEffectCoverage.coverage();
                        perHouse += coverage * fulfillment * (c.residenceEffectEntry.residents || 0);
                    }
                    }
                }

                const buildings = Math.round(numVal / perHouse);
                if (buildings !== this.residence.existingBuildings()) {
                    this.residence.existingBuildings(buildings);
                } else {
                    this.residentsInput.notifySubscribers();
                }
            }
        }).extend({ deferred: true });

        if (this.skyscraperLevels || this.specialResidence) {
            this.getFloorsSummedExistingBuildings = () => {
                const specialResidence = this.specialResidence ? this.specialResidence.existingBuildings() : 0;
                const levelSum = this.skyscraperLevels ? this.skyscraperLevels.map(s => s.existingBuildings()).reduce((a, b) => a + b) : 0;
                return specialResidence + levelSum;
            };
            this.floorsSummedExistingBuildings = ko.computed(() => this.getFloorsSummedExistingBuildings ? this.getFloorsSummedExistingBuildings() : 0);

            this.hasSkyscrapers = () => this.getFloorsSummedExistingBuildings ? this.getFloorsSummedExistingBuildings() > 0 : false;

            this.canEditPerHouse = ko.pureComputed(() => {
                return !(this.hasSkyscrapers && this.hasSkyscrapers()) && !(this.specialResidence && this.specialResidence.existingBuildings());
            });
        } else {
            this.hasSkyscrapers = () => false;
            this.canEditPerHouse = ko.pureComputed(() => true);
        }

        this.visible = ko.pureComputed(() => {
            if (!this.available()) {
                return false;
            }

            if (!(window as any).view.island || !(window as any).view.island()) {
                return true;
            }

            const region = (window as any).view.island().region;
            if (!region) {
                return true;
            }

            return this.region === region;
        });
    }

    /**
     * Initializes bans for this population level
     * @param assetsMap - Map of all available assets
     */
    initBans(assetsMap: AssetsMap): void {
        for (const n of this.needs.concat(this.buildingNeeds)) {
            n.initBans(this, assetsMap);
        }
    }

    /**
     * Gets the number of residents that don't consume goods
     * @returns Number of non-consuming residents
     */
    getNoConsumptionResidents(): number {
        let residents = 0;
        for (const r of this.allResidences) {
            residents += r.getNoConsumptionResidents();
        }
        return residents;
    }

    /**
     * Increments the population amount
     */
    incrementAmount(): void {
        // Since residents is computed, we need to update the underlying residences
        // This is a simplified approach - in practice, you'd update the specific residence
        console.log('Increment amount called - residents is computed from residences');
    }

    /**
     * Decrements the population amount
     */
    decrementAmount(): void {
        // Since residents is computed, we need to update the underlying residences
        // This is a simplified approach - in practice, you'd update the specific residence
        console.log('Decrement amount called - residents is computed from residences');
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

            for (const r of this.allResidences) {
                if (isl.assetsMap.has(r.guid)) {
                    isl.assetsMap.get(r.guid).applyEffects(r.serializeEffects());
                }
            }

            for (const guid of this.needsMap.keys()) {
                other.needsMap.get(guid).checked((this.needsMap.get(guid) as PopulationNeed|PublicBuildingNeed).checked());
            }
        }
    }

    /**
     * Prepares the residence effect view for display
     * @param need - Optional specific need to focus on
     */
    prepareResidenceEffectView(need: any = null): void {
        let heading = this.name();
        if (need) {
            heading = ko.pureComputed(() => this.name() + ": " + need.product.name());
        }
        (window as any).view.selectedResidenceEffectView(new ResidenceEffectView(this.allResidences, heading, need));
    }
}



/**
 * Represents a workforce that can be assigned to factories
 */
export class Workforce extends NamedElement{
    public demands: KnockoutObservableArray<any>;
    public amount: KnockoutComputed<number>;
    public visible: KnockoutComputed<boolean>;

    /**
     * Creates a new Workforce instance
     * @param config - Configuration object for the workforce
     * @param assetsMap - Map of all available assets
     */
    constructor(config: WorkforceConfig, assetsMap: AssetsMap) {
        // Validate required parameters
        if (!config) {
            throw new Error('Workforce config is required');
        }
        if (!assetsMap) {
            throw new Error('Workforce assetsMap is required');
        }

        super(config);
        
        // Explicit assignments
        this.demands = ko.observableArray([]);

        this.amount = ko.pureComputed(() => {
            let sum = 0;
            for (const d of this.demands()) {
                sum += d.amount();
            }
            return sum;
        });

        this.visible = ko.pureComputed(() => {
            if (!this.available()) {
                return false;
            }
            return this.amount() != 0;
        });
    }

    /**
     * Adds a demand to this workforce
     * @param demand - The demand to add
     */
    add(demand: any): void {
        this.demands.push(demand);
    }

    /**
     * Removes a demand from this workforce
     * @param demand - The demand to remove
     */
    remove(demand: any): void {
        this.demands.remove(demand);
    }
}

/**
 * Manages the relationship between factories and their workforce requirements
 */
export class WorkforceDemand {
    public factory: any;
    public amountPerBuilding: number;
    public percentBoost: KnockoutObservable<number>;
    public amount: KnockoutObservable<number>;
    public workforce: KnockoutObservable<any>;
    public defaultWorkforce: any;
    public buildings: number;

    /**
     * Creates a new WorkforceDemand instance
     * @param factory - The factory that requires this workforce
     * @param workforce - The workforce type
     * @param amount - Amount of workforce per building
     * @param percentBoost - Percentage boost for the workforce
     */
    constructor(factory: any, workforce: any, amount: number, _percentBoost: number) {
        // Validate required parameters
        if (!factory) {
            throw new Error('WorkforceDemand factory is required');
        }
        if (!workforce) {
            throw new Error('WorkforceDemand workforce is required');
        }

        // Explicit assignments
        this.factory = factory;
        this.amountPerBuilding = amount || 0;
        this.percentBoost = createIntInput(100, 0);
        this.amount = ko.observable(0);
        this.workforce = ko.observable(workforce);
        this.defaultWorkforce = workforce;
        this.buildings = 0;

        this.percentBoost.subscribe(() => {
            this.updateAmount(this.buildings);
        });

        this.workforce().add(this);
    }

    /**
     * Updates the workforce assignment
     * @param workforce - The new workforce to assign
     */
    updateWorkforce(workforce: any = null): void {
        if (workforce == null) {
            workforce = this.defaultWorkforce;
        }

        if (workforce !== this.workforce()) {
            this.workforce().remove(this);
            this.workforce(workforce);
            this.workforce().add(this);
        }
    }

    /**
     * Updates the amount based on the number of buildings
     * @param buildings - Number of buildings
     */
    updateAmount(buildings: number): void {
        this.buildings = buildings;

        const perBuilding = Math.ceil(this.amountPerBuilding * this.percentBoost() / 100);
        this.amount(Math.ceil(buildings) * perBuilding);
    }
} 