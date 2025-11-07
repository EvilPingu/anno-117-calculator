import { ko } from './util';
import { Product } from './production';
import { Island } from './world';
import { Factory } from './factories';

/**
 * Supplier interface - represents any source that can provide a product
 * Implemented by Factory, TradeRoute, PassiveTradeSupplier, and ExtraGoodSupplier
 */
export interface Supplier {
    // Identification
    readonly type: 'factory' | 'trade_route' | 'passive_trade' | 'extra_good';
    readonly product: Product | null;

    // Production capabilities
    defaultProduction(): number;           // Current/baseline production amount
    canSupply(amount: number): boolean;    // Can this supplier fulfill amount?

    // Demand integration
    setDemand(amount: number): void;       // Request supplier to produce/import amount
}

/**
 * Type guard to check if an object implements the Supplier interface
 */
export function isSupplier(obj: any): obj is Supplier {
    return obj != null &&
        typeof obj.type === 'string' &&
        (obj.type === 'factory' || obj.type === 'trade_route' || obj.type === 'passive_trade' || obj.type === 'extra_good') &&
        obj.product instanceof Product &&
        obj.island instanceof Island &&
        typeof obj.defaultProduction === 'function' &&
        typeof obj.canSupply === 'function' &&
        typeof obj.setDemand === 'function';
}

/**
 * PassiveTradeSupplier - "Joker" supplier that fulfills demand without generating upstream demands
 * Useful for representing external sources or simplified scenarios
 */
export class PassiveTradeSupplier implements Supplier {
    public readonly type: 'passive_trade' = 'passive_trade';
    public readonly product: Product;
    public readonly island: Island;
    public amount: KnockoutObservable<number>;

    /**
     * Creates a new PassiveTradeSupplier instance
     * @param product - The product this supplier provides
     * @param island - The island this supplier operates on
     */
    constructor(product: Product, island: Island) {
        if (!product) {
            throw new Error('PassiveTradeSupplier product is required');
        }
        if (!island) {
            throw new Error('PassiveTradeSupplier island is required');
        }

        this.product = product;
        this.island = island;
        this.amount = ko.observable(0);
    }

    /**
     * Only used if needed
     */
    defaultProduction(): number {
        return 0;
    }

    /**
     * Passive trade can always supply any amount (user responsibility)
     */
    canSupply(_amount: number): boolean {
        return true;
    }

    /**
     * Passive trade doesn't propagate demand - user sets amount manually
     */
    setDemand(_amount: number): void {
        // No-op: passive trade doesn't respond to demand
    }
}

/**
 * ExtraGoodSupplier - Represents extra good production from items
 * Contains filtered list of ExtraGoodProduction entries where factory produces extra of its own output
 * (i.e., factory and product are identical, but AppliedBuff can differ)
 */
export class ExtraGoodSupplier implements Supplier {
    public readonly type: 'extra_good' = 'extra_good';
    public readonly factory: Factory;
    public readonly product: Product; // Extra good product
    public readonly island: Island;
    public productionList: any[]; // ExtraGoodProduction[] - filtered entries where factory outputs this product

    /**
     * Creates a new ExtraGoodSupplier instance
     * @param product - The product this supplier provides
     * @param island - The island this supplier operates on
     */
    constructor(factory: Factory, extraGood: Product, island: Island) {
        if (!factory) {
            throw new Error('ExtraGoodSupplier factory is required');
        }
        if (!extraGood) {
            throw new Error('ExtraGoodSupplier product is required');
        }
        if (!island) {
            throw new Error('ExtraGoodSupplier island is required');
        }

        this.factory = factory;
        this.product = extraGood;        
        this.island = island;
        this.productionList = []; // Will be populated by ExtraGoodProduction entries
    }

    private getTotalRatio(): number {
        let totalRatio = 0;
        for (const entry of this.productionList) {
            if (entry && entry.item && entry.factory) {
                const scaling = typeof entry.item.scaling === 'function' ? entry.item.scaling() : entry.item.scaling;
                totalRatio += (scaling * entry.defaultAmount) / entry.additionalOutputCycle;
            }
        }
        return totalRatio;
    }

    /**
     * Returns the total amount from all extra goods production entries
     * Sum of all ExtraGoodProduction.amount() in the list
     */
    defaultProduction(): number {
        let total = 0;
        for (const entry of this.productionList) {
            if (entry && typeof entry.amount === 'function') {
                total += entry.amount();
            }
        }
        return total;
    }

    /**
     * Extra supplier can supply if there is at least one extra good production active.
     */
    canSupply(amount: number): boolean {
        return this.getTotalRatio() > 0;
    }

    /**
     * Sets demand for extra goods production by increasing factory production
     * Calculates required factory inputAmount to meet extra good production target
     * @param amount - Requested extra good production amount
     */
    setDemand(amount: number): void {
        if (amount <= 0 || this.productionList.length === 0) return;

        // Calculate the production ratio: extra_good_amount per factory_input_amount
        // For each entry: entry.amount() = item.scaling() * defaultAmount * factory.inputAmount / additionalOutputCycle
        // Total ratio = sum of (item.scaling() * defaultAmount / additionalOutputCycle)
        const totalRatio = this.getTotalRatio();

        if (totalRatio > 0) {
            // Required factory inputAmount = requested amount / ratio
            const requiredInputAmount = amount / totalRatio;

            // Update factory's demandByExtraGoodSupplier to request this production
            if (this.factory.demandByExtraGoodSupplier && typeof this.factory.demandByExtraGoodSupplier === 'function') {
                this.factory.demandByExtraGoodSupplier(requiredInputAmount);
            }
        }
    }
}
