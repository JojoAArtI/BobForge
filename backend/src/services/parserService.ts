import { v4 as uuidv4 } from 'uuid';
import {
  Endpoint,
  EndpointsStorage,
  HttpMethod,
  OperationType,
  Parameter,
  ParsedEndpoint,
  ParserResult,
  ParsingError,
} from '../types';
import { readData, writeData } from '../utils/fileUtils';

const ENDPOINTS_FILE = 'endpoints.json';

// Sensitive keywords that indicate sensitive data
const SENSITIVE_KEYWORDS = [
  'payroll',
  'salary',
  'admin',
  'password',
  'secret',
  'token',
  'confidential',
  'personal',
  'private',
  'credit',
  'payment',
];

/**
 * Parser Service
 * Extracts API endpoints from documentation
 */
class ParserService {
  /**
   * Parse API documentation and extract endpoints
   * 
   * TODO: Replace with watsonx.ai Granite integration
   * This should use IBM watsonx.ai to intelligently parse API docs
   * For now, using pattern matching and mock data
   */
  async parseDocumentation(
    projectId: string,
    documentation: string
  ): Promise<Endpoint[]> {
    console.log(`[ParserService] Parsing documentation for project: ${projectId}`);

    try {
      // TODO: Call watsonx.ai Granite API here
      // const parsedEndpoints = await this.callWatsonxGranite(documentation);

      // For now, use mock parser
      const parsedEndpoints = this.mockParser(documentation);

      // Convert parsed endpoints to full endpoint objects
      const endpoints = parsedEndpoints.map((parsed) =>
        this.createEndpoint(projectId, parsed)
      );

      // Save endpoints to storage
      await this.saveEndpoints(endpoints);

      console.log(`[ParserService] Parsed ${endpoints.length} endpoints`);
      return endpoints;
    } catch (error) {
      console.error('[ParserService] Error parsing documentation:', error);
      throw new ParsingError('Failed to parse API documentation', error);
    }
  }

  /**
   * Mock parser using regex patterns
   * This will be replaced with watsonx.ai Granite
   */
  private mockParser(documentation: string): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = [];
    const lines = documentation.split('\n');

