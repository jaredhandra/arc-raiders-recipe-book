import { GameItem, loadItems } from "../data";

/**
 * Tool definition for searching items in the Arc Raiders database with various filters.
 * @type {Object}
 */
export const searchItemsTool = {
  name: "search_items",
  description: "Search for items in the Arc Raiders database with various filters",
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
};

/**
 * Searches for items based on various criteria like name, type, rarity, and value.
 * @param {Object} query - The search query parameters
 * @param {string} [query.name] - Partial item name to search for
 * @param {string} [query.type] - Item type to filter by
 * @param {string} [query.rarity] - Item rarity to filter by
 * @param {boolean} [query.craftable] - If true, only return craftable items
 * @param {number} [query.minValue] - Minimum item value threshold
 * @param {number} [query.maxValue] - Maximum item value threshold
 * @param {string} [query.language="en"] - Language code for item names
 * @returns {GameItem[]} Array of items matching the search criteria
 */
export function handleSearchItems(query: {
  name?: string;
  type?: string;
  rarity?: string;
  craftable?: boolean;
  minValue?: number;
  maxValue?: number;
  language?: string;
}): GameItem[] {
  const items = loadItems();
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

/**
 * Tool definition for retrieving a specific item by its ID.
 * @type {Object}
 */
export const getItemByIdTool = {
  name: "get_item_by_id",
  description: "Get detailed information about a specific item by ID",
  inputSchema: {
    type: "object",
    properties: {
      itemId: { type: "string", description: "Item ID (e.g., 'adrenaline_shot')" },
      language: { type: "string", description: "Language code (default: 'en')", default: "en" },
    },
    required: ["itemId"],
  },
};

export async function handleGetItemById(
  itemId: string,
  language: string = "en"
): Promise<GameItem | null> {
  const items = await loadItems();
  return items.find((item) => item.id === itemId) || null;
}

export async function handleGetItemsByType(): Promise<Record<string, GameItem[]>> {
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

export async function handleGetItemsByRarity(): Promise<Record<string, GameItem[]>> {
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
