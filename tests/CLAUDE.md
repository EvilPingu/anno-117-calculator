# Testing Framework Knowledge

## Quick Reference: Helpers
- **ConfigLoader**: `loadConfig(page, fixturePath)`, `createIslandConfig(name, session, data, settings)`. Handles new SubStorage format.
- **BindingDetector**: `listenForErrors(page)`, `hasBindingError()`. Captures Knockout errors. *Note: `error.text()` is a function.*
- **ComputedAsserter**: `assertEquals(page, path, expected, tolerance)`. Safely evaluates observables in page context.
- **FixtureManager**: `loadFixture(name)`, `generateFixture(params)`. Manages test data in `tests/fixtures/`.

## Critical Constraints
- **Knockout in `page.evaluate()`**: The `ko` object is **NOT** available. Access observables by calling them: `window.view.island().factories[0].boost()`.
- **Observable Arrays**: Must unwrap before array methods: `factory.buffs().find(...)`.
- **DOM-Based Testing**: Prefer waiting for selectors (`.product-tile`) and clicking elements over direct `window.view` access to avoid timing/initialization issues.

## Common Mistakes to Avoid
- **Reference Errors**: Never use `ko.isObservable()` or `ko.unwrap()` in `page.evaluate()`. Use `typeof === 'function'` or direct calls.
- **Missing Parentheses**: Using `factory.boost` instead of `factory.boost()` returns the function, not the value.
- **Race Conditions**: Don't check for data immediately after `page.goto()`. Wait for `.product-tile` or `networkidle`.
- **Storage Booleans**: `localStorage` stores booleans as strings `"1"` or `"0"`. Use `Number()` coercion when comparing.
- **Collapsible Elements**: Tests will fail to "click" or "see" elements inside collapsed fieldsets. Expand them first via DOM manipulation.
- **Hardcoding Params**: Don't hardcode cycle times or consumption rates. Read them from `window.view.island().assetsMap.get(guid)` in the test.
- **Bootstrap Tabs**: Only ONE tab can have the `active` class at init. Don't add `active` via `foreach` loops in templates.
- **`page.evaluate` Arguments**: Playwright's `page.evaluate` only accepts **ONE** argument for the function. Pass multiple values as an object: `page.evaluate(({a, b}) => a + b, {a: 1, b: 2})`.
- **Nested Replacement Errors**: When using `replace`, ensure the `new_string` doesn't accidentally wrap or nest class definitions (e.g., `class X { class X ... }`).
- **Need vs Product GUIDs**: Needs have their own GUIDs distinct from the products they consume. Check `params.needs` for the correct GUID when testing consumption logic.
- **Asset Traversal**: Some objects like `PopulationLevelNeed` aren't in the global `assetsMap`. Access them via their parents: `island.populationLevels.flatMap(l => l.needs)`.

## Common Test GUIDs
| Category | GUID | Name / Description |
| :--- | :--- | :--- |
| **Session** | 37135 | All Islands (Global/Meta) |
| **Session** | 3245 | Latium |
| **Session** | 6627 | Albion |
| **Population**| 1499 | Liberti Population Level |
| **Residence** | 3087 | Liberti Residence (Latium) |
| **Factory**   | 3089 | Timber Factory (Latium) |
| **Factory**   | 2786 | Sheep Farm |
| **Factory**   | 3187 | Spinner |
| **Factory**   | 2694 | Latium Vineyard |
| **Factory**   | 23723 | Albion Vineyard |
| **Product**   | 2153 | Cheese |
| **Product**   | 2138 | Wine |
| **Product**   | 2140 | Oysters with Caviar |
| **Product**   | 2151 | Fine Glass |
| **Product**   | 2179 | Marble |
| **Product**   | 8563 | Minerals |
| **Product**   | 2069 | Wheat |
| **Module**    | 77954 | Silo Module (Sheep Farm) |
| **Buff**      | 77960 | Silo Buff (+100% Prod) |
| **Item**      | 51339 | Measurer (-25% Workforce) |
| **Patron**    | 43594 | Ceres |
| **Effect**    | 99014 | Epicure of Water (Radius) |
| **Effect**    | 43600 | CeresPopulationEffect |

## Formulas Reference
- **Factory Throughput**: `buildings.constructed * boost * 60 / cycleTime`
- **Residence Need**: `buildings.constructed * needConsumptionRate * consumptionFactor`
- **Residence Residents**: `buildings.constructed * need.residents` (summed for checked needs)
- **Required Buildings**: `inputAmount / 60 * cycleTime / boost`

## Storage Architecture
- **Global Keys**: `calculatorSettings`, `sessionSettings`, `globalEffects` (JSON strings).
- **Island Storage**: Nested JSON under island name key (e.g., `"Latium"`).
- **Island Data**: Includes `session`, `selectedPatron`, `devotion`, and `{guid}.buildings.constructed`.

## Execution
- `npm test` - Run all (non-interactive)
- `npm run test:binding` / `test:computed` - Scoped runs
- Set `CI=true` or `--reporter=list` to prevent HTML report from opening.
