import { useState } from "react";
import { usePipeline } from "../state/pipelineStore";
import { sendChatMessage, uploadDocument, getDocuments } from "../services/api";

export function usePipelineExecution() {
  const {
    pipelineState,
    setPipelineState,
    parameters,
    setActiveMessageId,
    setIsReplaying,
    setReplayStep,
    loadDocuments,
    setServerDocs
  } = usePipeline();

  const [isTyping, setIsTyping] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const executePipeline = async (queryText, chatMessages, setMessages) => {
    if (!queryText.trim() || isTyping) return;

    setIsTyping(true);
    setLoadingStep(1);

    // Simulate loader steps
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 5 ? prev + 1 : 5));
    }, 450);

    const tempAssistantMsgId = `assistant_${Date.now()}`;
    setActiveMessageId(tempAssistantMsgId);

    const startTime = Date.now();

    try {
      // Execute the actual chat request
      const data = await sendChatMessage(queryText, parameters.topK);
      clearInterval(interval);
      setLoadingStep(5);

      const endTime = Date.now();
      const totalLatency = endTime - startTime;

      if (data.success && data.data) {
        const results = data.data.results || [];
        const answer = data.data.answer || "No reply generated.";
        const model = data.data.model || "qwen2.5:0.5b";

        const timings = data.data.timings || {};
        const latency = timings.total || totalLatency;
        const embeddingTime = timings.embedding !== undefined ? timings.embedding : Math.round(latency * 0.15);
        const retrievalTime = timings.retrieval !== undefined ? timings.retrieval : Math.round(latency * 0.05);
        const queryTime = retrievalTime;
        const llmTime = timings.llm !== undefined ? timings.llm : Math.round(latency - embeddingTime - retrievalTime);

        // Build prompt from template locally if needed or use server's
        const contextText = results
          .map((chunk, index) => `Chunk ${index + 1}:\n${chunk.chunk}`)
          .join('\n\n');

        const compiledPrompt = parameters.promptTemplate
          .replace("{context}", contextText || "[No context matched]")
          .replace("{question}", queryText);

        const serverPrompt = data.data.prompt || compiledPrompt;

        // Grounding confidence
        const maxScore = results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;
        let confidenceType = "low_confidence";
        if (maxScore >= 0.35) confidenceType = "high_confidence";
        else if (maxScore >= 0.20) confidenceType = "medium_confidence";

        // Estimate token count
        const promptTokens = Math.round(serverPrompt.length / 4);
        const completionTokens = Math.round(answer.length / 4);
        const totalTokens = promptTokens + completionTokens;

        const updatedState = {
          query: queryText,
          document: pipelineState.document || (results.length > 0 ? { name: results[0].metadata?.title || "Indexed Doc" } : null),
          chunks: pipelineState.chunks.length > 0 ? pipelineState.chunks : results.map((r, i) => ({ text: r.chunk, index: i })),
          embeddings: results.map((r, i) => ({
            text: r.chunk,
            score: r.score,
            // Mock 2D coordinates for visual meaning mapping
            x: 0.2 + (r.score * 0.6) + (Math.sin(i) * 0.1),
            y: 0.3 + (r.score * 0.4) + (Math.cos(i) * 0.1)
          })),
          retrievalResults: results.map((r, i) => ({
            chunk: r.chunk,
            score: r.score,
            metadata: r.metadata,
            whySelected: r.score > 0.35 
              ? "High semantic keyword overlap and conceptual similarity." 
              : "Moderate conceptual relevance to the query terms."
          })),
          prompt: serverPrompt,
          response: answer,
          metrics: {
            totalLatency: latency,
            embeddingTime,
            retrievalTime,
            llmTime,
            tokenUsage: {
              promptTokens,
              completionTokens,
              totalTokens
            }
          }
        };

        setPipelineState(updatedState);

        const aiMsg = {
          id: tempAssistantMsgId,
          role: "assistant",
          text: answer,
          results,
          confidenceType,
          maxScore,
          model,
          latency,
          embeddingTime,
          queryTime,
          llmTime,
          rawPrompt: serverPrompt,
          originalQuery: queryText,
          pipelineState: updatedState
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        setLoadingStep(0);
        return aiMsg;
      }
    } catch (err) {
      clearInterval(interval);
      setIsTyping(false);
      setLoadingStep(0);

      const aiErrorMsg = {
        id: tempAssistantMsgId,
        role: "assistant",
        text: `Failed to query: ${err.message || "Vector engine connection lost."}`,
        results: [],
        confidenceType: "none",
        maxScore: 0,
        model: "error",
        latency: 0,
        embeddingTime: 0,
        queryTime: 0,
        llmTime: 0,
        rawPrompt: `Execution failed:\n${err.message}`,
        pipelineState: {
          ...pipelineState,
          response: `Error: ${err.message}`
        }
      };

      setMessages((prev) => [...prev, aiErrorMsg]);
    }
  };

  const handleReplay = (activeMessage) => {
    if (!activeMessage || activeMessage.model === "system") return;
    
    setIsReplaying(true);
    setReplayStep(1);

    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 9) {
        setReplayStep(currentStep);
      } else {
        clearInterval(interval);
        setIsReplaying(false);
        setReplayStep(null);
      }
    }, 700);
  };

  return {
    isTyping,
    loadingStep,
    executePipeline,
    handleReplay
  };
}
