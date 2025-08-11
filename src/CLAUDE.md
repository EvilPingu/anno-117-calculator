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