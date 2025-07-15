# Environment Setup Guide for MCP Design Workflow

## 🔑 Required API Keys

To fully utilize the MCP-powered design workflow, you'll need to obtain and configure the following API keys:

### 1. GitHub Personal Access Token
**Purpose**: Access GitHub repositories for component library research and code examples

**Steps to obtain**:
1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (for accessing repositories)
   - `read:user` (for user information)
   - `read:org` (for organization access if needed)
4. Copy the generated token

**Add to .env.local**:
```bash
GITHUB_TOKEN="your_github_token_here"
```

### 2. Search API Key (Optional)
**Purpose**: Web search capabilities for design research

**Options**:
- **Google Custom Search API**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable Custom Search API
  3. Create credentials (API key)
  
- **Bing Search API**:
  1. Go to [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/)
  2. Create Bing Search resource
  3. Get API key from resource dashboard

**Add to .env.local**:
```bash
SEARCH_API_KEY="your_search_api_key_here"
```

### 3. Figma Access Token (Optional)
**Purpose**: Direct integration with Figma for design system management

**Steps to obtain**:
1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Create new token"
4. Name it "Home Builder MCP Integration"
5. Copy the generated token

**Add to .env.local**:
```bash
FIGMA_ACCESS_TOKEN="your_figma_token_here"
```

### 4. Perplexity API Key (Already configured if you've used it before)
**Purpose**: Advanced research capabilities for design insights

If not configured:
1. Go to [Perplexity API](https://docs.perplexity.ai/)
2. Sign up for API access
3. Get your API key

**Add to .env.local**:
```bash
PERPLEXITY_API_KEY="your_perplexity_key_here"
```

## 🛠️ Complete Environment Configuration

Your final `.env.local` should look like this:

```bash
# Database
DATABASE_URL="postgresql://localhost:5432/homebuilder_dev"

# Authentication
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3001"

# Payment Processing (for future features)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""

# MCP Server Configuration
SEARCH_API_KEY="your_search_api_key_here"
GITHUB_TOKEN="your_github_token_here"
FIGMA_ACCESS_TOKEN="your_figma_token_here"
PERPLEXITY_API_KEY="your_perplexity_key_here"
BROWSER_AUTOMATION_ENABLED="true"

# Application Settings
NODE_ENV="development"
```

## 🚀 Testing Your Setup

After configuring your environment variables, test the MCP integration:

### 1. Test Design Research
```bash
npm run design-research -- --component="card" --industry="construction"
```

### 2. Test Component Generation
```bash
npm run generate-component -- --name="TaskCard" --type="card" --industry="construction"
```

### 3. Test Accessibility Audit
```bash
npm run test-accessibility -- --url="http://localhost:3001"
```

### 4. Test Screenshot Capture
```bash
npm run screenshot-component -- --url="http://localhost:3001" --selector=".btn"
```

## 🔧 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Ensure your API tokens have the correct scopes/permissions
   - Check that tokens haven't expired

2. **MCP server connection failures**
   - Verify all required packages are installed: `npm install`
   - Check that Node.js version is 18.0.0 or higher

3. **Design research returning empty results**
   - Verify SEARCH_API_KEY and PERPLEXITY_API_KEY are set
   - Check API key validity and rate limits

4. **GitHub MCP not working**
   - Ensure GITHUB_TOKEN has `repo` scope
   - Verify token hasn't expired (GitHub tokens expire after a set period)

### Environment Validation Script

Run this command to validate your environment setup:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
const optionalVars = ['GITHUB_TOKEN', 'SEARCH_API_KEY', 'FIGMA_ACCESS_TOKEN', 'PERPLEXITY_API_KEY'];
console.log('🔍 Environment Validation:');
requiredVars.forEach(varName => {
  const hasVar = envContent.includes(varName) && !envContent.includes(\`\${varName}=\"\"\`);
  console.log(\`\${hasVar ? '✅' : '❌'} \${varName}: \${hasVar ? 'Set' : 'Missing or empty'}\`);
});
optionalVars.forEach(varName => {
  const hasVar = envContent.includes(varName) && !envContent.includes(\`\${varName}=\"\"\`);
  console.log(\`\${hasVar ? '✅' : '⚠️ '} \${varName}: \${hasVar ? 'Set' : 'Optional - not configured'}\`);
});
"
```

## 🎯 Next Steps

1. **Configure API Keys**: Set up at least GitHub and one search API key for basic functionality
2. **Test MCP Integration**: Run the test commands above to verify everything works
3. **Start Development**: Use `npm run dev` to start the development server
4. **Generate Components**: Use the MCP-powered design workflow to create UI components
5. **Iterate**: Use design research insights to continuously improve your UI/UX

## 📚 Additional Resources

- [MCP Server Documentation](https://modelcontextprotocol.io/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design System Best Practices](UI-DESIGN-SYSTEM.md)

Remember: Even without all API keys configured, you can still use the design workflow scripts - they will work with simulated data and provide valuable scaffolding for your components.