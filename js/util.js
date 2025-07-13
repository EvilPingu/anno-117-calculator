// @ts-check

var ko = require( "knockout" );

/** Version string for the calculator application */
export let versionCalculator = "v11.1";
/** Flag indicating if this is a preview version */
export let isPreview = false;
/** Accuracy threshold for floating point comparisons */
export let ACCURACY = 0.01;
/** Very small epsilon value for precise floating point comparisons */
export let EPSILON = 0.0000001;
/** Special identifier for "All Islands" view */
export let ALL_ISLANDS = "All Islands";

/**
 * Sets default fixed factory assignments for specific products
 * Assigns rum, cotton fabric, and coffee to their default New World production locations
 * @param {Map} assetsMap - Map of all available assets
 */
export function setDefaultFixedFactories(assetsMap) {
    // Default rum, cotton fabric and coffee to the new world production
    assetsMap.get(1010240).fixedFactory(assetsMap.get(1010318));
    assetsMap.get(1010257).fixedFactory(assetsMap.get(1010340));
    assetsMap.get(120032).fixedFactory(assetsMap.get(101252));
    assetsMap.get(1010216).fixedFactory(assetsMap.get(1010294));
    assetsMap.get(1010214).fixedFactory(assetsMap.get(1010292));
    assetsMap.get(1010206).fixedFactory(assetsMap.get(1010284));
}

/**
 * Removes all non-word characters from a string
 * @param {string|Function} string - The string to process or a function returning a string
 * @returns {string} The string with all non-word characters removed
 */
function removeSpaces(string) {
    if (typeof string === "function")
        string = string();
    return string.replace(/\W/g, "");
}

/** Number formatter using the browser's locale */
var formater = new Intl.NumberFormat(navigator.language || "en").format;

/**
 * Formats a number according to the browser's locale with optional sign
 * @param {number|string} num - The number to format
 * @param {boolean} forceSign - Whether to force a plus sign for positive numbers
 * @returns {string} The formatted number string
 */
export function formatNumber(num, forceSign = false) {
    var rounded = Math.ceil(100 * parseFloat(String(num))) / 100;
    if (Math.abs(rounded) < EPSILON)
        rounded = 0;
    var str = formater(rounded);
    if (forceSign && rounded > EPSILON)
        str = '+' + str;
    return str;
}

/**
 * Handles number input with mouse wheel support and keyboard modifiers
 * Provides increment/decrement functionality with configurable step sizes
 */
export class NumberInputHandler {
    /**
     * Creates a new NumberInputHandler instance
     * @param {Object} params - Configuration parameters
     * @param {ko.observable} params.obs - The observable to update
     * @param {string} params.id - The ID of the input element
     */
    constructor(params) {
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
        this.max = parseFloat($('#' + this.id).attr('max') || Infinity);
        this.min = parseFloat($('#' + this.id).attr('min') || -Infinity);
        this.step = parseFloat($('#' + this.id).attr('step') || 1);
        this.input = $('#' + this.id);
        if (this.input.length != 1)
            console.log("Invalid binding", this.id, this.input);
        this.input.on("wheel", evt => {
            if (document.activeElement !== this.input.get(0))
                return;

            evt.preventDefault();
            var deltaY = evt.deltaY || (evt.originalEvent || {}).deltaY;
            var sign = -Math.sign(deltaY);
            var factor = this.getInputFactor(evt);

            var val = parseFloat(this.obs()) + sign * factor * this.step + ACCURACY;
            val = Math.max(this.min, Math.min(this.max, val));
            this.obs(Math.floor(val / this.step) * this.step);

            return false;
        });
    }

    /**
     * Gets the input factor based on keyboard modifiers
     * @param {WheelEvent} evt - The wheel event
     * @returns {number} The factor to multiply the step by
     */
    getInputFactor(evt) {
        var factor = 1
        if (evt.ctrlKey)
            factor *= 10
        if (evt.shiftKey)
            factor *= 100
        return factor
    }
}

/**
 * Formats a number as a percentage with optional sign
 * @param {number|string} number - The number to format as percentage
 * @param {boolean} forceSign - Whether to force a plus sign for positive numbers
 * @returns {string} The formatted percentage string
 */
export function formatPercentage(number, forceSign = true) {
    return window.formatNumber(Math.ceil(10 * parseFloat(String(number))) / 10, forceSign) + ' %';
}

/**
 * Delays updating an observable to prevent rapid successive updates
 * @param {ko.observable} obs - The observable to update
 * @param {*} val - The value to set
 */
export function delayUpdate(obs, val) {
    var version = obs.getVersion ? obs.getVersion() : obs();
    setTimeout(() => {
        if (obs.getVersion && !obs.hasChanged(version) || version === obs())
            obs(val);
    });
}

/**
 * Knockout extender for numeric input validation and formatting
 * Provides bounds checking, precision control, and custom callbacks
 * @param {typeof ko.observable} target - The target observable
 * @param {Object} bounds - Configuration object for bounds and behavior
 * @param {number} bounds.precision - Number of decimal places (0 for integers)
 * @param {number} bounds.min - Minimum allowed value
 * @param {number} bounds.max - Maximum allowed value
 * @param {Function} bounds.callback - Optional callback function for custom validation
 * @returns {typeof ko.computed} A computed observable with numeric validation
 */
