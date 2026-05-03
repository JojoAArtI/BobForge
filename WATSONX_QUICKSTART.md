# watsonx.ai Quick Start Guide

Get BobForge working with IBM watsonx.ai Granite in 5 minutes!

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your API Key

1. Go to https://cloud.ibm.com
2. Login or create account
3. Navigate to **Manage** → **Access (IAM)** → **API keys**
4. Click **Create** button
5. Name it "BobForge" and click **Create**
6. **Copy the API key** (you won't see it again!)

### Step 2: Get Your Project ID

1. Go to https://dataplatform.cloud.ibm.com/wx/home
2. Click on your project (or create new one)
3. Go to **Manage** tab
4. Copy the **Project ID** from the URL or settings

### Step 3: Configure BobForge

Edit `backend/.env`:

```env
# Replace these values with your credentials
WATSONX_API_KEY=<your_watsonx_api_key>
WATSONX_PROJECT_ID=<your_watsonx_project_id>

# Optional: Change model (default is granite-13b-chat-v2)
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2

# Set to false to use real watsonx.ai (true = mock mode)
WATSONX_MOCK_MODE=false
```

## ✅ Test Your Setup

```bash
cd backend
npm install
npm run test:watsonx
```

Expected output:
```
🧪 Testing watsonx.ai Integration
==================================================

1️⃣ Checking Configuration...
✅ Configuration found
   Model: ibm/granite-13b-chat-v2
   Max Tokens: 2000
   Temperature: 0.7

2️⃣ Testing Connection...
✅ Successfully connected to watsonx.ai

3️⃣ Testing API Documentation Parsing...
   Parsing sample documentation...
✅ Successfully parsed 2 endpoints

4️⃣ Testing Agent Query Processing...
   Processing query: "How many leaves does employee E102 have?"
✅ Successfully processed query
   Selected Tool: get_leave_balance
   Parameters: {"employee_id":"E102"}
   Confidence: 0.95

==================================================
✅ All tests passed!
```

## 🎯 What Gets Enabled

Once configured, watsonx.ai Granite will power:

### 1. Smart API Parsing
```
Raw Docs → Granite → Structured Endpoints
```
- Extracts methods, paths, parameters
- Identifies sensitive operations
- Generates descriptions

### 2. Intelligent Agent
```
User Query → Granite → Tool Selection + Parameters
```
- Understands natural language
- Selects correct MCP tool
- Extracts parameter values

## 🔄 Switch Between Mock and Real

### Use Mock Mode (No API calls)
```env
WATSONX_MOCK_MODE=true
```
- Free, unlimited
- Uses regex-based parser
- Good for development

### Use Real watsonx.ai
```env
WATSONX_MOCK_MODE=false
```
- AI-powered parsing
- Better accuracy
- Natural language understanding
- Uses API credits

## 💰 Pricing

### Free Tier
- 25,000 tokens/month
- ~35 API parsing requests
- Perfect for testing

### Paid Plans
- Pay-as-you-go: $0.002 per 1K tokens
- ~$0.0014 per API parsing request
- Unlimited requests

## 🛠️ Troubleshooting

### "Invalid API key"
- Check you copied the full key
- No spaces before/after
- Key starts with letters/numbers

### "Project ID not found"
- Verify project exists in watsonx.ai
- Check you're using the correct IBM Cloud account
- Project must have watsonx.ai enabled

### "Rate limit exceeded"
- You've used your free tier quota
- Wait for next month or upgrade
- Use mock mode temporarily

### "Connection timeout"
- Check internet connection
- Verify firewall allows IBM Cloud
- Try different region URL

## 📚 Available Models

| Model | Best For | Size |
|-------|----------|------|
| `ibm/granite-13b-chat-v2` | Conversational tasks | 13B |
| `ibm/granite-13b-instruct-v2` | Following instructions | 13B |
| `ibm/granite-20b-multilingual` | Multiple languages | 20B |
| `ibm/granite-3b-code-instruct` | Code generation | 3B |

Change model in `.env`:
```env
WATSONX_MODEL_ID=ibm/granite-13b-instruct-v2
```

## 🎓 Learn More

- **Full Setup Guide**: See `WATSONX_SETUP.md`
- **API Docs**: https://cloud.ibm.com/apidocs/watsonx-ai
- **Granite Models**: https://www.ibm.com/granite
- **Community**: https://community.ibm.com/community/user/watsonai

## 🚦 Status Check

Run this anytime to check your setup:
```bash
npm run test:watsonx
```

## 🎉 You're Ready!

Start the backend:
```bash
npm run dev
```

Create a project and paste API docs - Granite will parse them automatically!

---

**Need help?** Check `WATSONX_SETUP.md` for detailed troubleshooting.
