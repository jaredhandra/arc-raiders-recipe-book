/**
 * Represents a string that can be localized into multiple languages.
 * @typedef {Object} LocalizedString
 * @property {string} en - English version of the string
 * @property {string} [key] - Other language versions
 */
export interface LocalizedString {
  en: string;
  [key: string]: string;
}

/**
 * Represents an item effect with localized description and numeric value.
 * @typedef {Object} Effect
 * @property {LocalizedString & {value: string}} [key] - Effect properties
 */
export interface Effect {
  [key: string]: LocalizedString & { value: string };
}

/**
 * Represents recipe ingredients or materials mapping item IDs to quantities.
 * @typedef {Object} RecipeIngredients
 * @property {number} [itemId] - Quantity of the ingredient needed
 */
export interface RecipeIngredients {
  [key: string]: number;
}

/**
 * Represents a game item with all its properties.
 * @typedef {Object} GameItem
 * @property {string} id - Unique identifier for the item
 * @property {LocalizedString} name - Localized item name
 * @property {LocalizedString} description - Localized item description
 * @property {string} type - Item type category
 * @property {number} value - Item's monetary value
 * @property {string} rarity - Item's rarity level (e.g., Common, Rare)
 * @property {number} weightKg - Item weight in kilograms
 * @property {number} stackSize - Maximum stack size
 * @property {string} imageFilename - Path to item's image asset
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {RecipeIngredients} [recipe] - Crafting recipe if item is craftable
 * @property {string} [craftBench] - Required craft bench for recipe
 * @property {RecipeIngredients} [recyclesInto] - Materials obtained from recycling
 * @property {RecipeIngredients} [salvagesInto] - Materials obtained from salvaging
 * @property {Effect} [effects] - Special effects or properties
 */
export interface GameItem {
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

import * as AllItems from "@arcraiders/data";

let cachedItems: GameItem[] | null = null;

/**
 * Loads all game items from the @arcraiders/data library.
 * Items are cached in memory after the first call for performance.
 *
 * @returns {GameItem[]} Array of all available game items
 * @example
 * const items = loadItems();
 * const adrenalineShot = items.find(item => item.id === 'adrenaline_shot');
 */
export function loadItems(): GameItem[] {
  if (cachedItems) {
    return cachedItems;
  }

  try {
    // Collect all item exports from the library
    const items: GameItem[] = [];

    Object.entries(AllItems).forEach(([key, value]) => {
      // Skip type definitions and non-object exports
      if (typeof value === "object" && value !== null && "id" in value) {
        items.push(value as GameItem);
      }
    });

    cachedItems = items;
    return cachedItems;
  } catch (error) {
    console.error("Error loading items from @arcraiders/data:", error);
    return [];
  }
}
