# TypeScript Development Notes for Anno Calculator

## Class Architecture and Interface Patterns

### Constructible Interface Pattern
- `Constructible` is an interface (not a class) that extends `NamedElement`
- Required properties: `buildings: BuildingsCalc`, `island: Island`, `addBuff(appliedBuff: AppliedBuff): void`
- **NEVER use `instanceof Constructible`** - interfaces cannot be checked with instanceof
- Use the `isConstructible(obj)` type guard function in `world.ts` instead
- Classes implementing Constructible: `ResidenceBuilding`, `Consumer` (and its subclasses: `Factory`, `Module`, `PublicConsumerBuilding`)

### Parameter Interface Integration
When creating classes that use configuration interfaces from `types.config.ts`:

1. **Always look up referenced objects**: Convert numeric IDs to actual object references using `_assetsMap.get()`
2. **Update property types**: Change from `number[]` to proper object arrays (e.g., `Buff[]`, `Effect[]`, `Product[]`)
3. **Add proper error handling**: Throw descriptive errors when referenced objects aren't found

Example pattern:
```typescript
// Instead of storing IDs
public buffs: number[];

// Store actual objects  
public buffs: Buff[];

// In constructor
this.buffs = config.buffs.map(buffId => {
    const buff = _assetsMap.get(buffId);
    if (!buff) {
        throw new Error(`Buff with GUID ${buffId} not found in assetsMap`);
    }
    return buff as Buff;
});
```

### Type Safety Improvements
- **Remove all `as any` type assertions** - they break type safety
- When properties exist but aren't typed, add them to the class definition rather than using type assertions
- Use proper type guards for interface checking instead of `instanceof` on interfaces
- For filtering that changes types, combine type guards with instanceof checks: 
  ```typescript
  .filter((f: any) => isConstructible(f) && f instanceof Consumer) as Consumer[]
  ```

### Missing Property Patterns  
When encountering "missing" properties that exist at runtime:
- Check if they're commented out in the class definition
- Add them as properly typed optional properties: `public property?: Type`
- Common example: `ResidenceBuilding` needs `upgradedBuildingGuid?: string` and `upgradedBuilding?: ResidenceBuilding`

## Module Integration Architecture
- **Module Creation**: Modules are created in Factory constructor when `config.additionalModule` exists
- **AppliedBuff Creation**: Moved from Factory to Module constructor - modules create their own AppliedBuffs
- **Buff Scaling**: Module `checked` observable controls buff scaling (0 = inactive, 1 = active)
- **Persistence**: Module state persisted using `persistBool` pattern in Island constructor
- **Circular Imports**: AppliedBuff moved to separate `buffs.ts` file to resolve Factory ↔ Production circular dependency

### Object Lookup Best Practices
1. Always validate the result of `_assetsMap.get(id)` before using
2. Use descriptive error messages that include the GUID and context
3. Cast to appropriate types after validation: `buff as Buff`
4. Handle optional references properly with conditional checks

## Code Documentation Standards

### Class Attribute Grouping
When documenting class properties, group them logically with section headers:

```typescript
export class Consumer extends NamedElement {
    // === BASIC PROPERTIES ===
    public guid: number;
    public isFactory: boolean;
    
    // === PRODUCTION CONFIGURATION ===  
    public defaultInputs: Map<Product, number>;
    public cycleTime: number;
    
    // === BUFF SYSTEM ===
    public items: AppliedBuff[];           // Applied item effects
    public buffs: AppliedBuff[];           // All applied effects
    
    // === INPUT DEMAND SYSTEM ===
    public inputDemandsMap: Map<Product, Demand>;
    public inputDemands: KnockoutObservableArray<Demand>;
    
    // === REACTIVE SUBSCRIPTIONS ===
    public boostSubscription!: KnockoutComputed<void>;
}
```


## Syntax Fixes
Knockout computed: `read: () => { return value; }, write: (val: boolean) => { setValue(val); }`  
Avoid: `(() => {...})` or `((val as boolean) => {...})`

