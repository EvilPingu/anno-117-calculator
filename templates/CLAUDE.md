# Template Design Guidelines for Anno Calculator

## UI Design Patterns (IMPLEMENTED)

### Residents Display Guidelines
When displaying resident counts in templates, follow these patterns:

**Total Residents Display**:
- Use `inline-list-centered` class instead of `d-flex align-items-center` for consistency with project styles
- Display as read-only text with `formatNumber()`, never as number input
- Use residents icon (`icon_resource_population.png`) with proper title binding: `$root.texts.residents.name()`
- For prominent display, use subtle background styling: `background-color: rgba(0,0,0,0.05); border-radius: 4px/8px`

**Conditional Content Display**:
- Show residence type names only when multiple residences exist: `<!-- ko if: $parent.instance().allResidences().length > 1 -->`
- Use empty cells with comments for single residence scenarios to maintain table structure

### Table Header Improvements
**Remove Cluttered Headers**: Replace traditional table headers with visual icons and intuitive layout
- Replace text headers like "Residence Type | Buildings | Residents | Effects | Actions"
- Use `table-striped table-fixed` classes for consistent styling
- Implement icon-based column identification instead of text headers

### Layout Classes
**Use Project-Specific Classes**:
- `inline-list-centered`: For horizontally aligned content with icons and text
- `inline-list`: For floating effect icons and similar elements  
- `table-fixed`: For consistent table column widths
- Avoid generic Bootstrap flex classes when project-specific classes exist

### Template Structure Patterns
**Population Summary Section**:
```html
<div class="d-flex justify-content-between align-items-center mb-3 p-3" style="background-color: rgba(0,0,0,0.05); border-radius: 8px;">
    <h5 class="mb-0" data-bind="text: $data.instance().name()"></h5>
    <div class="inline-list-centered">
        <img class="icon-sm icon-light mr-2" src="../icons/icon_resource_population.png" data-bind="attr: {title: $root.texts.residents.name()}" />
        <strong data-bind="text: formatNumber($data.instance().residents())"></strong>
    </div>
</div>
```

**Individual Residence Row**:
```html
<td style="width: 20%;">
    <div class="inline-list-centered">
        <img class="icon-sm icon-light mr-2" src="../icons/icon_resource_population.png" />
        <span data-bind="text: formatNumber($data.residents())"></span>
    </div>
</td>
```

### Icon Usage Standards
- **Residents**: `icon_resource_population.png`
- **Buildings**: `icon_house_white.png`
- **Effects**: `icon_marketplace_2d_light.png`
- Always include proper `title` attributes for accessibility
- Use `icon-sm icon-light` classes for consistent sizing

### Visual Hierarchy Principles
1. **Editable vs Read-only**: Clearly distinguish inputs (buildings) from calculated displays (residents)
2. **Information Density**: Use subtle backgrounds and spacing to group related information
3. **Progressive Disclosure**: Show residence type names only when multiple types exist
4. **Icon-First Design**: Lead with visual icons rather than text labels where possible

## Template-Specific Notes

### population-level-config-dialog.html
- Implements headerless table design with conditional residence type display
- Uses population summary section with prominent total residents display
- Follows inline-list-centered pattern for all resident count displays

### population-tile.html  
- Separates editable buildings input from read-only residents display
- Uses background styling to distinguish calculated values
- Maintains compact tile layout while improving visual hierarchy

## Binding Context Reminders
- Use `$root.texts.residents.name()` for localized text
- Use `formatNumber()` and `formatPercentage()` as global functions (no $root prefix)
- Access nested properties carefully: `$data.need.product` not `$data.product`