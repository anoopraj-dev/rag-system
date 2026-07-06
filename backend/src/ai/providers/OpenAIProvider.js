import OpenAI from 'openai';
import AIProvider from './AIprovider.js';

class OpenAIProvider extends AIProvider {
    constructor(){
        super();

        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || undefined
        });

        this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }

    async generate(request){
        try {
            const response = await this.client.chat.completions.create({
                model: request.model || this.model,
                messages: [
                    {
                        role: 'system',
                        content:request.systemPrompt || 'You are Cortex, a helpful AI assistant'
                    },
                    {
                        role:'user',
                        content:request.prompt,
                    }
                ],
                temperature: request.temperature ?? 0.3,
                max_tokens: request.maxTokens ?? 1000
            })

            return {
                text: response.choices[0].message.content,
                model: this.model,
                usage: response.usage,
            }
        } catch (error) {
            console.error('OpenAI Error', error.message)
            throw new Error('AI generation failed')
        }
    }
}

export default OpenAIProvider;
