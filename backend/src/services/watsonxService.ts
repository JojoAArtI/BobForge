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
      return this.accessToken;
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
   * Parse API documentation using Granite
   */
  async parseDocumentation(documentation: string): Promise<any[]> {
    const prompt = `You are an API documentation parser. Extract all API endpoints from the following documentation.

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
        "type": "string|number|boolean",
        "required": true|false,
        "description": "parameter description"
      }
    ],
    "operation_type": "read|write|delete",
    "sensitive": true|false
  }
]

Rules:
- GET requests are "read" operations
- POST/PUT/PATCH are "write" operations
- DELETE requests are "delete" operations
- Mark endpoints with sensitive data (employee, payroll, personal info) as sensitive: true
- Extract path parameters from {param} notation
- Include all query parameters and request body fields`;

    try {
      const response = await this.generate(prompt, 2000);
      
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

      return endpoints;
    } catch (error: any) {
      console.error('Failed to parse documentation with watsonx.ai:', error.message);
      throw new Error(`Documentation parsing failed: ${error.message}`);
    }
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