ko.extenders.numeric = function (target, bounds) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.computed({
        read: target,  //always return the original observables value
        write: function (newValue) {
            var current = target();

            if (bounds.precision === 0)
                var valueToWrite = parseInt(newValue);
            else if (bounds.precision) {
                var roundingMultiplier = Math.pow(10, bounds.precision);
                var newValueAsNum = isNaN(newValue) ? 0 : +newValue;
                var valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
            } else {
                var valueToWrite = parseFloat(newValue);
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
                valueToWrite = bounds.callback(valueToWrite, current, newValue);
                if (valueToWrite == null)
                    return;
            }

            //only write if it changed
            if (valueToWrite !== current || newValue !== valueToWrite) {
                if (result._state && result._state.isBeingEvaluated) {
                    console.log("cycle detected, propagation stops");
                    return;
                }

                target(valueToWrite);
                if (newValue !== valueToWrite)
                    target.valueHasMutated()
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
};

/**
 * Creates an integer input observable with validation
 * @param {number} init - Initial value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {Function|null} callback - Optional callback function for custom validation
 * @returns {ko.observable} An observable with integer validation
 */
export function createIntInput(init, min = -Infinity, max = Infinity, callback = null) {
    return ko.observable(init).extend({
        numeric: {
            precision: 0,
            min: min,
            max: max,
            callback: callback
        }
    });
}

/**
 * Creates a float input observable with validation
 * @param {number} init - Initial value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {Function|null} callback - Optional callback function for custom validation
 * @returns {ko.observable} An observable with float validation
 */
export function createFloatInput(init, min = -Infinity, max = Infinity, callback = null) {
    return ko.observable(init).extend({
        numeric: {
            min: min,
            max: max,
            precision: 6,
            callback: callback
        }
    });
}

/**
 * Base class for all named elements in the application
 * Provides localization support and DLC management
 */
export class NamedElement {
    /**
     * Creates a new NamedElement instance
     * @param {Object} config - Configuration object
     * @param {string} config.name - Default name for the element
     * @param {Object} config.locaText - Localization text object
     * @param {string} config.iconPath - Path to the icon
     * @param {Array} config.dlcs - Array of DLC identifiers
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('NamedElement config is required');
        }


        // Explicit assignments
        this.guid = config.guid || null;
        
        this.locaText = config.locaText || {}
        this.name = ko.computed(() => {

            let text = this.locaText[view.settings.language()];
            if (text)
                return text;

            text = this.locaText["english"];
            return text ? text : (config.name || "");
        });

        if (config.iconPath && params && params.icons)
            this.icon = params.icons[config.iconPath];

        if (config.dlcs && config.dlcs.length > 0 && params && params.dlcs) {
            this.dlcs = config.dlcs.map(d => view.dlcsMap.get(d)).filter(d => d);
            this.available = ko.pureComputed(() => {
                for (var d of this.dlcs) {
                    if (d.checked())
                        return true;
                }

                return false;
            });
            this.dlcLockingObservables = [];
        } else {
            this.available = ko.pureComputed(() => true)
        }

    }

    /**
     * Locks an observable to a specific DLC if this element has only one DLC
     * @param {ko.observable} obs - The observable to lock
     */
    lockDLCIfSet(obs) {
        if (this.dlcs == null || this.dlcs.length != 1)
            return;

        this.dlcLockingObservables.push(obs);
        this.dlcs[0].addDependentObject(obs);
    }

    /**
     * Removes DLC dependencies when this element is deleted
     */
    delete() {
        if (this.dlcs == null || this.dlcs.length != 1)
            return;

        for (var obs of this.dlcLockingObservables)
            this.dlcs[0].removeDependentObject(obs);
    }
}

/**
 * Represents an optional element that can be checked/unchecked
 * Extends NamedElement to provide checkbox functionality
 */
export class Option extends NamedElement {
    /**
     * Creates a new Option instance
     * @param {Object} config - Configuration object
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('Option config is required');
        }

        super(config);
        
        // Explicit assignments
        this.checked = ko.observable(false);
        this.visible = ko.observable(!!config);
    }
}

/**
 * Represents a DLC (Downloadable Content) package
 * Manages DLC availability and dependent object tracking
 */
export class DLC extends Option {
    /**
     * Creates a new DLC instance
     * @param {Object} config - Configuration object
     */
    constructor(config) {
        // Validate required parameters
        if (!config) {
            throw new Error('DLC config is required');
        }

        super(config);
        this.id = config.id;

        // Explicit assignments
        this.dependentObjects = ko.observableArray([]).extend({ deferred: true }); // notify subscribers at most once per 500 ms

        this.used = ko.pureComputed(() => {
            for (var obs of this.dependentObjects())
                if (obs() != 0) // can be int, float or bool -> non-strict comparison
                    return true;

            return false;
        });

        this.used.subscribe(val => {
            if (val)
                this.checked(true);
        })
    }

    /**
     * Adds a dependent object that will be tracked for usage
     * @param {ko.observable} obs - The observable to track
     */
    addDependentObject(obs) {
        this.dependentObjects.push(obs);
    }

    /**
     * Removes a dependent object from tracking
     * @param {ko.observable} obs - The observable to stop tracking
     */
    removeDependentObject(obs) {
        this.dependentObjects.remove(obs);
    }
}


