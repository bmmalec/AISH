const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

/**
 * Multi-provider AI service that supports Claude, Grok, and OpenAI
 * with cost tracking and logging
 */
class AIProviderService {
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'claude';
        this.logFile = path.join(__dirname, '../logs/ai-usage.log');
        this.statsFile = path.join(__dirname, '../logs/ai-stats.json');
        
        // Ensure logs directory exists
        fs.ensureDirSync(path.dirname(this.logFile));
        
        // Initialize stats if file doesn't exist
        this.initializeStats();
        
        // Provider configurations
        this.providers = {
            claude: {
                baseUrl: 'https://api.anthropic.com/v1',
                apiKey: process.env.ANTHROPIC_API_KEY,
                model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
                maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 4096
            },
            grok: {
                baseUrl: 'https://api.x.ai/v1',
                apiKey: process.env.XAI_API_KEY,
                model: process.env.GROK_MODEL || 'grok-2-1212',
                maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 4096
            },
            openai: {
                baseUrl: 'https://api.openai.com/v1',
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 4096
            }
        };
    }

    async initializeStats() {
        if (!await fs.pathExists(this.statsFile)) {
            const initialStats = {
                claude: { totalCalls: 0, totalTokens: 0, totalCost: 0 },
                grok: { totalCalls: 0, totalTokens: 0, totalCost: 0 },
                openai: { totalCalls: 0, totalTokens: 0, totalCost: 0 }
            };
            await fs.writeJson(this.statsFile, initialStats, { spaces: 2 });
        }
    }

    async callAI(prompt) {
        const config = this.providers[this.provider];
        
        if (!config || !config.apiKey) {
            throw new Error(`AI Provider '${this.provider}' not configured. Please check your .env file.`);
        }

        const startTime = Date.now();
        let response, usage;

        try {
            switch (this.provider) {
                case 'claude':
                    response = await this.callClaude(prompt, config);
                    usage = this.extractClaudeUsage(response);
                    break;
                case 'grok':
                    response = await this.callGrok(prompt, config);
                    usage = this.extractGrokUsage(response);
                    break;
                case 'openai':
                    response = await this.callOpenAI(prompt, config);
                    usage = this.extractOpenAIUsage(response);
                    break;
                default:
                    throw new Error(`Unknown AI provider: ${this.provider}`);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Log the usage
            await this.logUsage(prompt, response, usage, duration);
            
            // Update global stats
            await this.updateStats(usage);

            return response;

        } catch (error) {
            console.error(`${this.provider.toUpperCase()} API Call Failed:`, error.message);
            await this.logError(prompt, error);
            throw error;
        }
    }

    async callClaude(prompt, config) {
        const response = await axios.post(`${config.baseUrl}/messages`, {
            model: config.model,
            max_tokens: config.maxTokens,
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
        });
        return response;
    }

    async callGrok(prompt, config) {
        const response = await axios.post(`${config.baseUrl}/chat/completions`, {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: config.maxTokens
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    }

    async callOpenAI(prompt, config) {
        const response = await axios.post(`${config.baseUrl}/chat/completions`, {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: config.maxTokens
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response;
    }

    extractClaudeUsage(response) {
        const usage = response.data.usage || {};
        return {
            inputTokens: usage.input_tokens || 0,
            outputTokens: usage.output_tokens || 0,
            totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
            cost: this.calculateClaudeCost(usage.input_tokens || 0, usage.output_tokens || 0)
        };
    }

    extractGrokUsage(response) {
        const usage = response.data.usage || {};
        return {
            inputTokens: usage.prompt_tokens || 0,
            outputTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
            cost: this.calculateGrokCost(usage.total_tokens || 0)
        };
    }

    extractOpenAIUsage(response) {
        const usage = response.data.usage || {};
        return {
            inputTokens: usage.prompt_tokens || 0,
            outputTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
            cost: this.calculateOpenAICost(usage.prompt_tokens || 0, usage.completion_tokens || 0)
        };
    }

    calculateClaudeCost(inputTokens, outputTokens) {
        // Claude 3.5 Sonnet pricing (as of 2024)
        const inputCostPer1K = 0.003;  // $3 per million tokens
        const outputCostPer1K = 0.015; // $15 per million tokens
        
        return (inputTokens / 1000 * inputCostPer1K) + (outputTokens / 1000 * outputCostPer1K);
    }

    calculateGrokCost(totalTokens) {
        // Grok pricing (estimated - adjust based on actual pricing)
        const costPer1K = 0.002; // $2 per million tokens
        return totalTokens / 1000 * costPer1K;
    }

    calculateOpenAICost(inputTokens, outputTokens) {
        // GPT-4 Turbo pricing (as of 2024)
        const inputCostPer1K = 0.01;   // $10 per million tokens
        const outputCostPer1K = 0.03;  // $30 per million tokens
        
        return (inputTokens / 1000 * inputCostPer1K) + (outputTokens / 1000 * outputCostPer1K);
    }

    async logUsage(prompt, response, usage, duration) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            provider: this.provider,
            model: this.providers[this.provider].model,
            promptLength: prompt.length,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            cost: usage.cost.toFixed(6),
            duration: duration,
            success: true
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(this.logFile, logLine);
    }

    async logError(prompt, error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            provider: this.provider,
            model: this.providers[this.provider].model,
            promptLength: prompt.length,
            error: error.message,
            success: false
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(this.logFile, logLine);
    }

    async updateStats(usage) {
        const stats = await fs.readJson(this.statsFile);
        
        if (!stats[this.provider]) {
            stats[this.provider] = { totalCalls: 0, totalTokens: 0, totalCost: 0 };
        }

        stats[this.provider].totalCalls += 1;
        stats[this.provider].totalTokens += usage.totalTokens;
        stats[this.provider].totalCost += usage.cost;

        await fs.writeJson(this.statsFile, stats, { spaces: 2 });
    }

    async getStats() {
        return await fs.readJson(this.statsFile);
    }

    getResponseContent(response) {
        switch (this.provider) {
            case 'claude':
                return response.data.content[0].text.trim();
            case 'grok':
            case 'openai':
                return response.data.choices[0].message.content.trim();
            default:
                throw new Error(`Unknown provider: ${this.provider}`);
        }
    }

    getCurrentProvider() {
        return this.provider;
    }

    setProvider(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Unknown provider: ${provider}. Available: ${Object.keys(this.providers).join(', ')}`);
        }
        this.provider = provider;
    }
}

module.exports = AIProviderService;