    let currentEndpoint: Partial<ParsedEndpoint> | null = null;
    let currentDescription = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match HTTP method and path: GET /path/{param}
      const methodMatch = line.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s]*)/i);

      if (methodMatch) {
        // Save previous endpoint if exists
        if (currentEndpoint && currentEndpoint.method && currentEndpoint.path) {
          endpoints.push(this.completeParsedEndpoint(currentEndpoint, currentDescription));
        }

        // Start new endpoint
        currentEndpoint = {
          method: methodMatch[1].toUpperCase() as HttpMethod,
          path: methodMatch[2],
          parameters: [],
        };
        currentDescription = '';
      } else if (currentEndpoint) {
        // Collect description lines
        if (line && !line.startsWith('Parameters:') && !line.startsWith('Body:')) {
          currentDescription += (currentDescription ? ' ' : '') + line;
        }

        // Parse parameters
        if (line.startsWith('-') && lines[i - 1]?.includes('Parameters:')) {
          const param = this.parseParameter(line);
          if (param) {
            currentEndpoint.parameters = currentEndpoint.parameters || [];
            currentEndpoint.parameters.push(param);
          }
        }
      }
    }

    // Save last endpoint
    if (currentEndpoint && currentEndpoint.method && currentEndpoint.path) {
      endpoints.push(this.completeParsedEndpoint(currentEndpoint, currentDescription));
    }

    return endpoints;
  }

  /**
   * Complete a parsed endpoint with defaults
   */
  private completeParsedEndpoint(
    partial: Partial<ParsedEndpoint>,
    description: string
  ): ParsedEndpoint {
    return {
      method: partial.method!,
      path: partial.path!,
      description: description || `${partial.method} ${partial.path}`,
      parameters: partial.parameters || [],
      requestBody: partial.requestBody,
      responseBody: partial.responseBody,
    };
  }

  /**
   * Parse a parameter line
   * Format: - name (location, required): type - description
   */
  private parseParameter(line: string): Parameter | null {
    // Example: - id (path, required): string - Employee ID
    const match = line.match(/^-\s*(\w+)\s*\(([^,]+),\s*(required|optional)\):\s*(\w+)/i);

    if (match) {
      return {
        name: match[1],
        in: match[2].trim() as Parameter['in'],
        required: match[3].toLowerCase() === 'required',
        type: match[4],
        description: line.split('-').slice(2).join('-').trim() || undefined,
      };
    }

    // Simpler format: - id: string (path parameter)
    const simpleMatch = line.match(/^-\s*(\w+):\s*(\w+)/);
    if (simpleMatch) {
      return {
        name: simpleMatch[1],
        in: 'query',
        required: false,
        type: simpleMatch[2],
      };
    }

    return null;
  }

  /**
   * Create a full endpoint object from parsed data
   */
  private createEndpoint(projectId: string, parsed: ParsedEndpoint): Endpoint {
    // Extract path parameters
    const pathParams = this.extractPathParameters(parsed.path);

    // Combine with parsed parameters
    const allParameters = [...pathParams, ...(parsed.parameters || [])];

    // Determine operation type
    const operationType = this.determineOperationType(parsed.method);

    // Check if endpoint is sensitive
    const sensitive = this.isSensitive(parsed.path, parsed.description);

    return {
      id: uuidv4(),
      projectId,
      method: parsed.method,
      path: parsed.path,
      description: parsed.description,
      operationType,
      sensitive,
      parameters: allParameters.length > 0 ? allParameters : undefined,
      requestBody: parsed.requestBody,
      responseBody: parsed.responseBody,
    };
  }

  /**
   * Extract path parameters from URL path
   * Example: /employees/{id}/leave/{leaveId} -> [id, leaveId]
   */
  private extractPathParameters(path: string): Parameter[] {
    const params: Parameter[] = [];
    const matches = path.matchAll(/\{(\w+)\}/g);

    for (const match of matches) {
      params.push({
        name: match[1],
        in: 'path',
        required: true,
        type: 'string',
        description: `Path parameter: ${match[1]}`,
      });
    }

    return params;
  }

  /**
   * Determine operation type from HTTP method
   */
  private determineOperationType(method: HttpMethod): OperationType {
    switch (method) {
      case 'GET':
        return 'read';
      case 'DELETE':
        return 'delete';
      case 'POST':
      case 'PUT':
      case 'PATCH':
        return 'write';
      default:
        return 'read';
    }
  }

  /**
   * Check if endpoint deals with sensitive data
   */
  private isSensitive(path: string, description: string): boolean {
    const text = `${path} ${description}`.toLowerCase();
    return SENSITIVE_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  /**
   * Save endpoints to storage
   */
  private async saveEndpoints(endpoints: Endpoint[]): Promise<void> {
    const storage = await readData<EndpointsStorage>(ENDPOINTS_FILE);

    // Add new endpoints
    storage.endpoints.push(...endpoints);

    await writeData(ENDPOINTS_FILE, storage);
  }

  /**
   * Get endpoints for a project
   */
  async getEndpoints(projectId: string): Promise<Endpoint[]> {
    const storage = await readData<EndpointsStorage>(ENDPOINTS_FILE);
    return storage.endpoints.filter((e) => e.projectId === projectId);
  }

  /**
   * Get a single endpoint by ID
   */
  async getEndpoint(id: string): Promise<Endpoint | null> {
    const storage = await readData<EndpointsStorage>(ENDPOINTS_FILE);
    return storage.endpoints.find((e) => e.id === id) || null;
  }

  /**
   * Delete endpoints for a project
   */
  async deleteEndpoints(projectId: string): Promise<void> {
    const storage = await readData<EndpointsStorage>(ENDPOINTS_FILE);
    storage.endpoints = storage.endpoints.filter((e) => e.projectId !== projectId);
    await writeData(ENDPOINTS_FILE, storage);
  }

  /**
   * TODO: Call watsonx.ai Granite API
   * This is a placeholder for the actual AI integration
   */
  private async callWatsonxGranite(documentation: string): Promise<ParsedEndpoint[]> {
    // TODO: Implement watsonx.ai Granite API call
    // const response = await fetch('https://watsonx.ai/api/v1/parse', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.WATSONX_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     model: 'granite-3.0-8b-instruct',
    //     prompt: `Parse the following API documentation and extract endpoints:\n\n${documentation}`,
    //     parameters: {
    //       temperature: 0.1,
    //       max_tokens: 2000
    //     }
    //   })
    // });
    // const data = await response.json();
    // return this.parseGraniteResponse(data);

    throw new Error('watsonx.ai Granite integration not yet implemented');
  }
}

// Export singleton instance
export const parserService = new ParserService();

// Made with Bob
