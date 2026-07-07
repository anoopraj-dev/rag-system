import { useState, useEffect } from "react";
import { usePipeline } from "../state/pipelineStore";

export function useExperimentRunner() {
  const { pipelineState, setPipelineState, parameters, setParameters } = usePipeline();
  const [originalRun, setOriginalRun] = useState(null);
  const [experimentActive, setExperimentActive] = useState(false);

  // Capture original state when starting experiments
  const captureBaseRun = () => {
    setOriginalRun(JSON.parse(JSON.stringify(pipelineState)));
    setExperimentActive(true);
  };

  const resetExperiment = () => {
    if (originalRun) {
      setPipelineState(originalRun);
    }
    setExperimentActive(false);
  };

  // Re-run pipeline steps locally based on parameter updates
  const applyParameterChanges = (newParams) => {
    const activeParams = { ...parameters, ...newParams };
    setParameters(activeParams);

    if (!pipelineState.query) return;

    // 1. Simulate Retrieval Filtering based on Top-K and Similarity Threshold
    let allRetrievals = originalRun ? originalRun.retrievalResults : pipelineState.retrievalResults;
    
    // Filter by similarity threshold
    let filteredRetrievals = allRetrievals.filter(
      (r) => r.score >= activeParams.similarityThreshold
    );
    
    // Slice by Top-K
    filteredRetrievals = filteredRetrievals.slice(0, activeParams.topK);

    // 2. Rebuild prompt using the custom template
    const contextText = filteredRetrievals
      .map((r, index) => `Chunk ${index + 1}:\n${r.chunk}`)
      .join("\n\n");

    const newPrompt = activeParams.promptTemplate
      .replace("{context}", contextText || "[No context matched]")
      .replace("{question}", pipelineState.query);

    // 3. Simulate how the response changes (for educational what-if)
    let newResponse = pipelineState.response;
    if (filteredRetrievals.length === 0) {
      newResponse = "I couldn't find that information in the uploaded documents. (Triggered: Similarity threshold filtered out all context)";
    } else if (originalRun && filteredRetrievals.length !== originalRun.retrievalResults.length) {
      newResponse = originalRun.response + "\n\n*(Adjusted dynamically: Context was reduced from " + originalRun.retrievalResults.length + " to " + filteredRetrievals.length + " chunks due to Top-K/Threshold experiment changes)*";
    }

    // 4. Update the active pipeline state
    setPipelineState((prev) => ({
      ...prev,
      retrievalResults: filteredRetrievals,
      prompt: newPrompt,
      response: newResponse,
      metrics: {
        ...prev.metrics,
        llmTime: Math.round(prev.metrics.llmTime * (filteredRetrievals.length / Math.max(1, allRetrievals.length || 1)))
      }
    }));
  };

  // Compute differences between original run and current pipeline state
  const getDifferences = () => {
    if (!originalRun) return null;

    const baseChunks = originalRun.retrievalResults || [];
    const expChunks = pipelineState.retrievalResults || [];

    const chunkDiff = expChunks.length - baseChunks.length;
    const removedChunks = baseChunks.filter(
      (bc) => !expChunks.some((ec) => ec.chunk === bc.chunk)
    );
    const promptLenChange = pipelineState.prompt.length - originalRun.prompt.length;

    return {
      chunkCountDiff: chunkDiff,
      removedCount: removedChunks.length,
      promptLengthDifference: promptLenChange,
      promptChanged: pipelineState.prompt !== originalRun.prompt,
      responseChanged: pipelineState.response !== originalRun.response,
      similarityThresholdDifference: parameters.similarityThreshold - (originalRun.parameters?.similarityThreshold || 0.25)
    };
  };

  return {
    originalRun,
    experimentActive,
    captureBaseRun,
    resetExperiment,
    applyParameterChanges,
    differences: getDifferences()
  };
}