## Class Hierarchy
- **Consumer**: Base class (inputs only, final consumption)
- **Factory**: Extends Consumer (inputs + outputs, produces for other consumers)  
- **Module**: Extends Consumer (provides conditional buffs with multiplicative bonuses)
- **PublicConsumerBuilding**: Extends Consumer (services, no production)

## Productivity Bonus System

### Multiplicative vs Additive Calculation
The productivity boost calculation uses a mixed approach:
- **Module buffs**: Multiplicative - each module buff multiplies the existing productivity
- **All other buffs**: Additive - items, effects, and aqueduct buffs add together

### Implementation Pattern
See the implementation in `src/factories.ts:179-203` in the `Consumer.initDemands()` method and the helper method `isModuleBuff()` at `src/factories.ts:354-356`.

This approach prevents modules from having diminishing returns when stacked with other productivity bonuses.

### BuildingDemand Pattern
- **BuildingDemand**: Subclass of Demand that accepts `KnockoutObservable<number>` as factor
- **Dynamic Scaling**: `updateAmount()` method multiplies base amount by observable factor
- **Usage**: Used for fuel consumption demands where factor changes based on buff calculations
- **Factor Removal**: Base Demand class no longer has static factor property - moved to BuildingDemand observable

## Effects Persistence Architecture (IMPLEMENTED)

### Three-Tier Effect Persistence System
**Global Effects** (main.ts:369-384):
- Storage key pattern: `global.effect.${effectGuid}.scaling`
- Persisted after creation during initialization
- Uses direct localStorage.getItem/setItem with observable subscriptions

**Session Effects** (world.ts:203-218):
- Storage key pattern: `session.${sessionGuid}.effect.${effectGuid}.scaling`
- Persisted in Session constructor after effect creation
- Uses TypeScript-safe localStorage existence checking

**Island Effects** (world.ts:786-789):
- Storage key pattern: `island.effect.${effectGuid}.scaling`
- Uses existing `persistFloat(effect, "scaling", ...)` helper pattern
- Integrated into Island constructor persistence flow

### Implementation Details
- **Effect Scaling**: All effects use `scaling: KnockoutObservable<number>` (0=inactive, 1=active)
- **Automatic Persistence**: Observable subscriptions save changes immediately to localStorage
- **Type Safety**: Proper null checking for localStorage.getItem() results
- **Backward Compatible**: No changes to existing Effect class interface
- **Consistent Pattern**: All three levels follow same observable subscription pattern

### Storage Key Structure
```
global.effect.${effectGuid}.scaling          // Global effects
session.${sessionGuid}.effect.${effectGuid}.scaling  // Session effects  
island.effect.${effectGuid}.scaling          // Island effects (via persistFloat)
```

### Core Architecture
- Factory/building persistence uses helper functions: persistBool, persistInt, persistFloat, persistString
- All persistence is scoped with localStorage keys: ${scope}.${obj.guid}.${attributeName}
- Global objects (regions, sessions, effects) now have persistence for their scaling states
- Island-level persistence happens in Island constructor using persistBuildings() flow

## Population-Level Need Management (IMPLEMENTED)

### Architecture Transformation
**Before**: Individual residence-level need activation (ResidenceNeed.checked observable per building)
**After**: Population-level need activation (PopulationLevelNeed.checked observable shared across all residences)

### Key Classes Created/Modified
**PopulationLevelNeed** (consumption.ts:74-139):
- Centralized need management for entire population tier
- Properties: checked, notes, available, hidden observables
- Methods: name(), isInactive(), banned(), prepareResidenceEffectView()
- Each PopulationLevel has needsMap: Map<number, PopulationLevelNeed>

**PopulationLevel** (population.ts:233-355):
- Added needsMap and needs array for population-level need management
- Methods: getNeed(), isNeedActivated(), getVisibleNeeds()
- Needs initialized when first residence is added via addResidence()

**ResidenceNeed** (consumption.ts:145-261):
- checked and notes properties now computed observables delegating to PopulationLevel
- Maintains all calculation logic (amount, residents, demands)
- Preserved UI compatibility through delegation pattern

