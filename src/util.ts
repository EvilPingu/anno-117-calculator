import { 
  NamedElementConfig, 
  OptionConfig, 
  DLCConfig, 
  NumberInputHandlerParams, 
  NumericBounds,
  KnockoutObservable,
  KnockoutComputed
} from './types';

declare const $: any;
declare const window: any;
declare const ko: any;

/** Version string for the calculator application */
export let versionCalculator: string = "v11.1";
/** Flag indicating if this is a preview version */
export let isPreview: boolean = false;
/** Accuracy threshold for floating point comparisons */
export let ACCURACY: number = 0.01;
/** Very small epsilon value for precise floating point comparisons */
export let EPSILON: number = 0.0000001;
/** Special identifier for "All Islands" view */
export let ALL_ISLANDS: string = "All Islands";

/**
 * Sets default fixed factory assignments for specific products
 * Assigns rum, cotton fabric, and coffee to their default New World production locations
 * @param assetsMap - Map of all available assets
 */
export function setDefaultFixedFactories(assetsMap: Map<string, any>): void {
    // Default rum, cotton fabric and coffee to the new world production
    assetsMap.get("1010240")?.fixedFactory(assetsMap.get("1010318"));
    assetsMap.get("1010257")?.fixedFactory(assetsMap.get("1010340"));
    assetsMap.get("120032")?.fixedFactory(assetsMap.get("101252"));
    assetsMap.get("1010216")?.fixedFactory(assetsMap.get("1010294"));
    assetsMap.get("1010214")?.fixedFactory(assetsMap.get("1010292"));
    assetsMap.get("1010206")?.fixedFactory(assetsMap.get("1010284"));
}

/** Number formatter using the browser's locale */
const formater = new Intl.NumberFormat(navigator.language || "en").format;

/**
 * Formats a number according to the browser's locale with optional sign
 * @param num - The number to format
 * @param forceSign - Whether to force a plus sign for positive numbers
 * @returns The formatted number string
 */
export function formatNumber(num: number | string, forceSign: boolean = false): string {
    const rounded = Math.ceil(100 * parseFloat(String(num))) / 100;
    if (Math.abs(rounded) < EPSILON)
        return "0";
    const str = formater(rounded);
    if (forceSign && rounded > EPSILON)
        return '+' + str;
    return str;
}

/**
 * Handles number input with mouse wheel support and keyboard modifiers
 * Provides increment/decrement functionality with configurable step sizes
 */
export class NumberInputHandler {
    private obs: KnockoutObservable<number>;
    private id: string;
    private max: number;
    private min: number;
    private step: number;
    private input: any;

    /**
     * Creates a new NumberInputHandler instance
     * @param params - Configuration parameters
     */
    constructor(params: NumberInputHandlerParams) {
        // Validate required parameters
        if (!params) {
            throw new Error('NumberInputHandler params is required');
        }
        if (!params.obs) {
            throw new Error('NumberInputHandler params.obs is required');
        }
        if (!params.id) {
            throw new Error('NumberInputHandler params.id is required');
        }

        // Explicit assignments
        this.obs = params.obs;
        this.id = params.id;
        this.max = parseFloat($('#' + this.id).attr('max') || 'Infinity');
        this.min = parseFloat($('#' + this.id).attr('min') || '-Infinity');
        this.step = parseFloat($('#' + this.id).attr('step') || '1');
        this.input = $('#' + this.id);
        
        if (this.input.length != 1)
            console.log("Invalid binding", this.id, this.input);
            
        this.input.on("wheel", (evt: WheelEvent) => {
            if (document.activeElement !== this.input.get(0))
                return;

            evt.preventDefault();
            const deltaY = evt.deltaY || (evt as any).originalEvent?.deltaY;
            const sign = -Math.sign(deltaY);
            const factor = this.getInputFactor(evt);

            const val = parseFloat(this.obs() as any) + sign * factor * this.step + ACCURACY;
            const clampedVal = Math.max(this.min, Math.min(this.max, val));
            this.obs(Math.floor(clampedVal / this.step) * this.step);

            return false;
        });
    }

    /**
     * Gets the input factor based on keyboard modifiers
     * @param evt - The wheel event
     * @returns The factor to multiply the step by
     */
    private getInputFactor(evt: WheelEvent): number {
        let factor = 1;
        if (evt.ctrlKey)
            factor *= 10;
        if (evt.shiftKey)
            factor *= 100;
        return factor;
    }
}

/**
 * Formats a number as a percentage with optional sign
 * @param number - The number to format as percentage
 * @param forceSign - Whether to force a plus sign for positive numbers
 * @returns The formatted percentage string
 */
export function formatPercentage(number: number | string, forceSign: boolean = true): string {
    return window.formatNumber(Math.ceil(10 * parseFloat(String(number))) / 10, forceSign) + ' %';
}

