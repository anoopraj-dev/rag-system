import createProvider from "../factory/providerFactory.js";
import buildPrompt from "../prompt/promptBuilder.js";

class AIService {
  constructor() {
    this.provider = createProvider();
  }

  async generate({ question, context }) {
    const prompt = buildPrompt({ question, context });

    const result = await this.provider.generate({
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
    });

    return result;
  }
}

export default new AIService();