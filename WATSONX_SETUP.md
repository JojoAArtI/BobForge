# watsonx.ai Integration Setup Guide

This guide explains how to integrate IBM watsonx.ai Granite models into BobForge for API documentation parsing and agent query processing.

## Prerequisites

1. **IBM Cloud Account**: Sign up at https://cloud.ibm.com
2. **watsonx.ai Access**: Enable watsonx.ai service
3. **API Credentials**: Get your API key and project ID

## Step 1: Get watsonx.ai Credentials

### Option A: Using IBM Cloud Console

1. Go to https://cloud.ibm.com
2. Navigate to **Resource List** → **AI / Machine Learning**
3. Click on your **watsonx.ai** instance
4. Go to **Service Credentials** tab
5. Click **New Credential** if none exist
6. Copy the following:
   - `apikey`
   - `url` (usually https://us-south.ml.cloud.ibm.com)

### Option B: Using IBM Cloud CLI

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login
ibmcloud login

# Get API key
ibmcloud iam api-key-create bobforge-key -d "BobForge API Key"

# Get watsonx.ai URL
ibmcloud resource service-instance watsonx-ai --output json
```

## Step 2: Get Project ID

1. Go to https://dataplatform.cloud.ibm.com/wx/home
2. Click on your project or create a new one
3. Go to **Manage** tab → **General**
4. Copy the **Project ID**

## Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# watsonx.ai Configuration
WATSONX_API_KEY=<your_watsonx_api_key>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=<your_watsonx_project_id>

# Model Configuration
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
WATSONX_MAX_TOKENS=2000
WATSONX_TEMPERATURE=0.7

# Mock Mode (set to false to use real watsonx.ai)
WATSONX_MOCK_MODE=false

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:3000
```

**Configuration Options:**

- `WATSONX_API_KEY`: Your IBM Cloud API key (required)
- `WATSONX_URL`: watsonx.ai service endpoint (region-specific)
- `WATSONX_PROJECT_ID`: Your watsonx.ai project ID (required)
- `WATSONX_MODEL_ID`: Granite model to use (see options below)
- `WATSONX_MAX_TOKENS`: Maximum tokens to generate (default: 2000)
- `WATSONX_TEMPERATURE`: Creativity level 0.0-1.0 (default: 0.7)
- `WATSONX_MOCK_MODE`: Use mock data instead of real API (default: true)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

### Available Granite Models

Choose from these models based on your needs:

- `ibm/granite-13b-chat-v2` - Best for conversational tasks (recommended)
- `ibm/granite-13b-instruct-v2` - Best for instruction following
- `ibm/granite-20b-multilingual` - Best for multilingual support
- `ibm/granite-3b-code-instruct` - Best for code generation

## Step 4: Install Dependencies

```bash
cd backend
npm install @ibm-cloud/watsonx-ai axios
```

## Step 5: Test Connection

Run the test script:

```bash
cd backend
npm run test:watsonx
```

Expected output:
```
✓ watsonx.ai connection successful
✓ Model: ibm/granite-13b-chat-v2
✓ Response received
```

## Step 6: Verify Integration

The following services will automatically use watsonx.ai:

1. **ParserService** - API documentation parsing
2. **AgentService** - Natural language query processing

### Test API Documentation Parsing

```bash
curl -X POST http://localhost:3001/api/projects/PROJECT_ID/parse \
  -H "Content-Type: application/json" \
  -d '{
    "documentation": "GET /employees/{id}/leave-balance - Returns leave balance"
  }'
```

### Test Agent Query

```bash
curl -X POST http://localhost:3001/api/projects/PROJECT_ID/agent/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How many leaves does employee E102 have?"
  }'
```

## Architecture

### How watsonx.ai is Used

```
User Input → BobForge → watsonx.ai Granite → Structured Output
```

### 1. API Documentation Parsing

**Input**: Raw API documentation text
**Process**: 
- Send to Granite with structured prompt
- Extract endpoints, methods, parameters
- Return JSON schema

**Prompt Template**:
```
Parse the following API documentation and extract endpoints:

{documentation}

Return a JSON array with this structure:
[
  {
    "method": "GET|POST|PUT|DELETE",
    "path": "/api/path",
    "description": "endpoint description",
    "parameters": [...],
    "operation_type": "read|write|delete"
  }
]
```

### 2. Agent Query Processing

**Input**: Natural language query
**Process**:
- Analyze query intent
- Select appropriate MCP tool
- Extract parameters
- Return structured response

**Prompt Template**:
```
Given these available tools:
{tools}

User query: {query}

Select the best tool and extract parameters.
Return JSON:
{
  "tool": "tool_name",
  "parameters": {...},
  "confidence": 0.95
}
```

## Rate Limits & Quotas

### Free Tier
- 25,000 tokens/month
- 20 requests/minute

### Paid Tier
- Custom limits based on plan
- Higher throughput

### Best Practices
1. Cache responses when possible
2. Use batch processing for multiple endpoints
3. Implement retry logic with exponential backoff
4. Monitor token usage

## Error Handling

Common errors and solutions:

### 401 Unauthorized
```
Error: Invalid API key
Solution: Check WATSONX_API_KEY in .env
```

### 403 Forbidden
```
Error: Project ID not found
Solution: Verify WATSONX_PROJECT_ID
```

### 429 Too Many Requests
```
Error: Rate limit exceeded
Solution: Implement request throttling
```

### 500 Internal Server Error
```
Error: Model unavailable
Solution: Try different model or region
```

## Monitoring & Debugging

### Enable Debug Logging

```env
DEBUG=watsonx:*
LOG_LEVEL=debug
```

### View Logs

```bash
tail -f backend/logs/watsonx.log
```

### Metrics to Track

1. **Request Count**: Total API calls
2. **Token Usage**: Input + output tokens
3. **Response Time**: Average latency
4. **Error Rate**: Failed requests
5. **Cache Hit Rate**: Cached vs fresh responses

## Cost Optimization

### Tips to Reduce Costs

1. **Use Smaller Models**: Start with granite-3b for simple tasks
2. **Implement Caching**: Cache parsed documentation
3. **Batch Requests**: Process multiple endpoints together
4. **Optimize Prompts**: Shorter prompts = fewer tokens
5. **Set Max Tokens**: Limit response length

### Example Cost Calculation

```
Input: 500 tokens (API documentation)
Output: 200 tokens (parsed JSON)
Total: 700 tokens per request

Free tier: 25,000 tokens/month = ~35 requests/month
Paid tier: $0.002 per 1K tokens = $0.0014 per request
```

## Security Best Practices

1. **Never commit API keys**: Use .env files
2. **Rotate keys regularly**: Every 90 days
3. **Use service accounts**: Not personal credentials
4. **Implement rate limiting**: Prevent abuse
5. **Log access**: Audit API usage
6. **Encrypt at rest**: Store credentials securely

## Troubleshooting

### Connection Issues

```bash
# Test network connectivity
curl -I https://us-south.ml.cloud.ibm.com

# Test authentication
curl -X POST https://iam.cloud.ibm.com/identity/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=<YOUR_WATSONX_API_KEY>"
```

### Model Issues

```bash
# List available models
curl -X GET "https://us-south.ml.cloud.ibm.com/ml/v1/foundation_model_specs?version=2023-05-29" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Alternative: Mock Mode

For development without watsonx.ai:

```env
WATSONX_MOCK_MODE=true
```

This uses the existing mock parser instead of real API calls.

## Support

- **Documentation**: https://cloud.ibm.com/docs/watsonx-ai
- **API Reference**: https://cloud.ibm.com/apidocs/watsonx-ai
- **Community**: https://community.ibm.com/community/user/watsonai
- **Support**: https://cloud.ibm.com/unifiedsupport/cases/form

## Next Steps

1. ✅ Get credentials
2. ✅ Configure .env
3. ✅ Install dependencies
4. ✅ Test connection
5. ✅ Run integration tests
6. ✅ Monitor usage
7. ✅ Optimize costs

---

**Ready to integrate watsonx.ai into BobForge!** 🚀
