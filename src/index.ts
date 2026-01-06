import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  compareItemsTool,
  getCraftingChainTool,
  getItemsByRarityTool,
  getItemsByTypeTool,
  getItemTool,
  getRecipeTool,
  getRecyclingValueTool,
  handleCompareItems,
  handleGetCraftingChain,
  handleGetItem,
  handleGetItemsByRarity,
  handleGetItemsByType,
  handleGetRecipe,
  handleGetRecyclingValue,
  handleSearchItems,
  searchItemsTool,
} from "./tools/index.js";

// Create MCP server
const server = new Server(
  {
    name: "arc-raiders-recipe-book",
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
      searchItemsTool,
      getItemTool,
      getRecipeTool,
      getCraftingChainTool,
      getItemsByTypeTool,
      getItemsByRarityTool,
      getRecyclingValueTool,
      compareItemsTool,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_items": {
        const results = handleSearchItems(args as any);
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
        const { itemId, language } = args as {
          itemId: string;
          language?: string;
        };
        const item = handleGetItem(itemId, language);
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
        const recipe = handleGetRecipe(itemId);
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
        const chain = handleGetCraftingChain(itemId);
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
        const byType = handleGetItemsByType();
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
        const byRarity = handleGetItemsByRarity();
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
        const value = handleGetRecyclingValue(itemId);
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
        const comparison = handleCompareItems(itemIds);
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
  console.error("arc-raiders-recipe-book server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
