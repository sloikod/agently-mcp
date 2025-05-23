/**
 * MCP Server for Agently Agent Discovery.
 * Provides a tool to discover public agents by calling the Agently REST API.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js"; 
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// Import necessary request/result schemas for setRequestHandler
import { 
    CallToolRequestSchema, 
    ListToolsRequestSchema, 
    CallToolResult, 
    ListToolsResult 
} from "@modelcontextprotocol/sdk/types.js";

// Define Zod schema for query parameter validation (mirrors the REST API)
const GetPublicAgentsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    searchTerm: z.string().max(250).optional(),
    categories: z.preprocess((val) => typeof val === 'string' ? val.split(',') : val, z.array(z.string()).max(20).optional()),
    inputModes: z.preprocess((val) => typeof val === 'string' ? val.split(',') : val, z.array(z.string()).max(20).optional()),
    outputModes: z.preprocess((val) => typeof val === 'string' ? val.split(',') : val, z.array(z.string()).max(20).optional()),
    skillTags: z.preprocess((val) => typeof val === 'string' ? val.split(',') : val, z.array(z.string()).max(20).optional()),
    sortByName: z.enum(['a-z', 'z-a']).optional(),
    sortByCreatedAt: z.enum(['newest', 'oldest']).optional(),
    sortByUpdatedAt: z.enum(['newest', 'oldest']).optional(),
    sortBySuccessRate: z.enum(['highest', 'lowest']).optional(),
    sortByUsage: z.enum(['highest', 'lowest']).optional(),
    sortByRequestPrice: z.enum(['highest', 'lowest']).optional(),
    sortByStreamingPrice: z.enum(['highest', 'lowest']).optional(),
});

// Add the explanation field to the Zod schema
const GetPublicAgentsQuerySchemaWithExplanation = GetPublicAgentsQuerySchema.extend({
    explanation: z.string().optional(),
});

// Type helper (can be used for validation within CallTool handler)
type AgentDiscoveryInput = z.infer<typeof GetPublicAgentsQuerySchemaWithExplanation>;

// --- Configuration ---
const AGENTS_API_BASE_URL = "https://agently.gg"; // <-- Hardcoded base URL
const AGENT_API_ENDPOINT = `${AGENTS_API_BASE_URL}/api/agents/v1`;

/**
 * Create an MCP server instance using the Server class.
 */
const server = new Server(
  {
    name: "agently",
    version: "1.0.3",
  },
  // Re-add capabilities definition for Server class
  {
      capabilities: {
          tools: {} // Indicate tool support is enabled
          // resources: {}, // Add if needed
          // prompts: {}, // Add if needed
      }
  }
);

/**
 * Handler that lists available tools.
 * Exposes the "fetch_agents" tool.
 */