/**
 * Delays updating an observable to prevent rapid successive updates
 * @param obs - The observable to update
 * @param val - The value to set
 */
export function delayUpdate(obs: KnockoutObservable<any>, val: any): void {
    const version = (obs as any).getVersion ? (obs as any).getVersion() : obs();
    setTimeout(() => {
        if ((obs as any).getVersion && !(obs as any).hasChanged(version) || version === obs())
            obs(val);
    });
}

/**
 * Knockout extender for numeric input validation and formatting
 * Provides bounds checking, precision control, and custom callbacks
 * @param target - The target observable
 * @param bounds - Configuration object for bounds and behavior
 * @returns A computed observable with numeric validation
 */
(ko as any).extenders.numeric = function (target: KnockoutObservable<number>, bounds: NumericBounds): KnockoutComputed<number> {
    //create a writable computed observable to intercept writes to our observable
    const result = ko.computed({
        read: target,  //always return the original observables value
        write: function (newValue: any) {
            const current = target();

            let valueToWrite: number;
            if (bounds.precision === 0)
                valueToWrite = parseInt(newValue);
            else if (bounds.precision) {
                const roundingMultiplier = Math.pow(10, bounds.precision);
                const newValueAsNum = isNaN(newValue) ? 0 : +newValue;
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
            } else {
                valueToWrite = parseFloat(newValue);
            }

            if (!isFinite(valueToWrite) || valueToWrite == null) {
                if (newValue != current)
                    target.notifySubscribers(); // reset input field
                return;
            }

            if (valueToWrite > bounds.max)
                valueToWrite = bounds.max;

            if (valueToWrite < bounds.min)
                valueToWrite = bounds.min;

            if (bounds.callback && typeof bounds.callback === "function") {
                const callbackResult = bounds.callback(valueToWrite, current, newValue);
                if (callbackResult == null)
                    return;
                valueToWrite = callbackResult;
            }

            //only write if it changed
            if (valueToWrite !== current || newValue !== valueToWrite) {
                if ((result as any)._state && (result as any)._state.isBeingEvaluated) {
                    console.log("cycle detected, propagation stops");
                    return;
                }
                target(valueToWrite);
            }
        }
    });

    return result as any;
};

/**
 * Creates an integer input observable with validation
 * @param init - Initial value
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param callback - Optional callback function for custom validation
 * @returns A knockout observable with integer validation
 */
export function createIntInput(init: number, min: number = -Infinity, max: number = Infinity, callback: ((value: number, current: number, newValue: any) => number | null) | null = null): KnockoutObservable<number> {
    const obs = ko.observable(init);
    return obs.extend({ numeric: { precision: 0, min, max, callback } }) as any;
}

/**
 * Creates a float input observable with validation
 * @param init - Initial value
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param callback - Optional callback function for custom validation
 * @returns A knockout observable with float validation
 */
export function createFloatInput(init: number, min: number = -Infinity, max: number = Infinity, callback: ((value: number, current: number, newValue: any) => number | null) | null = null): KnockoutObservable<number> {
    const obs = ko.observable(init);
    return obs.extend({ numeric: { min, max, callback } }) as any;
}

/**
 * Base class for named elements in the application
 * Provides common functionality for all named objects
 */
export class NamedElement {
    public name: KnockoutObservable<string>;
    public guid: string;
    public dlcs: string[];
    public available: KnockoutObservable<boolean>;
    public notes: KnockoutObservable<string>;
    public dependentObjects: KnockoutObservableArray<any>;

    /**
     * Creates a new NamedElement instance
     * @param config - Configuration object for the named element
     */
    constructor(config: NamedElementConfig) {
        // Validate required parameters
        if (!config) {
            throw new Error('NamedElement config is required');
        }
        if (!config.name) {
            throw new Error('NamedElement config.name is required');
        }
        if (!config.guid) {
            throw new Error('NamedElement config.guid is required');
        }

        // Explicit assignments
        this.name = ko.observable(config.name || '') as any;
        this.guid = config.guid || '';
        this.dlcs = config.dlcs || [];
        this.available = ko.observable(true) as any;
        this.notes = ko.observable("") as any;
        this.dependentObjects = ko.observableArray([]) as any;

        // Initialize DLC dependencies
        this.initDLCs();
    }

    /**
     * Initializes DLC dependencies for this element
     */
    private initDLCs(): void {
        if (!window.view || !window.view.dlcsMap) return;

        for (const dlcGuid of this.dlcs) {
            const dlc = window.view.dlcsMap.get(dlcGuid);
            if (dlc) {
                dlc.addDependentObject(this.available);
            }
        }
    }

