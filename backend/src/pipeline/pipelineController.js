import PipelineReporter from "./PipelineReporter";
import PipelineEvents from "./PipelineEvents";

class PipelineController {
  constructor({
    chunker,
    embeddingProvider,
    vectorStore,
    retriever,
    llmProvider
  }) {
    this.chunker = chunker;
    this.embeddingProvider = embeddingProvider;
    this.vectorStore = vectorStore;
    this.retriever = retriever;
    this.llmProvider = llmProvider;
  }

  //  INGESTION PIPELINE
  async ingest(documentText) {
    const reporter = new PipelineReporter();

    reporter.emit(PipelineEvents.QUERY_RECEIVED, {
      type: "ingestion",
      length: documentText.length
    });

    // 1. Chunking
    const chunks = this.chunker.chunk(documentText);

    reporter.emit("CHUNKING_DONE", {
      totalChunks: chunks.length
    });

    // 2. Embedding
    reporter.emit(PipelineEvents.EMBEDDING_STARTED);

    const embeddedChunks = await Promise.all(
      chunks.map(async (chunk, index) => {
        const vector = await this.embeddingProvider.embed(chunk.text);

        return {
          id: index,
          text: chunk.text,
          metadata: chunk.metadata || {},
          vector
        };
      })
    );

    reporter.emit(PipelineEvents.EMBEDDING_DONE, {
      embeddedCount: embeddedChunks.length
    });

    // 3. Store in Vector DB
    await this.vectorStore.addMany(embeddedChunks);

    reporter.emit("VECTOR_STORE_UPDATED", {
      count: embeddedChunks.length
    });

    reporter.emit(PipelineEvents.PIPELINE_COMPLETE);

    return {
      success: true,
      totalChunks: chunks.length,
      report: reporter.getReport()
    };
  }

  //  QUERY PIPELINE
  async query(userQuery) {
    const reporter = new PipelineReporter();

    reporter.emit(PipelineEvents.QUERY_RECEIVED, {
      query: userQuery
    });

    // 1. Embed query
    reporter.emit(PipelineEvents.EMBEDDING_STARTED);

    const queryVector = await this.embeddingProvider.embed(userQuery);

    reporter.emit(PipelineEvents.EMBEDDING_DONE);

    // 2. Retrieval
    reporter.emit(PipelineEvents.RETRIEVAL_STARTED);

    const retrievedChunks = await this.retriever.retrieve(queryVector, {
      topK: 5
    });

    reporter.emit(PipelineEvents.RETRIEVAL_DONE, {
      count: retrievedChunks.length,
      chunks: retrievedChunks.map(c => ({
        id: c.id,
        score: c.score
      }))
    });

    // 3. Build context
    const context = retrievedChunks
      .map(c => c.text)
      .join("\n\n");

    reporter.emit(PipelineEvents.CONTEXT_BUILT, {
      contextLength: context.length
    });

    // 4. Build prompt
    const prompt = `
You are Cortex, a professional RAG engineering assistant.

Generate a clean, direct response answering the user's question grounded strictly in the provided context.
Do NOT use robotic meta-commentary, and NEVER start your answers with phrases like "Based on the provided context," "According to the context," "The context states," or similar. Speak directly and conversationally.

If the answer is not in the context, say:
"I couldn't find that information in the uploaded documents."

--------------------
${context}
--------------------

Question:
${userQuery}
`;

    reporter.emit(PipelineEvents.PROMPT_CREATED, {
      promptLength: prompt.length
    });

    // 5. LLM call
    reporter.emit(PipelineEvents.LLM_STARTED);

    const result = await this.llmProvider.generate(prompt, {
      temperature: 0.2
    });

    reporter.emit(PipelineEvents.LLM_DONE, {
      tokensUsed: result.tokensUsed
    });

    reporter.emit(PipelineEvents.PIPELINE_COMPLETE);

    // FINAL RESPONSE
    return {
      answer: result.text,

      pipeline: {
        query: userQuery,

        retrievedChunks,

        context,

        prompt,

        timings: reporter.getReport(),

        metadata: {
          model: this.llmProvider?.name || "unknown",
          embeddingModel: this.embeddingProvider?.name || "unknown"
        }
      }
    };
  }
}

module.exports = PipelineController;