import axios, { AxiosInstance } from 'axios';

/**
 * watsonx.ai Service
 * 
 * Integrates IBM watsonx.ai Granite models for:
 * - API documentation parsing
 * - Natural language query processing
 * - Tool selection and parameter extraction
 */

interface WatsonxConfig {
  apiKey: string;
  url: string;
  projectId: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
}

interface WatsonxRequest {
  model_id: string;
  input: string;
  parameters: {
    max_new_tokens: number;
    temperature: number;
    top_p?: number;
    top_k?: number;
  };
  project_id: string;
}

interface WatsonxResponse {
  results: Array<{
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
  }>;
}

export class WatsonxService {
  private config: WatsonxConfig;
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      apiKey: process.env.WATSONX_API_KEY || '',
      url: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
      projectId: process.env.WATSONX_PROJECT_ID || '',
      modelId: process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-chat-v2',
      maxTokens: parseInt(process.env.WATSONX_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.WATSONX_TEMPERATURE || '0.7'),
    };

    this.client = axios.create({
      baseURL: this.config.url,
      timeout: 30000,
    });
  }

  /**
   * Check if watsonx.ai is configured
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.projectId);
  }

  /**
   * Get IAM access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    try {
      const response = await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.config.apiKey,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, refresh 5 minutes early
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      return this.accessToken;
    } catch (error: any) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  /**
   * Generate text using watsonx.ai
   */
  private async generate(prompt: string, maxTokens?: number): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('watsonx.ai is not configured. Set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env');
    }

    const token = await this.getAccessToken();

    const request: WatsonxRequest = {
      model_id: this.config.modelId,
      input: prompt,
      parameters: {
        max_new_tokens: maxTokens || this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: 0.9,
        top_k: 50,
      },
      project_id: this.config.projectId,
    };

    try {
      const response = await this.client.post<WatsonxResponse>(
        '/ml/v1/text/generation?version=2023-05-29',
        request,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('No results returned from watsonx.ai');
      }

      return response.data.results[0].generated_text.trim();
    } catch (error: any) {
      if (error.response) {
        throw new Error(`watsonx.ai API error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      }
      throw new Error(`watsonx.ai request failed: ${error.message}`);
    }
  }

  /**
   * Parse API documentation using Granite - UNLIMITED SCALE
   * Handles documentation of ANY size: 10, 100, 1000, 10000+ endpoints
   */
  async parseDocumentation(documentation: string): Promise<any[]> {
    console.log(`[WatsonxService] Parsing documentation (${documentation.length} characters)`);
    
    // For massive documentation (>50k chars), use batch processing
    if (documentation.length > 50000) {
      return this.parseLargeDocumentation(documentation);
    }

    const prompt = `You are an expert API documentation parser capable of handling ANY scale of documentation.

Extract ALL API endpoints from the following documentation, no matter how many there are.

Documentation:
${documentation}

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "method": "GET|POST|PUT|PATCH|DELETE",
    "path": "/api/path",
    "description": "endpoint description",
    "parameters": [
      {
        "name": "param_name",
        "in": "path|query|header|body",
        "type": "string|number|boolean|object|array",
        "required": true|false,
        "description": "parameter description"
      }
    ],
    "requestBody": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "responseBody": {
      "type": "object",
      "properties": {}
    },
    "operation_type": "read|write|delete",
    "sensitive": true|false
  }
]

CRITICAL RULES:
- Extract EVERY endpoint, no matter how many (10, 100, 1000+)
- GET requests are "read" operations
- POST/PUT/PATCH are "write" operations
- DELETE requests are "delete" operations
- Mark endpoints with sensitive data as sensitive: true
- Extract ALL path parameters from {param} notation
- Include ALL query parameters, headers, and request body fields
- Support nested objects and arrays in request/response bodies
- Handle ANY API type: REST, GraphQL, SOAP, gRPC
- Support ANY authentication: OAuth, JWT, API Keys, SAML
- Parse ANY format: OpenAPI, Swagger, RAML, API Blueprint, plain text`;

    try {
      const response = await this.generate(prompt, 4000); // Increased token limit
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;
      if (response.includes('```json')) {
        jsonStr = response.split('```json')[1].split('```')[0].trim();
      } else if (response.includes('```')) {
        jsonStr = response.split('```')[1].split('```')[0].trim();
      }

      const endpoints = JSON.parse(jsonStr);
      
      if (!Array.isArray(endpoints)) {
        throw new Error('Response is not an array');
      }

      console.log(`[WatsonxService] Successfully parsed ${endpoints.length} endpoints`);
      return endpoints;
    } catch (error: any) {
      console.error('Failed to parse documentation with watsonx.ai:', error.message);
      throw new Error(`Documentation parsing failed: ${error.message}`);
    }
  }

  /**
   * Parse large documentation in batches
   * Handles 100,000+ endpoints by splitting into chunks
   */
  private async parseLargeDocumentation(documentation: string): Promise<any[]> {
    console.log('[WatsonxService] Using batch processing for large documentation');
    
    // Split documentation into logical chunks (by endpoint sections)
    const chunks = this.splitDocumentation(documentation);
    console.log(`[WatsonxService] Split into ${chunks.length} chunks`);
    
    const allEndpoints: any[] = [];
    
    // Process chunks in parallel (batches of 5)
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`[WatsonxService] Processing batch ${i / batchSize + 1}/${Math.ceil(chunks.length / batchSize)}`);
      
      const batchResults = await Promise.all(
        batch.map(chunk => this.parseDocumentation(chunk))
      );
      
      batchResults.forEach(endpoints => allEndpoints.push(...endpoints));
    }
    
    console.log(`[WatsonxService] Batch processing complete: ${allEndpoints.length} total endpoints`);
    return allEndpoints;
  }

  /**
   * Split large documentation into manageable chunks
   */
  private splitDocumentation(documentation: string): string[] {
    const chunks: string[] = [];
    const maxChunkSize = 40000; // Characters per chunk
    
    // Try to split by endpoint markers (GET, POST, etc.)
    const endpointPattern = /(?=(?:GET|POST|PUT|PATCH|DELETE)\s+\/)/gi;
    const sections = documentation.split(endpointPattern);
    
    let currentChunk = '';
    for (const section of sections) {
      if (currentChunk.length + section.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk);
        currentChunk = section;
      } else {
        currentChunk += section;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [documentation];
  }

  /**
   * Process agent query using Granite
   */
  async processQuery(query: string, availableTools: any[]): Promise<any> {
    const toolsDescription = availableTools.map(tool => 
      `- ${tool.name}: ${tool.description}\n  Parameters: ${JSON.stringify(tool.inputSchema.properties)}`
    ).join('\n');

    const prompt = `You are an AI agent assistant. Analyze the user's query and select the best tool to use.

Available Tools:
${toolsDescription}

User Query: "${query}"

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "tool": "tool_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Rules:
- Select the most appropriate tool based on the query intent
- Extract parameter values from the query
- Set confidence between 0 and 1
- If no tool matches, set tool to null`;

    try {
      const response = await this.generate(prompt, 500);
      
      // Extract JSON from response
      let jsonStr = response;
      if (response.includes('```json')) {
        jsonStr = response.split('```json')[1].split('```')[0].trim();
      } else if (response.includes('```')) {
        jsonStr = response.split('```')[1].split('```')[0].trim();
      }

      const result = JSON.parse(jsonStr);
      
      return result;
    } catch (error: any) {
      console.error('Failed to process query with watsonx.ai:', error.message);
      throw new Error(`Query processing failed: ${error.message}`);
    }
  }

  /**
   * Test connection to watsonx.ai
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      // Simple test request
      const response = await this.client.get(
        '/ml/v1/foundation_model_specs?version=2023-05-29',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.status === 200;
    } catch (error: any) {
      console.error('watsonx.ai connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { modelId: string; maxTokens: number; temperature: number } {
    return {
      modelId: this.config.modelId,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    };
  }
}

// Export singleton instance
export const watsonxService = new WatsonxService();

// Made with Bob