import ai from "./aiService.js";
import vectorStore from "../../modules/vectorStore/vectorStore.js";
import getEmbedding from "../../modules/embedding/embedder.js";

class ChatService {
  async ask(question, topK = 5) {
    try {
      const startTime = Date.now();

      // 1. Convert question → embedding
      const embedStartTime = Date.now();
      const questionEmbedding = await getEmbedding(question);
      const embedEndTime = Date.now();
      const embeddingTime = embedEndTime - embedStartTime;

      // 2. Retrieve relevant chunks
      const retrieveStartTime = Date.now();
      const retrievedChunks = vectorStore.search(questionEmbedding, topK);
      const retrieveEndTime = Date.now();
      const retrievalTime = retrieveEndTime - retrieveStartTime;

      // 3. Format context for LLM
      const context = retrievedChunks.map((chunk) => ({
        text: chunk.chunk,
        score: chunk.score,
        metadata: chunk.metadata,
      }));

      // 4. Send to AI
      const llmStartTime = Date.now();
      const response = await ai.generate({
        question,
        context,
      });
      const llmEndTime = Date.now();
      const llmTime = llmEndTime - llmStartTime;

      const totalLatency = Date.now() - startTime;

      // 5. Return structured response
      return {
        answer: response.text,
        model: response.model,
        usage: response.usage,
        prompt: response.prompt,
        timings: {
          total: totalLatency,
          embedding: embeddingTime,
          retrieval: retrievalTime,
          llm: llmTime,
        },
        results: retrievedChunks.map((chunk) => ({
          chunk: chunk.chunk,
          score: chunk.score,
          metadata: chunk.metadata,
        })),
      };
    } catch (error) {
      console.error("ChatService Error:", error.message);
      throw new Error("Failed to process question: " + error.message);
    }
  }
}

export default new ChatService();