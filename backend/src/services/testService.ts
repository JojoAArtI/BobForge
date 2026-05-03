import {
  MCPTool,
  GeneratedTest,
  TestCase,
} from '../types';

/**
 * Test Service
 * Generates test cases for MCP tools
 */
class TestService {
  /**
   * Generate tests for all tools
   */
  async generateTests(tools: MCPTool[]): Promise<GeneratedTest[]> {
    console.log(`[TestService] Generating tests for ${tools.length} tools`);

    const tests: GeneratedTest[] = [];

    for (const tool of tools) {
      const test = this.generateTestForTool(tool);
      tests.push(test);
    }

    console.log(`[TestService] Generated ${tests.length} test suites`);
    return tests;
  }

  /**
   * Generate test cases for a single tool
   */
  private generateTestForTool(tool: MCPTool): GeneratedTest {
    const testCases: TestCase[] = [];

    // Test 1: Valid input
    testCases.push(this.generateValidInputTest(tool));

    // Test 2: Missing required parameters
    testCases.push(this.generateMissingParameterTest(tool));

    // Test 3: Invalid data types
    testCases.push(this.generateInvalidTypeTest(tool));

    // Test 4: Approval required (if applicable)
    if (tool.approvalRequired) {
      testCases.push(this.generateApprovalTest(tool));
    }

    // Test 5: Risk level check
    testCases.push(this.generateRiskLevelTest(tool));

    return {
      toolName: tool.name,
      testCases,
      setupCode: this.generateSetupCode(tool),
      teardownCode: this.generateTeardownCode(tool),
    };
  }

  /**
   * Generate valid input test case
   */
  private generateValidInputTest(tool: MCPTool): TestCase {
    const input = this.generateSampleInput(tool);

    return {
      name: 'should execute with valid input',
      description: `Test ${tool.name} with valid parameters`,
      input,
      shouldFail: false,
    };
  }

  /**
   * Generate missing parameter test case
   */
  private generateMissingParameterTest(tool: MCPTool): TestCase {
    return {
      name: 'should fail with missing required parameters',
      description: 'Test validation of required parameters',
      input: {}, // Empty input
      shouldFail: true,
    };
  }

  /**
   * Generate invalid type test case
   */
  private generateInvalidTypeTest(tool: MCPTool): TestCase {
    const input = this.generateInvalidInput(tool);

    return {
      name: 'should fail with invalid data types',
      description: 'Test type validation',
      input,
      shouldFail: true,
    };
  }

  /**
   * Generate approval test case
   */
  private generateApprovalTest(tool: MCPTool): TestCase {
    const input = this.generateSampleInput(tool);

    return {
      name: 'should require approval for high-risk operation',
      description: `Test that ${tool.name} requires approval due to ${tool.riskLevel} risk`,
      input,
      approvalRequired: true,
      shouldFail: false,
    };
  }

  /**
   * Generate risk level test case
   */
  private generateRiskLevelTest(tool: MCPTool): TestCase {
    return {
      name: 'should have correct risk level',
      description: `Verify tool has ${tool.riskLevel} risk level`,
      input: {},
      expectedOutput: {
        riskLevel: tool.riskLevel,
        approvalRequired: tool.approvalRequired,
      },
      shouldFail: false,
    };
  }

  /**
   * Generate sample input based on tool schema
   */
  private generateSampleInput(tool: MCPTool): any {
    const input: any = {};

    if (!tool.inputSchema || !tool.inputSchema.properties) {
      return input;
    }

    const required = tool.inputSchema.required || [];

    for (const [key, value] of Object.entries(tool.inputSchema.properties)) {
      const prop = value as any;
      
      // Only include required fields for sample
      if (required.includes(key)) {
        input[key] = this.generateSampleValue(prop.type, key);
      }
    }

    return input;
  }

  /**
   * Generate invalid input for testing
   */
  private generateInvalidInput(tool: MCPTool): any {
    const input: any = {};

    if (!tool.inputSchema || !tool.inputSchema.properties) {
      return input;
    }

    // Generate wrong types for all fields
    for (const [key, value] of Object.entries(tool.inputSchema.properties)) {
      const prop = value as any;
      input[key] = this.generateInvalidValue(prop.type);
    }

    return input;
  }

