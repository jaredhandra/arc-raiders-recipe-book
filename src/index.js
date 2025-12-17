"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var promises_1 = require("fs/promises");
var path_1 = require("path");
// Path to your JSON file
var ITEMS_FILE = path_1.default.join(process.cwd(), "items.json");
// Load items from file
function loadItems() {
    return __awaiter(this, void 0, void 0, function () {
        var data, parsed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promises_1.default.readFile(ITEMS_FILE, "utf-8")];
                case 1:
                    data = _a.sent();
                    parsed = JSON.parse(data);
                    return [2 /*return*/, Array.isArray(parsed) ? parsed : [parsed]];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error loading items:", error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Tool implementations
function searchItems(query) {
    return __awaiter(this, void 0, void 0, function () {
        var items, lang;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    lang = query.language || "en";
                    return [2 /*return*/, items.filter(function (item) {
                            var _a;
                            if (query.name && !((_a = item.name[lang]) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.name.toLowerCase()))) {
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
                        })];
            }
        });
    });
}
function getItemById(itemId_1) {
    return __awaiter(this, arguments, void 0, function (itemId, language) {
        var items;
        if (language === void 0) { language = "en"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    return [2 /*return*/, items.find(function (item) { return item.id === itemId; }) || null];
            }
        });
    });
}
function getRecipe(itemId) {
    return __awaiter(this, void 0, void 0, function () {
        var items, item, ingredients;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    item = items.find(function (i) { return i.id === itemId; });
                    if (!item || !item.recipe) {
                        return [2 /*return*/, null];
                    }
                    ingredients = Object.entries(item.recipe).map(function (_a) {
                        var id = _a[0], quantity = _a[1];
                        var ingredientItem = items.find(function (i) { return i.id === id; });
                        return {
                            id: id,
                            name: (ingredientItem === null || ingredientItem === void 0 ? void 0 : ingredientItem.name.en) || id,
                            quantity: quantity,
                        };
                    });
                    return [2 /*return*/, {
                            item: item,
                            ingredients: ingredients,
                            craftBench: item.craftBench || "unknown",
                        }];
            }
        });
    });
}
function getCraftingChain(itemId) {
    return __awaiter(this, void 0, void 0, function () {
        function traverse(currentId, depth, quantity) {
            if (visited.has(currentId))
                return;
            visited.add(currentId);
            var current = items.find(function (i) { return i.id === currentId; });
            if (!current)
                return;
            chain.push({ depth: depth, item: current, quantity: quantity });
            if (current.recipe) {
                Object.entries(current.recipe).forEach(function (_a) {
                    var ingredientId = _a[0], ingredientQty = _a[1];
                    traverse(ingredientId, depth + 1, ingredientQty * quantity);
                });
            }
        }
        var items, item, chain, visited;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    item = items.find(function (i) { return i.id === itemId; });
                    if (!item) {
                        throw new Error("Item ".concat(itemId, " not found"));
                    }
                    chain = [];
                    visited = new Set();
                    traverse(itemId, 0, 1);
                    return [2 /*return*/, { item: item, chain: chain }];
            }
        });
    });
}
function getItemsByType() {
    return __awaiter(this, void 0, void 0, function () {
        var items, byType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    byType = {};
                    items.forEach(function (item) {
                        if (!byType[item.type]) {
                            byType[item.type] = [];
                        }
                        byType[item.type].push(item);
                    });
                    return [2 /*return*/, byType];
            }
        });
    });
}
function getItemsByRarity() {
    return __awaiter(this, void 0, void 0, function () {
        var items, byRarity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    byRarity = {};
                    items.forEach(function (item) {
                        if (!byRarity[item.rarity]) {
                            byRarity[item.rarity] = [];
                        }
                        byRarity[item.rarity].push(item);
                    });
                    return [2 /*return*/, byRarity];
            }
        });
    });
}
function getRecyclingValue(itemId) {
    return __awaiter(this, void 0, void 0, function () {
        var items, item, totalValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    item = items.find(function (i) { return i.id === itemId; });
                    if (!item)
                        return [2 /*return*/, null];
                    totalValue = 0;
                    if (item.recyclesInto) {
                        totalValue += Object.values(item.recyclesInto).reduce(function (sum, qty) { return sum + qty; }, 0);
                    }
                    if (item.salvagesInto) {
                        totalValue += Object.values(item.salvagesInto).reduce(function (sum, qty) { return sum + qty; }, 0);
                    }
                    return [2 /*return*/, {
                            item: item,
                            recyclesInto: item.recyclesInto,
                            salvagesInto: item.salvagesInto,
                            totalMaterialValue: totalValue,
                        }];
            }
        });
    });
}
function compareItems(itemIds) {
    return __awaiter(this, void 0, void 0, function () {
        var items, selectedItems, comparison;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadItems()];
                case 1:
                    items = _a.sent();
                    selectedItems = items.filter(function (item) { return itemIds.includes(item.id); });
                    comparison = {
                        value: {},
                        weight: {},
                        stackSize: {},
                        craftable: {},
                    };
                    selectedItems.forEach(function (item) {
                        comparison.value[item.id] = item.value;
                        comparison.weight[item.id] = item.weightKg;
                        comparison.stackSize[item.id] = item.stackSize;
                        comparison.craftable[item.id] = !!item.recipe;
                    });
                    return [2 /*return*/, { items: selectedItems, comparison: comparison }];
            }
        });
    });
}
// Create MCP server
var server = new index_js_1.Server({
    name: "game-items-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Register tool handlers
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
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
            }];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, _b, results, _c, itemId, language, item, itemId, recipe, itemId, chain, byType, byRarity, itemId, value, itemIds, comparison, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = request.params, name = _a.name, args = _a.arguments;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 20, , 21]);
                _b = name;
                switch (_b) {
                    case "search_items": return [3 /*break*/, 2];
                    case "get_item": return [3 /*break*/, 4];
                    case "get_recipe": return [3 /*break*/, 6];
                    case "get_crafting_chain": return [3 /*break*/, 8];
                    case "get_items_by_type": return [3 /*break*/, 10];
                    case "get_items_by_rarity": return [3 /*break*/, 12];
                    case "get_recycling_value": return [3 /*break*/, 14];
                    case "compare_items": return [3 /*break*/, 16];
                }
                return [3 /*break*/, 18];
            case 2: return [4 /*yield*/, searchItems(args)];
            case 3:
                results = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2),
                            },
                        ],
                    }];
            case 4:
                _c = args, itemId = _c.itemId, language = _c.language;
                return [4 /*yield*/, getItemById(itemId, language)];
            case 5:
                item = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: item ? JSON.stringify(item, null, 2) : "Item not found",
                            },
                        ],
                    }];
            case 6:
                itemId = args.itemId;
                return [4 /*yield*/, getRecipe(itemId)];
            case 7:
                recipe = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: recipe ? JSON.stringify(recipe, null, 2) : "No recipe found for this item",
                            },
                        ],
                    }];
            case 8:
                itemId = args.itemId;
                return [4 /*yield*/, getCraftingChain(itemId)];
            case 9:
                chain = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(chain, null, 2),
                            },
                        ],
                    }];
            case 10: return [4 /*yield*/, getItemsByType()];
            case 11:
                byType = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(byType, null, 2),
                            },
                        ],
                    }];
            case 12: return [4 /*yield*/, getItemsByRarity()];
            case 13:
                byRarity = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(byRarity, null, 2),
                            },
                        ],
                    }];
            case 14:
                itemId = args.itemId;
                return [4 /*yield*/, getRecyclingValue(itemId)];
            case 15:
                value = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: value ? JSON.stringify(value, null, 2) : "Item not found",
                            },
                        ],
                    }];
            case 16:
                itemIds = args.itemIds;
                return [4 /*yield*/, compareItems(itemIds)];
            case 17:
                comparison = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(comparison, null, 2),
                            },
                        ],
                    }];
            case 18: throw new Error("Unknown tool: ".concat(name));
            case 19: return [3 /*break*/, 21];
            case 20:
                error_2 = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)),
                            },
                        ],
                        isError: true,
                    }];
            case 21: return [2 /*return*/];
        }
    });
}); });
// Start server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Game Items MCP server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Server error:", error);
    process.exit(1);
});