    /**
     * Locks an observable if DLC is set
     * @param obs - The observable to lock
     */
    lockDLCIfSet(obs: KnockoutObservable<any> | KnockoutComputed<any>): void {
        if (!window.view || !window.view.dlcsMap) return;

        for (const dlcGuid of this.dlcs) {
            const dlc = window.view.dlcsMap.get(dlcGuid);
            if (dlc && dlc.checked()) {
                (obs as any).extend({ rateLimit: { timeout: 0, method: "notifyWhenChangesStop" } });
                break;
            }
        }
    }

    /**
     * Deletes this element and cleans up dependencies
     */
    delete(): void {
        if (!window.view || !window.view.dlcsMap) return;

        for (const dlcGuid of this.dlcs) {
            const dlc = window.view.dlcsMap.get(dlcGuid);
            if (dlc) {
                dlc.removeDependentObject(this.available);
            }
        }
    }
}

/**
 * Represents an option that can be checked/unchecked
 * Extends NamedElement with checkbox functionality
 */
export class Option extends NamedElement {
    public checked: KnockoutObservable<boolean>;

    /**
     * Creates a new Option instance
     * @param config - Configuration object for the option
     */
    constructor(config: OptionConfig) {
        super(config);
        
        // Explicit assignments
        this.checked = ko.observable(config.checked || false) as any;
    }
}

/**
 * Represents a DLC (Downloadable Content) option
 * Extends Option with dependency management
 */
export class DLC extends Option {
    public dependentObjects: KnockoutObservableArray<any>;
    public used: KnockoutComputed<boolean>;
    public id: string;

    /**
     * Creates a new DLC instance
     * @param config - Configuration object for the DLC
     */
    constructor(config: DLCConfig) {
        super(config);
        
        // Explicit assignments
        this.id = config.id || '';
        this.dependentObjects = ko.observableArray(config.dependentObjects || []).extend({ deferred: true }) as any;

        // Create the used computed observable
        this.used = ko.pureComputed(() => {
            for (const obs of this.dependentObjects()) {
                if (obs() != 0) // can be int, float or bool -> non-strict comparison
                    return true;
            }
            return false;
        }) as any;

        // Subscribe to used changes to auto-check the DLC
        this.used.subscribe(() => {
            if (this.used()) {
                this.checked(true);
            }
        });
    }

    /**
     * Adds a dependent object to this DLC
     * @param obs - The dependent observable
     */
    addDependentObject(obs: KnockoutObservable<any>): void {
        this.dependentObjects.push(obs);
    }

    /**
     * Removes a dependent object from this DLC
     * @param obs - The dependent observable
     */
    removeDependentObject(obs: KnockoutObservable<any>): void {
        this.dependentObjects.remove(obs);
    }
} 

/**
 * Creates a dummy observable that logs an error when accessed before proper initialization
 * @param name - The name of the observable for error reporting
 * @returns A dummy observable that logs errors on access
 */
export function dummyObservable<T = any>(name: string): KnockoutObservable<T> {
  const obs = function(value?: T) {
    if (arguments.length === 0) {
      console.error(`[DummyObservable] Attempted to read uninitialized observable: ${name}`);
      return undefined as any;
    } else {
      console.error(`[DummyObservable] Attempted to write to uninitialized observable: ${name}`, value);
    }
  } as KnockoutObservable<T>;
  obs.subscribe = () => { console.error(`[DummyObservable] subscribe on ${name}`); };
  obs.unsubscribe = () => { console.error(`[DummyObservable] unsubscribe on ${name}`); };
  obs.extend = () => obs;
  obs.notifySubscribers = () => { console.error(`[DummyObservable] notifySubscribers on ${name}`); };
  return obs;
}

/**
 * Creates a dummy method that logs an error when called before proper initialization
 * @param name - The name of the method for error reporting
 * @returns A dummy method that logs errors on call
 */
export function dummyMethod(name: string): any {
  return function() {
    console.error(`[DummyMethod] Attempted to call uninitialized method: ${name}`);
  };
}

/**
 * Creates a dummy computed that logs an error when accessed before proper initialization
 * @param name - The name of the computed for error reporting
 * @returns A dummy computed that logs errors on access
 */
export function dummyComputed<T = any>(name: string): KnockoutComputed<T> {
  const computed = function() {
    console.error(`[DummyComputed] Attempted to read uninitialized computed: ${name}`);
    return undefined as any;
  } as KnockoutComputed<T>;
  computed.subscribe = () => { console.error(`[DummyComputed] subscribe on ${name}`); };
  computed.unsubscribe = () => { console.error(`[DummyComputed] unsubscribe on ${name}`); };
  computed.notifySubscribers = () => { console.error(`[DummyComputed] notifySubscribers on ${name}`); };
  return computed;
} 