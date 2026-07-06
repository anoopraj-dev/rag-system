import AIProvider from "./AIprovider.js";

class OllamaProvider extends AIProvider {
  constructor(model = "qwen2.5:0.5b") {
    super();
    this.model = model;
    
    let baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    if (baseUrl.endsWith("/v1")) {
      baseUrl = baseUrl.slice(0, -3);
    } else if (baseUrl.endsWith("/v1/")) {
      baseUrl = baseUrl.slice(0, -4);
    }
    this.baseUrl = baseUrl;
  }

  async generate({ prompt }) {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    const data = await res.json();
    return {
      text: data.response,
      model: this.model,
      usage: null,
    };
  }
}

export default OllamaProvider;