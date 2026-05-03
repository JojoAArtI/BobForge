import { watsonxService } from '../services/watsonxService';

/**
 * Test script for watsonx.ai integration
 * 
 * Usage: npm run test:watsonx
 */

async function testWatsonxIntegration() {
  console.log('🧪 Testing watsonx.ai Integration\n');
  console.log('='.repeat(50));

  // Check configuration
  console.log('\n1️⃣ Checking Configuration...');
  const isConfigured = watsonxService.isConfigured();
  
  if (!isConfigured) {
    console.log('❌ watsonx.ai is NOT configured');
    console.log('\nPlease set the following environment variables in backend/.env:');
    console.log('  - WATSONX_API_KEY');
    console.log('  - WATSONX_PROJECT_ID');
    console.log('\nSee WATSONX_SETUP.md for detailed instructions.');
    process.exit(1);
  }
  
  console.log('✅ Configuration found');
  
  const modelInfo = watsonxService.getModelInfo();
  console.log(`   Model: ${modelInfo.modelId}`);
  console.log(`   Max Tokens: ${modelInfo.maxTokens}`);
  console.log(`   Temperature: ${modelInfo.temperature}`);

  // Test connection
  console.log('\n2️⃣ Testing Connection...');
  try {
    const connected = await watsonxService.testConnection();
    if (connected) {
      console.log('✅ Successfully connected to watsonx.ai');
    } else {
      console.log('❌ Connection failed');
      process.exit(1);
    }
  } catch (error: any) {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
  }

  // Test API documentation parsing
  console.log('\n3️⃣ Testing API Documentation Parsing...');
  const sampleDocs = `
API Documentation:

GET /employees/{id}/leave-balance
Returns the leave balance for an employee
Parameters:
  - id (path, required): Employee ID

POST /employees/{id}/leave-request
Submit a leave request
Parameters:
  - id (path, required): Employee ID
  - start_date (body, required): Leave start date
  - end_date (body, required): Leave end date
  - reason (body, optional): Reason for leave
`;

  try {
    console.log('   Parsing sample documentation...');
    const endpoints = await watsonxService.parseDocumentation(sampleDocs);
    console.log(`✅ Successfully parsed ${endpoints.length} endpoints`);
    console.log('\n   Parsed Endpoints:');
    endpoints.forEach((ep, idx) => {
      console.log(`   ${idx + 1}. ${ep.method} ${ep.path}`);
      console.log(`      Type: ${ep.operation_type}, Sensitive: ${ep.sensitive}`);
    });
  } catch (error: any) {
    console.log('❌ Parsing failed:', error.message);
    process.exit(1);
  }

  // Test agent query processing
  console.log('\n4️⃣ Testing Agent Query Processing...');
  const sampleTools = [
    {
      name: 'get_leave_balance',
      description: 'Get employee leave balance',
      inputSchema: {
        properties: {
          employee_id: { type: 'string' }
        }
      }
    },
    {
      name: 'submit_leave_request',
      description: 'Submit a leave request',
      inputSchema: {
        properties: {
          employee_id: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' }
        }
      }
    }
  ];

  try {
    console.log('   Processing query: "How many leaves does employee E102 have?"');
    const result = await watsonxService.processQuery(
      'How many leaves does employee E102 have?',
      sampleTools
    );
    console.log('✅ Successfully processed query');
    console.log(`   Selected Tool: ${result.tool}`);
    console.log(`   Parameters: ${JSON.stringify(result.parameters)}`);
    console.log(`   Confidence: ${result.confidence}`);
  } catch (error: any) {
    console.log('❌ Query processing failed:', error.message);
    process.exit(1);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests passed!');
  console.log('\nwatsonx.ai integration is working correctly.');
  console.log('You can now use BobForge with Granite models.\n');
}

// Run tests
testWatsonxIntegration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });

// Made with Bob