### Persistence Changes
**Storage Pattern**: Changed from `${residenceGuid}[${needGuid}].checked` to `${populationLevelGuid}[${needGuid}].checked`
**Location**: Island constructor persistence (world.ts:961-967) now iterates PopulationLevel.needs instead of ResidenceBuilding.needsMap

### UI Architecture (IMPLEMENTED)
**ResidencePresenter** (views.ts:747-793):
- Added populationNeedCategories computed observable
- Creates need categories from population-level needs with aggregated totalResidents() and totalAmount()
- Preserves methods by adding properties directly to PopulationLevelNeed objects (avoids object spread)

**Template Structure** (templates/population-level-config-dialog.html):
- Population summary section with total residents across all residences
- Residence buildings table showing individual buildings with controls
- Population-level needs section with single checkbox per need type
- Proper binding context: $root.texts for localization, $data.need.product for asset icons

### Critical Implementation Patterns
**Object Method Preservation**: NEVER use object spread (`...obj`) with Knockout objects as it loses method references
**Template Binding Context**: Use $root.texts for localization, formatNumber/formatPercentage as global functions
**Delegation Pattern**: ResidenceNeed observables delegate to PopulationLevel for single source of truth
**Dynamic Property Addition**: Add computed properties directly to existing objects to preserve methods

## Need Categorization Architecture (IMPLEMENTED)

### Category Identification Issue
**Problem**: Need categories use `id` as unique identifier, NOT `guid`
**Root Cause**: `NeedCategory` extends `NamedElement` which has optional `guid?: number`, but categories are identified by their `id: string` property
**Critical Fix**: Always use `category.id` for Map keys when grouping needs by category

```typescript
// WRONG - causes all needs to appear under same category
if (!categories.has(category.guid)) {
    categories.set(category.guid, categoryObj);
}

// CORRECT - properly groups needs by category
if (!categories.has(category.id)) {
    categories.set(category.id, categoryObj);
}
```

### Two-Way Observable Delegation Pattern
**Problem**: Population-level need changes not reflected in residence-level consumption
**Solution**: ResidenceNeed.checked must be writable computed observable with delegation

```typescript
// WRONG - read-only delegation breaks consumption
this.checked = ko.pureComputed(() => {
    const populationLevelNeed = this.residence.populationLevel.getNeed(this.need.guid);
    return populationLevelNeed ? populationLevelNeed.checked() : false;
});

// CORRECT - two-way binding enables proper consumption
this.checked = ko.pureComputed({
    read: () => {
        const populationLevelNeed = this.residence.populationLevel.getNeed(this.need.guid);
        return populationLevelNeed ? populationLevelNeed.checked() : true;
    },
    write: (value: boolean) => {
        const populationLevelNeed = this.residence.populationLevel.getNeed(this.need.guid);
        if (populationLevelNeed) {
            populationLevelNeed.checked(value);
        }
    }
});
```

### Key Implementation Details
- **Category Mapping**: Use `category.id` string identifiers, not `category.guid` numbers
- **Delegation Direction**: PopulationLevelNeed is the source of truth, ResidenceNeed delegates to it
- **Default Values**: When population-level need doesn't exist, default to `true` (activated) to maintain backward compatibility
- **Consumption Flow**: ResidenceNeed.amount() calculations depend on ResidenceNeed.checked() delegation working properly

### Object Method Preservation Pattern
**Critical Implementation Detail**: User's fix preserves Knockout observable methods by avoiding object spread

**Problem**: Object spread (`...obj`) loses method references from Knockout observables
**Solution**: Direct property addition to existing objects
```typescript
// WRONG - loses Knockout methods
const extended = { ...populationLevelNeed, totalResidents, totalAmount };

// CORRECT - preserves methods by direct assignment
populationLevelNeed.totalResidents = totalResidents;
populationLevelNeed.totalAmount = totalAmount;
populationLevelNeed.prepareResidenceEffectView = prepareResidenceEffectView;
```

### Template Integration Improvements
**UI Binding Context**: Fixed template binding to work with presenter pattern
- Proper use of `$root.texts` for localization
- Global function calls: `formatNumber()`, `formatPercentage()` without $root prefix  
- Correct data context navigation: `$data.need.product` for asset properties