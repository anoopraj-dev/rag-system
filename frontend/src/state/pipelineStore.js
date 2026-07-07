import React, { createContext, useContext, useState, useEffect } from "react";
import { getDocuments } from "../services/api";

const PipelineContext = createContext();

export const DEFAULT_PROMPT_TEMPLATE = `You are Cortex, an AI assistant.

Answer ONLY using the provided context.
If the answer is not in the context, say:
"I couldn't find that information in the uploaded documents."

---

CONTEXT:
{context}

---

QUESTION:
{question}`;

export function PipelineProvider({ children }) {
  const [learningMode, setLearningMode] = useState(true);
  const [activeNode, setActiveNode] = useState("chunking"); // upload, chunking, embedding, retrieval, prompt, llm
  const [serverDocs, setServerDocs] = useState([]);
  const [isRefreshingDocs, setIsRefreshingDocs] = useState(false);

  // Central Pipeline State
  const [pipelineState, setPipelineState] = useState({
    query: "",
    document: null, // { name: "filename", text: "..." }
    chunks: [], // array of { text, index }
    embeddings: [], // array of { text, vector, x, y, score } for visualization
    retrievalResults: [], // array of { chunk, score, metadata, whySelected }
    prompt: "",
    response: "",
    metrics: {
      totalLatency: 0,
      embeddingTime: 0,
      retrievalTime: 0,
      llmTime: 0,
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    }
  });

  // What-If Experiment Parameters
  const [parameters, setParameters] = useState({
    chunkSize: 500,
    topK: 3,
    similarityThreshold: 0.25,
    promptTemplate: DEFAULT_PROMPT_TEMPLATE
  });

  // Trace Timeline Step State
  const [activeMessageId, setActiveMessageId] = useState("");
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(null);

  const loadDocuments = async () => {
    try {
      setIsRefreshingDocs(true);
      const docs = await getDocuments();
      setServerDocs(docs || []);
    } catch (e) {
      console.error("Failed to fetch documents from server:", e);
    } finally {
      setIsRefreshingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return React.createElement(
    PipelineContext.Provider,
    {
      value: {
        learningMode,
        setLearningMode,
        activeNode,
        setActiveNode,
        pipelineState,
        setPipelineState,
        parameters,
        setParameters,
        activeMessageId,
        setActiveMessageId,
        isReplaying,
        setIsReplaying,
        replayStep,
        setReplayStep,
        serverDocs,
        setServerDocs,
        loadDocuments,
        isRefreshingDocs
      }
    },
    children
  );
}

export function usePipeline() {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error("usePipeline must be used within a PipelineProvider");
  }
  return context;
}
