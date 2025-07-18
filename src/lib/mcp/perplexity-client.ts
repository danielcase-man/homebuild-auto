import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class PerplexityMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  constructor() {
    // MCP initialization will be done lazily
  }

  private async initializeMCP(): Promise<void> {
    if (this.client && this.transport) return;

    try {
      // Create stdio transport for Perplexity MCP server
      this.transport = new StdioClientTransport({
        command: 'npx',
        args: ['perplexity-mcp-server'],
        env: {
          ...process.env,
          PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || ''
        }
      });

      this.client = new Client({
        name: 'construction-research-client',
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });

      await this.client.connect(this.transport);
    } catch (error) {
      console.warn('Failed to initialize MCP client:', error);
      this.client = null;
      this.transport = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }

  private async callMCPTool(toolName: string, query: string): Promise<any> {
    try {
      await this.initializeMCP();
      
      if (!this.client) {
        throw new Error('MCP client not available');
      }
      
      const result = await this.client.callTool({
        name: toolName,
        arguments: {
          query: query,
          model: 'llama-3.1-sonar-small-128k-online'
        }
      });

      return result;
    } catch (error) {
      console.warn(`MCP tool call failed, falling back to direct API:`, error);
      // Fallback to direct API call
      return this.callDirectAPI(query);
    } finally {
      await this.disconnect();
    }
  }

  private async callDirectAPI(query: string): Promise<any> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: query }],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Return in MCP-like format for consistency
    return {
      content: [{ text: data.choices[0].message.content }]
    };
  }

  async searchLenders(query: string): Promise<any> {
    return this.callMCPTool('perplexity_search', query);
  }

  async searchRegulations(query: string): Promise<any> {
    return this.callMCPTool('perplexity_search', query);
  }

  async searchVendors(query: string): Promise<any> {
    return this.callMCPTool('perplexity_search', query);
  }

  async askPerplexity(query: string, options: any = {}): Promise<any> {
    return this.callMCPTool('perplexity_ask', query);
  }
}

// Singleton instance
let mcpClient: PerplexityMCPClient | null = null;

export function getPerplexityMCPClient(): PerplexityMCPClient {
  if (!mcpClient) {
    mcpClient = new PerplexityMCPClient();
  }
  return mcpClient;
}