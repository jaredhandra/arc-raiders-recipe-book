import { GameItem, loadItems } from "../data.js";

/**
 * Tool definition for retrieving a specific item by its ID.
 * @type {Object}
 */
export const getItemTool = {
  name: "get_item",
  description: "Get detailed information about a specific item by ID",
  inputSchema: {
    type: "object",
    properties: {
      itemId: {
        type: "string",
        description: 'Item ID (e.g., "adrenaline_shot")',
      },
      language: {
        type: "string",
        description: 'Language code (default: "en")',
        default: "en",
      },
    },
    required: ["itemId"],
  },
};

/**
 * Retrieves detailed information about a specific item by its ID.
 * @param {string} itemId - The ID of the item to retrieve
 * @param {string} [language="en"] - Language code for item names and descriptions
 * @returns {GameItem | null} The item object, or null if not found
 */
export function handleGetItem(itemId: string, language: string = "en"): GameItem | null {
  const items = loadItems();
  return items.find((item) => item.id === itemId) || null;
}

/**
 * Tool definition for retrieving crafting recipes for items.
 * @type {Object}
 */
export const getRecipeTool = {
  name: "get_recipe",
  description: "Get the crafting recipe for an item including ingredients and craft bench",
  inputSchema: {
    type: "object",
    properties: {
      itemId: { type: "string", description: "Item ID to get recipe for" },
    },
    required: ["itemId"],
  },
};

/**
 * Retrieves the crafting recipe for a specific item, including ingredients and craft bench information.
 * @param {string} itemId - The ID of the item to get the recipe for
 * @returns {Object | null} An object containing the item, ingredients array, and craft bench name, or null if no recipe exists
 * @returns {GameItem} Returns.item - The item object
 * @returns {Array<{id: string, name: string, quantity: number}>} Returns.ingredients - Array of required ingredients
 * @returns {string} Returns.craftBench - Name of the craft bench required
 */
export function handleGetRecipe(itemId: string): {
  item: GameItem;
  ingredients: Array<{ id: string; name: string; quantity: number }>;
  craftBench: string;
} | null {
  const items = loadItems();
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

/**
 * Tool definition for analyzing the full crafting chain of items.
 * @type {Object}
 */
export const getCraftingChainTool = {
  name: "get_crafting_chain",
  description: "Get the full crafting chain showing all materials needed recursively",
  inputSchema: {
    type: "object",
    properties: {
      itemId: {
        type: "string",
        description: "Item ID to analyze crafting chain for",
      },
    },
    required: ["itemId"],
  },
};

/**
 * Analyzes the complete crafting chain for an item, showing all materials needed recursively at each depth level.
 * @param {string} itemId - The ID of the item to analyze
 * @returns {Object} An object containing the item and its complete crafting chain
 * @returns {GameItem} Returns.item - The target item being crafted
 * @returns {Array<{depth: number, item: GameItem, quantity: number}>} Returns.chain - The chain of items needed, organized by depth level
 * @throws {Error} If the item is not found in the database
 */
export function handleGetCraftingChain(itemId: string): {
  item: GameItem;
  chain: Array<{ depth: number; item: GameItem; quantity: number }>;
} {
  const items = loadItems();
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

export async function getCraftingChain(itemId: string): Promise<{
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
