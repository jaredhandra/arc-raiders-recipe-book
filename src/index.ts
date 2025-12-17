import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// Type definitions based on your JSON structure
interface LocalizedString {
  en: string;
  [key: string]: string;
}

interface Effect {
  [key: string]: LocalizedString & { value: string };
}

interface RecipeIngredients {
  [key: string]: number;
}

interface GameItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  type: string;
  value: number;
  rarity: string;
  recyclesInto?: RecipeIngredients;
  weightKg: number;
  stackSize: number;
  effects?: Effect;
  imageFilename: string;
  updatedAt: string;
  recipe?: RecipeIngredients;
  craftBench?: string;
  salvagesInto?: RecipeIngredients;
}

// Path to your JSON file
const ITEMS_FILE = path.join(process.cwd(), "items.json");

// Load items from file
async function loadItems(): Promise<GameItem[]> {
  try {
    const data = await fs.readFile(ITEMS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Error loading items:", error);
    return [];
  }
}

// Tool implementations
async function searchItems(query: {
  name?: string;
  type?: string;
  rarity?: string;
  craftable?: boolean;
  minValue?: number;
  maxValue?: number;
  language?: string;
}): Promise<GameItem[]> {
  const items = await loadItems();
  const lang = query.language || "en";
  
  return items.filter((item) => {
    if (query.name && !item.name[lang]?.toLowerCase().includes(query.name.toLowerCase())) {
      return false;
    }
    if (query.type && item.type.toLowerCase() !== query.type.toLowerCase()) {
      return false;
    }
    if (query.rarity && item.rarity.toLowerCase() !== query.rarity.toLowerCase()) {
      return false;
    }
    if (query.craftable !== undefined && query.craftable !== !!item.recipe) {
      return false;
    }
    if (query.minValue !== undefined && item.value < query.minValue) {
      return false;
    }
    if (query.maxValue !== undefined && item.value > query.maxValue) {
      return false;
    }
    return true;
  });
}

async function getItemById(itemId: string, language: string = "en"): Promise<GameItem | null> {
  const items = await loadItems();
  return items.find((item) => item.id === itemId) || null;
}

async function getRecipe(itemId: string): Promise<{
  item: GameItem;
  ingredients: Array<{ id: string; name: string; quantity: number }>;
  craftBench: string;
} | null> {
  const items = await loadItems();
  const item = items.find((i) => i.id === itemId);
  
  if (!item || !item.recipe) {
    return null;
  }
  
  const ingredients = Object.entries(item.recipe).map(([id, quantity]) => {
    const ingredientItem = items.find((i) => i.id === id);
    return {
      id,
      name: ingredientItem?.name.en || id,
      quantity,
    };
  });
  
  return {
    item,
    ingredients,
    craftBench: item.craftBench || "unknown",
  };
}

async function getCraftingChain(itemId: string): Promise<{
  item: GameItem;
  chain: Array<{ depth: number; item: GameItem; quantity: number }>;
}> {
  const items = await loadItems();
  const item = items.find((i) => i.id === itemId);
  
  if (!item) {
    throw new Error(`Item ${itemId} not found`);
  }
  
  const chain: Array<{ depth: number; item: GameItem; quantity: number }> = [];
  const visited = new Set<string>();
  
  function traverse(currentId: string, depth: number, quantity: number) {
    if (visited.has(currentId)) return;
    visited.add(currentId);
    
    const current = items.find((i) => i.id === currentId);
    if (!current) return;
    
    chain.push({ depth, item: current, quantity });
    
    if (current.recipe) {
      Object.entries(current.recipe).forEach(([ingredientId, ingredientQty]) => {
        traverse(ingredientId, depth + 1, ingredientQty * quantity);
      });
    }
  }
  
  traverse(itemId, 0, 1);
  
  return { item, chain };
}

async function getItemsByType(): Promise<Record<string, GameItem[]>> {
  const items = await loadItems();
  const byType: Record<string, GameItem[]> = {};
  
  items.forEach((item) => {
    if (!byType[item.type]) {
      byType[item.type] = [];
    }
    byType[item.type].push(item);
  });
  
  return byType;
}

async function getItemsByRarity(): Promise<Record<string, GameItem[]>> {
  const items = await loadItems();
  const byRarity: Record<string, GameItem[]> = {};
  
  items.forEach((item) => {
    if (!byRarity[item.rarity]) {
      byRarity[item.rarity] = [];
    }
    byRarity[item.rarity].push(item);
  });
  
  return byRarity;
}

async function getRecyclingValue(itemId: string): Promise<{
  item: GameItem;
  recyclesInto?: RecipeIngredients;
  salvagesInto?: RecipeIngredients;
  totalMaterialValue: number;
} | null> {
  const items = await loadItems();
  const item = items.find((i) => i.id === itemId);
  
  if (!item) return null;
  
  let totalValue = 0;
  
  if (item.recyclesInto) {
    totalValue += Object.values(item.recyclesInto).reduce((sum, qty) => sum + qty, 0);
  }
  
  if (item.salvagesInto) {
    totalValue += Object.values(item.salvagesInto).reduce((sum, qty) => sum + qty, 0);
  }
  
  return {
    item,
    recyclesInto: item.recyclesInto,
    salvagesInto: item.salvagesInto,
    totalMaterialValue: totalValue,
  };
}

async function compareItems(itemIds: string[]): Promise<{
  items: GameItem[];
  comparison: {
    value: Record<string, number>;
    weight: Record<string, number>;
    stackSize: Record<string, number>;
    craftable: Record<string, boolean>;
  };
}> {
  const items = await loadItems();
  const selectedItems = items.filter((item) => itemIds.includes(item.id));
  
  const comparison = {
    value: {} as Record<string, number>,
    weight: {} as Record<string, number>,
    stackSize: {} as Record<string, number>,
    craftable: {} as Record<string, boolean>,
  };
  
  selectedItems.forEach((item) => {
    comparison.value[item.id] = item.value;
    comparison.weight[item.id] = item.weightKg;
    comparison.stackSize[item.id] = item.stackSize;
    comparison.craftable[item.id] = !!item.recipe;
  });
  
  return { items: selectedItems, comparison };
}

// Create MCP server
const server = new Server(
  {
    name: "game-items-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_items",
        description: "Search for items in the game database with various filters",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Search by item name (partial match)" },
            type: { type: "string", description: "Filter by item type (e.g., 'Quick Use')" },
            rarity: { type: "string", description: "Filter by rarity (e.g., 'Common', 'Rare')" },
            craftable: { type: "boolean", description: "Filter craftable items only" },
            minValue: { type: "number", description: "Minimum item value" },
            maxValue: { type: "number", description: "Maximum item value" },
            language: { type: "string", description: "Language code (default: 'en')", default: "en" },
          },
        },
      },
      {
        name: "get_item",
        description: "Get detailed information about a specific item by ID",
        inputSchema: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "Item ID (e.g., 'adrenaline_shot')" },
            language: { type: "string", description: "Language code (default: 'en')", default: "en" },
          },
          required: ["itemId"],
        },
      },
      {
        name: "get_recipe",
        description: "Get the crafting recipe for an item including ingredients and craft bench",
        inputSchema: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "Item ID to get recipe for" },
          },
          required: ["itemId"],
        },
      },
      {
        name: "get_crafting_chain",
        description: "Get the full crafting chain showing all materials needed recursively",
        inputSchema: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "Item ID to analyze crafting chain for" },
          },
          required: ["itemId"],
        },
      },
      {
        name: "get_items_by_type",
        description: "Get all items grouped by their type",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_items_by_rarity",
        description: "Get all items grouped by their rarity",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_recycling_value",
        description: "Get what materials an item recycles or salvages into",
        inputSchema: {
          type: "object",
          properties: {
            itemId: { type: "string", description: "Item ID to check recycling value" },
          },
          required: ["itemId"],
        },
      },
      {
        name: "compare_items",
        description: "Compare multiple items side by side (value, weight, craftability, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            itemIds: {
              type: "array",
              items: { type: "string" },
              description: "Array of item IDs to compare",
            },
          },
          required: ["itemIds"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_items": {
        const results = await searchItems(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case "get_item": {
        const { itemId, language } = args as { itemId: string; language?: string };
        const item = await getItemById(itemId, language);
        return {
          content: [
            {
              type: "text",
              text: item ? JSON.stringify(item, null, 2) : "Item not found",
            },
          ],
        };
      }

      case "get_recipe": {
        const { itemId } = args as { itemId: string };
        const recipe = await getRecipe(itemId);
        return {
          content: [
            {
              type: "text",
              text: recipe ? JSON.stringify(recipe, null, 2) : "No recipe found for this item",
            },
          ],
        };
      }

      case "get_crafting_chain": {
        const { itemId } = args as { itemId: string };
        const chain = await getCraftingChain(itemId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(chain, null, 2),
            },
          ],
        };
      }

      case "get_items_by_type": {
        const byType = await getItemsByType();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(byType, null, 2),
            },
          ],
        };
      }

      case "get_items_by_rarity": {
        const byRarity = await getItemsByRarity();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(byRarity, null, 2),
            },
          ],
        };
      }

      case "get_recycling_value": {
        const { itemId } = args as { itemId: string };
        const value = await getRecyclingValue(itemId);
        return {
          content: [
            {
              type: "text",
              text: value ? JSON.stringify(value, null, 2) : "Item not found",
            },
          ],
        };
      }

      case "compare_items": {
        const { itemIds } = args as { itemIds: string[] };
        const comparison = await compareItems(itemIds);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(comparison, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Game Items MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});