# Anno 117 Calculator

A calculator for the computer game [Anno 117](https://www.ubisoft.com/de-de/game/anno/117-pax-romana/) to compute the required production depending on the population 

## Development
* Getting started guide: docs/developer_guide.md
* Next features: .claude/anno-calculator-pm.md

## Knowledge Management

This project uses a structured knowledge management system with two complementary approaches:

### Memory MCP Server (Structured Knowledge)
- **Purpose**: Store structured knowledge with entities, relationships, and observations
- **Best for**: Code analysis, class hierarchies, dependencies, technical relationships
- **Setup**: Automatically configured via `.mcp.json` for Cursor IDE
- **Usage**: Ask Claude about code structure, dependencies, or technical relationships

### Claude.md (Semi-structured Knowledge)
- **Purpose**: Store semi-structured notes, documentation, and contextual information
- **Best for**: Project notes, decisions, explanations, documentation
- **Setup**: Automatically configured via `.cursor/mcp.json` for Cursor IDE
- **Storage**: Persists in `Claude.md` (version controlled)
- **Usage**: Use Claude.md functions for creating and managing markdown-based knowledge

### Examples
**For structured knowledge (memory MCP):**
- "What classes extend NamedElement?"
- "Show me the dependency graph for src/world.ts"
- "What modules import from src/util.ts?"

**For semi-structured knowledge (Claude.md):**
- "Create a project overview document"
- "Store notes about the TypeScript migration process"
- "Document the architecture decisions"

## License and contribution
* License: MIT except for params.js
* All the assets from Anno 1800 game are © by Ubisoft
* Author: Nico Höllerich
