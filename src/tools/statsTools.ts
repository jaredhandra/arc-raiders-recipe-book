import { GameItem, loadItems, RecipeIngredients } from "../data.js";

/**
 * Tool definition for retrieving items grouped by type.
 * @type {Object}
 */
export const getItemsByTypeTool = {
  name: "get_items_by_type",
  description: "Get all items grouped by their type",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

/**
 * Groups all items in the database by their type category.
 * @returns {Record<string, GameItem[]>} An object where keys are item types and values are arrays of items of that type
 */
export function handleGetItemsByType(): Record<string, GameItem[]> {
  const items = loadItems();
  const byType: Record<string, GameItem[]> = {};

  items.forEach((item) => {
    if (!byType[item.type]) {
      byType[item.type] = [];
    }
    byType[item.type].push(item);
  });

  return byType;
}

/**
 * Tool definition for retrieving items grouped by rarity.
 * @type {Object}
 */
export const getItemsByRarityTool = {
  name: "get_items_by_rarity",
  description: "Get all items grouped by their rarity",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

/**
 * Groups all items in the database by their rarity level.
 * @returns {Record<string, GameItem[]>} An object where keys are rarity levels and values are arrays of items with that rarity
 */
export function handleGetItemsByRarity(): Record<string, GameItem[]> {
  const items = loadItems();
  const byRarity: Record<string, GameItem[]> = {};

  items.forEach((item) => {
    if (!byRarity[item.rarity]) {
      byRarity[item.rarity] = [];
    }
    byRarity[item.rarity].push(item);
  });

  return byRarity;
}

/**
 * Tool definition for checking recycling and salvaging values of items.
 * @type {Object}
 */
export const getRecyclingValueTool = {
  name: "get_recycling_value",
  description: "Get what materials an item recycles or salvages into",
  inputSchema: {
    type: "object",
    properties: {
      itemId: {
        type: "string",
        description: "Item ID to check recycling value",
      },
    },
    required: ["itemId"],
  },
};

/**
 * Retrieves what materials an item can be recycled or salvaged into.
 * @param {string} itemId - The ID of the item to check
 * @returns {Object | null} An object containing recycling/salvaging information, or null if item not found
 * @returns {GameItem} Returns.item - The item object
 * @returns {RecipeIngredients} [Returns.recyclesInto] - Materials obtained from recycling
 * @returns {RecipeIngredients} [Returns.salvagesInto] - Materials obtained from salvaging
 * @returns {number} Returns.totalMaterialValue - Combined count of all materials obtained
 */
export function handleGetRecyclingValue(itemId: string): {
  item: GameItem;
  recyclesInto?: RecipeIngredients;
  salvagesInto?: RecipeIngredients;
  totalMaterialValue: number;
} | null {
  const items = loadItems();
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

/**
 * Tool definition for comparing multiple items side by side.
 * @type {Object}
 */
export const compareItemsTool = {
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
};

/**
 * Compares multiple items side by side, showing their properties like value, weight, stack size, and craftability.
 * @param {string[]} itemIds - Array of item IDs to compare
 * @returns {Object} An object containing the selected items and their comparison data
 * @returns {GameItem[]} Returns.items - Array of the selected items
 * @returns {Object} Returns.comparison - Comparison data for the items
 * @returns {Record<string, number>} Returns.comparison.value - Item values indexed by item ID
 * @returns {Record<string, number>} Returns.comparison.weight - Item weights in kg indexed by item ID
 * @returns {Record<string, number>} Returns.comparison.stackSize - Item stack sizes indexed by item ID
 * @returns {Record<string, boolean>} Returns.comparison.craftable - Craftability status indexed by item ID
 */
export function handleCompareItems(itemIds: string[]): {
  items: GameItem[];
  comparison: {
    value: Record<string, number>;
    weight: Record<string, number>;
    stackSize: Record<string, number>;
    craftable: Record<string, boolean>;
  };
} {
  const items = loadItems();
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