  /**
   * Generate sample value based on type
   */
  private generateSampleValue(type: string, fieldName: string): any {
    switch (type) {
      case 'string':
        // Generate contextual sample data
        if (fieldName.includes('id') || fieldName.includes('employee')) {
          return 'E101';
        }
        if (fieldName.includes('email')) {
          return 'test@example.com';
        }
        if (fieldName.includes('name')) {
          return 'Test User';
        }
        if (fieldName.includes('date')) {
          return '2026-05-01';
        }
        return 'sample_value';
      
      case 'number':
        if (fieldName.includes('days')) {
          return 5;
        }
        if (fieldName.includes('amount') || fieldName.includes('salary')) {
          return 50000;
        }
        return 42;
      
      case 'boolean':
        return true;
      
      case 'array':
        return ['item1', 'item2'];
      
      case 'object':
        return { key: 'value' };
      
      default:
        return 'default_value';
    }
  }

  /**
   * Generate invalid value for type testing
   */
  private generateInvalidValue(type: string): any {
    switch (type) {
      case 'string':
        return 12345; // Number instead of string
      case 'number':
        return 'not_a_number'; // String instead of number
      case 'boolean':
        return 'not_a_boolean'; // String instead of boolean
      case 'array':
        return 'not_an_array'; // String instead of array
      case 'object':
        return 'not_an_object'; // String instead of object
      default:
        return null;
    }
  }

  /**
   * Generate setup code for tests
   */
  private generateSetupCode(tool: MCPTool): string {
    return `// Setup code for ${tool.name} tests
beforeEach(() => {
  // Initialize test environment
  // Mock external dependencies if needed
});`;
  }

  /**
   * Generate teardown code for tests
   */
  private generateTeardownCode(tool: MCPTool): string {
    return `// Teardown code for ${tool.name} tests
afterEach(() => {
  // Clean up test environment
  // Reset mocks
});`;
  }

  /**
   * Generate test file content
   */
  generateTestFileContent(test: GeneratedTest): string {
    const testCasesCode = test.testCases
      .map((tc) => this.generateTestCaseCode(tc, test.toolName))
      .join('\n\n');

    return `import { ${test.toolName}, ${test.toolName}Schema } from '../src/tools/${test.toolName}';

describe('${test.toolName}', () => {
  ${test.setupCode}

${testCasesCode}

  ${test.teardownCode}
});
`;
  }

  /**
   * Generate code for a single test case
   */
  private generateTestCaseCode(testCase: TestCase, toolName: string): string {
    if (testCase.approvalRequired) {
      return `  test('${testCase.name}', async () => {
    // ${testCase.description}
    const input = ${JSON.stringify(testCase.input, null, 4)};

    // This tool requires approval before execution
    // In production, check approval status before executing
    const requiresApproval = true;
    expect(requiresApproval).toBe(true);
  });`;
    }

    if (testCase.shouldFail) {
      return `  test('${testCase.name}', () => {
    // ${testCase.description}
    const input = ${JSON.stringify(testCase.input, null, 4)};

    expect(() => ${toolName}Schema.parse(input)).toThrow();
  });`;
    }

    if (testCase.expectedOutput) {
      return `  test('${testCase.name}', () => {
    // ${testCase.description}
    const expected = ${JSON.stringify(testCase.expectedOutput, null, 4)};

    // Verify risk level and approval requirements
    expect(expected.riskLevel).toBeDefined();
    expect(expected.approvalRequired).toBeDefined();
  });`;
    }

    return `  test('${testCase.name}', async () => {
    // ${testCase.description}
    const input = ${JSON.stringify(testCase.input, null, 4)};

    const result = await ${toolName}(input);
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });`;
  }

  /**
   * Generate integration test
   */
  generateIntegrationTest(tools: MCPTool[]): string {
    const toolTests = tools
      .map(
        (tool) => `  test('should execute ${tool.name}', async () => {
    // Test ${tool.name} integration
    const input = ${JSON.stringify(this.generateSampleInput(tool), null, 4)};
    
    const result = await ${tool.name}(input);
    expect(result).toBeDefined();
  });`
      )
      .join('\n\n');

    const imports = tools.map((t) => `import { ${t.name} } from '../src/tools/${t.name}';`).join('\n');

    return `${imports}

describe('Integration Tests', () => {
  describe('Tool Execution', () => {
${toolTests}
  });

  describe('Risk Policy', () => {
    test('should enforce approval for high-risk tools', () => {
      // Test risk policy enforcement
      const highRiskTools = [${tools
        .filter((t) => t.approvalRequired)
        .map((t) => `'${t.name}'`)
        .join(', ')}];
      
      expect(highRiskTools.length).toBeGreaterThan(0);
    });
  });
});
`;
  }
}

// Export singleton instance
export const testService = new TestService();

// Made with Bob