server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
  return {
    tools: [
      {
        name: "fetch_agents",
        description: "Fetches the public Agently agents based on filtering, sorting, and pagination criteria. The most used agents with the highest success rates are usually the best.",
        inputSchema: { 
            type: "object",
            properties: {
                page: { type: "number", description: "Page number for pagination (min 1)", default: 1 },
                limit: { type: "number", description: "Number of items per page (min 1, max 50)", default: 10 },
                searchTerm: { type: "string", description: "Text to search in agent names/descriptions (max 250 chars)", maxLength: 250 },
                categories: { 
                    type: "array", 
                    items: { 
                        type: "string",
                        enum: [
                            "Accounting",
                            "Activism",
                            "Acting",
                            "Adventure",
                            "Agriculture",
                            "Animals",
                            "Anthropology",
                            "Archaeology",
                            "Architecture",
                            "Art",
                            "Astronomy",
                            "Auditing",
                            "Automotive",
                            "Automation",
                            "Aviation",
                            "Biology",
                            "Bookkeeping",
                            "Botany",
                            "Broadcasting",
                            "Business",
                            "Cartography",
                            "Ceremonies",
                            "Childcare",
                            "Coaching and Teaching",
                            "Communication",
                            "Community",
                            "Competition",
                            "Compliance",
                            "Conservation",
                            "Construction",
                            "Consulting",
                            "Content Creation",
                            "Copywriting",
                            "Counseling and Therapy",
                            "Crafts",
                            "Crowdsourcing",
                            "Cryptocurrency",
                            "Cybersecurity",
                            "Dance",
                            "Data Analysis",
                            "Data Handling",
                            "Debating",
                            "Demolition",
                            "Design",
                            "Disaster Response and Recovery",
                            "Editing",
                            "Education",
                            "Emergency Services",
                            "Engineering",
                            "Entrepreneurship",
                            "Environmental Protection",
                            "Esports",
                            "Event Management",
                            "Exploration",
                            "Fact Checking",
                            "Family and Care",
                            "Fashion and Beauty",
                            "Film",
                            "Finance",
                            "Fitness",
                            "Food and Nutrition",
                            "Forensics",
                            "Fun",
                            "Gaming",
                            "Gardening",
                            "Geography",
                            "Geology",
                            "Graphic Design",
                            "Grooming",
                            "Gym",
                            "Healthcare",
                            "History",
                            "Hospitality",
                            "Human Resources",
                            "Humor",
                            "Information Technology",
                            "Innovation",
                            "Insurance",
                            "Interior Design",
                            "International Relations",
                            "Inventory Management",
                            "Investing",
                            "IT Support",
                            "Journalism",
                            "Language Learning",
                            "Law Enforcement",
                            "Lead Generation",
                            "Leadership",
                            "Literature and Poetry",
                            "Logistics",
                            "Maintenance",
                            "Manufacturing",
                            "Marketing",
                            "Math",
                            "Mental Health",
                            "Military",
                            "Mining",
                            "Music",
                            "Navigation",
                            "Negotiation",
                            "Network Management",
                            "Observation",
                            "Parenting",
                            "Personal Assistant",
                            "Philosophy",
                            "Photography",
                            "Physical Exercise",
                            "Physics",
                            "Planning",
                            "Policy Analysis",
                            "Politics",
                            "Problem Solving",
                            "Procurement and Sourcing",
                            "Product Management",
                            "Project Management",
                            "Public Health",
                            "Public Relations",
                            "Publishing",
                            "Quality Assurance",
                            "Quantum Computing",
                            "Real Estate",
                            "Recruiting",
                            "Recycling",
                            "Religion",
                            "Reporting",
                            "Research",
                            "Retail",
                            "Risk Management",
                            "Robotics",
                            "Sales",
                            "Sanitation",
                            "Science",
                            "Security",
                            "Senior Care",
                            "Service Industry",
                            "Social Media",
                            "Social Work",
                            "Software",
                            "Software Engineering",
                            "Sound Design",
                            "Space",
                            "Sports",
                            "Strategy",
                            "Sustainability",
                            "Supply Chain",
                            "Support and Service Industry",
                            "Teaching",
                            "Technology",
                            "Therapy",
                            "Training and Tutoring",
                            "Translation",
                            "Transportation",
                            "Tutoring",
                            "UI Design",
                            "Utilities",
                            "UX Design",
                            "Vehicle Operation",
                            "Video Production",
                            "Virtual Worlds",
                            "Voice",
                            "Volunteer",
                            "Wellness and Fitness",
                            "Waste Management",
                            "Writing and Storytelling",
                            "Travel",
                            "Urban Planning",
                            "Energy",
                            "Telecommunications",
                            "Ethics",
                            "Government",
                            "Pets"
                        ]
                    }, 
                    description: "Filter by categories. Providing multiple values acts as an AND filter (narrows results). Max 20 items.", 
                    maxItems: 20 
                },
                inputModes: { 
                    type: "array", 
                    items: { type: "string" }, 
                    description: "Filter by input MIME Types (e.g., 'text/plain'). Providing multiple values acts as an AND filter. Max 20 items.", 
                    maxItems: 20 
                },
                outputModes: { 
                    type: "array", 
                    items: { type: "string" }, 
                    description: "Filter by output MIME Types (e.g., 'text/plain,image/png,video/mp4'). Providing multiple values acts as an AND filter. Max 20 items.", 
                    maxItems: 20 
                },
                skillTags: { 
                    type: "array", 
                    items: { type: "string" }, 
                    description: "Filter by skill tags (e.g., 'language,translation,2025'). Providing multiple values acts as an AND filter. Max 20 items.", 
                    maxItems: 20 
                },
                sortByName: { type: "string", enum: ['a-z', 'z-a'], description: "Sort by name, A-Z or Z-A" },
                sortByCreatedAt: { type: "string", enum: ['newest', 'oldest'], description: "Sort by creation date" },
                sortByUpdatedAt: { type: "string", enum: ['newest', 'oldest'], description: "Sort by update date" },
                sortBySuccessRate: { type: "string", enum: ['highest', 'lowest'], description: "Sort by success rate" },
                sortByUsage: { type: "string", enum: ['highest', 'lowest'], description: "Sort by usage count" },
                sortByRequestPrice: { type: "string", enum: ['highest', 'lowest'], description: "Sort by average request price" },
                sortByStreamingPrice: { type: "string", enum: ['highest', 'lowest'], description: "Sort by average streaming price per second" },
                explanation: { type: "string", description: "Optional explanation for the request (free text)" }
            },
        }
      }
    ]
  };
});

