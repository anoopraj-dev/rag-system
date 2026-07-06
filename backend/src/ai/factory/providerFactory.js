import OpenAIProvider from "../providers/OpenAIProvider.js";
import OllamaProvider from "../providers/OllamaProvider.js";

function createProvider(){
    const provider = process.env.AI_PROVIDER || 'openai';

    switch(provider){
        case 'openai':
            return new OpenAIProvider();

        case 'ollama':
            return new OllamaProvider(process.env.OLLAMA_MODEL || process.env.OPENAI_MODEL || 'qwen2.5:0.5b');
        
        default:
            throw new Error(`Unknown AI provider: ${provider}`);
    }
}

export default createProvider;