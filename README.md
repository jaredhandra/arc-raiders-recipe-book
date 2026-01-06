# Arc Raiders Recipe Book MCP Server

A Model Context Protocol (MCP) server for querying and analyzing game items from Arc Raiders. Provides tools for searching items, retrieving recipes, analyzing crafting chains, and comparing item properties.

## Features

- **Search Items** — Filter items by name, type, rarity, value, and craftability
- **Get Item Details** — Retrieve complete information about a specific item
- **View Recipes** — Get crafting recipes with ingredients and required craft benches
- **Analyze Crafting Chains** — Trace all materials needed recursively for crafting an item
- **Group Items** — View all items grouped by type or rarity
- **Check Recycling Values** — See what materials items can be recycled or salvaged into
- **Compare Items** — Side-by-side comparison of item properties

## Installation

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm 10.18.2+

### Setup

1. Clone the repository:

```bash
git clone https://github.com/jaredhandra/arc-raiders-recipe-book.git
cd arc-raiders-recipe-book
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm run build
```

## Usage

### Starting the Server

```bash
pnpm start
```

The server will start on stdio and be ready to receive MCP requests.

### Development

For development with auto-reload:

```bash
pnpm run dev
```

### Type Checking

```bash
pnpm run type-check
```

## Available Tools

### search_items

Search for items with multiple filter options.

**Parameters:**

- `name` (string, optional) — Partial item name to search for
- `type` (string, optional) — Item type to filter by
- `rarity` (string, optional) — Rarity level to filter by
- `craftable` (boolean, optional) — Only return craftable items
- `minValue` (number, optional) — Minimum item value
- `maxValue` (number, optional) — Maximum item value
- `language` (string, optional, default: "en") — Language code for results

**Returns:** Array of matching items

### get_item

Retrieve complete information about a specific item.

**Parameters:**

- `itemId` (string, required) — The item's unique identifier
- `language` (string, optional, default: "en") — Language code

**Returns:** GameItem object or null if not found

### get_recipe

Get the crafting recipe for an item.

**Parameters:**

- `itemId` (string, required) — The item ID to get the recipe for

**Returns:** Object with item, ingredients array, and craft bench name, or null if no recipe

### get_crafting_chain

Analyze the complete crafting chain recursively.

**Parameters:**

- `itemId` (string, required) — The item to analyze

**Returns:** Object with the item and complete crafting chain organized by depth level

**Throws:** Error if item not found

### get_items_by_type

Group all items by their type.

**Parameters:** None

**Returns:** Object with item types as keys and item arrays as values

### get_items_by_rarity

Group all items by their rarity level.

**Parameters:** None

**Returns:** Object with rarity levels as keys and item arrays as values

### get_recycling_value

Check what materials an item recycles or salvages into.

**Parameters:**

- `itemId` (string, required) — The item to check

**Returns:** Object with recycling/salvaging information and total material value, or null if not found

### compare_items

Compare multiple items side by side.

**Parameters:**

- `itemIds` (string[], required) — Array of item IDs to compare

**Returns:** Object with items array and comparison data (value, weight, stack size, craftability)

## Project Structure

```
src/
├── index.ts              # MCP server setup and request handlers
├── data.ts               # Type definitions and item data loading
└── tools/
    ├── index.ts          # Tool exports
    ├── searchTools.ts    # Search functionality
    ├── recipeTools.ts    # Recipe and crafting chain tools
    └── statsTools.ts     # Aggregation and comparison tools

dist/                      # Compiled JavaScript output
```

## Type Definitions

### GameItem

```typescript
interface GameItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  type: string;
  value: number;
  rarity: string;
  weightKg: number;
  stackSize: number;
  imageFilename: string;
  updatedAt: string;
  recipe?: RecipeIngredients;
  craftBench?: string;
  recyclesInto?: RecipeIngredients;
  salvagesInto?: RecipeIngredients;
  effects?: Effect;
}
```

### LocalizedString

```typescript
interface LocalizedString {
  en: string;
  [key: string]: string;
}
```

## Configuration

The project uses `pnpm` as the package manager, specified in `package.json`:

```json
"packageManager": "pnpm@10.18.2"
```

TypeScript configuration is in `tsconfig.json` with strict mode enabled.

## Development

### Code Formatting

This project uses Prettier for code formatting. Files are automatically formatted on save if you have the Prettier extension installed:

```bash
code --install-extension esbenp.prettier-vscode
```

Configuration is in `.prettierrc`.

### Building

Compile TypeScript to JavaScript:

```bash
pnpm run build
```

Clean build artifacts:

```bash
pnpm run clean
```

## Integration

To use this MCP server with Claude or other MCP clients, ensure your client is configured to connect to the server's stdio output.

### Example MCP Configuration

```json
{
  "mcpServers": {
    "arc-raiders": {
      "command": "node",
      "args": ["/path/to/arc-raiders-recipe-book/dist/index.js"]
    }
  }
}
```

## Future Enhancements

- Integrate with `@arcraiders/data` package for automatic data updates
- Add async item loading with caching on server startup
- Support for additional item properties and filtering
- Performance optimizations for large item databases
- WebSocket support for real-time updates
- Caching and indexing for faster searches

## License

ISC

## Author

Jared Handra