/**
 * Handler for calling tools.
 * Implements the logic for "fetch_agents".
 */
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  // console.log("Received tool call request:", request); // Remove logging

  if (request.params.name === "fetch_agents") {
      // console.log("Calling fetch agents tool with arguments:", request.params.arguments); // Remove logging

      // --- Argument Validation (Manual using Zod) ---
      const validationResult = GetPublicAgentsQuerySchemaWithExplanation.safeParse(request.params.arguments || {});
      if (!validationResult.success) {
        //   console.error("Invalid arguments for fetch agents:", validationResult.error.flatten());
          return {
              isError: true,
              content: [{
                  type: "text",
                  text: `Invalid input parameters: ${JSON.stringify(validationResult.error.flatten())}`
              }]
          };
      }
      const validatedInput: AgentDiscoveryInput = validationResult.data;
      // --- End Validation ---

      const apiUrl = new URL(AGENT_API_ENDPOINT);
      const params = new URLSearchParams();

      // Append validated parameters (same logic as before)
      params.set('page', String(validatedInput.page));
      params.set('limit', String(validatedInput.limit));
      if (validatedInput.searchTerm) params.set('searchTerm', validatedInput.searchTerm);
      if (validatedInput.categories?.length) params.set('categories', validatedInput.categories.join(','));
      if (validatedInput.inputModes?.length) params.set('inputModes', validatedInput.inputModes.join(','));
      if (validatedInput.outputModes?.length) params.set('outputModes', validatedInput.outputModes.join(','));
      if (validatedInput.skillTags?.length) params.set('skillTags', validatedInput.skillTags.join(','));
      if (validatedInput.sortByName) params.set('sortByName', validatedInput.sortByName);
      if (validatedInput.sortByCreatedAt) params.set('sortByCreatedAt', validatedInput.sortByCreatedAt);
      if (validatedInput.sortByUpdatedAt) params.set('sortByUpdatedAt', validatedInput.sortByUpdatedAt);
      if (validatedInput.sortBySuccessRate) params.set('sortBySuccessRate', validatedInput.sortBySuccessRate);
      if (validatedInput.sortByUsage) params.set('sortByUsage', validatedInput.sortByUsage);
      if (validatedInput.sortByRequestPrice) params.set('sortByRequestPrice', validatedInput.sortByRequestPrice);
      if (validatedInput.sortByStreamingPrice) params.set('sortByStreamingPrice', validatedInput.sortByStreamingPrice);
      if (validatedInput.explanation) params.set('explanation', validatedInput.explanation);

      // Manually replace %20 with + for API compatibility
      apiUrl.search = params.toString().replace(/%20/g, '+'); 

      // console.log("Fetching from API URL:", apiUrl.toString()); // Removed log

      try {
          const response = await fetch(apiUrl.toString(), {
              method: 'GET',
              headers: { 'Accept': 'application/json' }
          });

          // console.log("API Response Status:", response.status); // Removed log

          if (!response.ok) {
              const errorBody = await response.text();
              console.error("API Error:", errorBody);
              return {
                  isError: true,
                  content: [{ type: "text", text: `API request failed with status ${response.status}: ${errorBody}` }]
              };
          }

          const result = await response.json();
          // console.log("API Response Body:", result); // Removed log

          if (!result || typeof result !== 'object' || !result.found_agents || !result.pagination) {
               console.error("Unexpected API response format:", result);
               return {
                  isError: true,
                  content: [{ type: "text", text: "Received unexpected format from Agently API" }]
               };
          }

          // Format the result for MCP (encoding JSON in text block)
          return {
              content: [{
                  type: "text", 
                  text: JSON.stringify(result.found_agents, null, 2)
              }],
              _meta: {
                  pagination: result.pagination
              }
          };

      } catch (error) {
        //    console.error("Error calling Agently API:", error);
           let errorMessage = "An unknown error occurred";
           if (error instanceof Error) {
               errorMessage = error.message;
           }
           return {
              isError: true,
              content: [{ type: "text", text: `Failed to call Agently API: ${errorMessage}` }]
           };
      }

  } else {
      // Handle unknown tool calls if necessary
    //   console.warn("Received call for unknown tool:", request.params.name); // Add logging
      return {
          isError: true,
          content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }]
      };
  }
});

// --- Removed example Note handlers ---

/**
 * Start the server using stdio transport.
 */
async function main() {
//   console.error(`Starting Agently Discovery MCP Server (using Server class)...`); // Use console.error
//   console.error(`Connecting to Agently API at: ${AGENT_API_ENDPOINT}`); // Use console.error
  const transport = new StdioServerTransport();
  await server.connect(transport);
//   console.error("MCP Server connected via stdio transport."); // Use console.error
}

main().catch((error) => {
//   console.error("Server error:", error);
  process.exit(1);
});
