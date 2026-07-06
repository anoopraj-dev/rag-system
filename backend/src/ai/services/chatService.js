import ai from "./aiService.js";
import vectorStore from "../../modules/vectorStore/vectorStore.js";
import getEmbedding from "../../modules/embedding/embedder.js";

class ChatService {
  async ask(question, topK = 5) {
    try {
      // 1. Convert question → embedding
      const questionEmbedding = await getEmbedding(question);

      // 2. Retrieve relevant chunks
      const retrievedChunks = vectorStore.search(questionEmbedding, topK);

      // 3. Format context for LLM
      const context = retrievedChunks.map((chunk) => ({
        text: chunk.chunk,
        score: chunk.score,
        metadata: chunk.metadata,
      }));

      // 4. Send to AI
      const response = await ai.generate({
        question,
        context,
      });

      // 5. Return structured response
      return {
        answer: response.text,
        model: response.model,
        usage: response.usage,
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