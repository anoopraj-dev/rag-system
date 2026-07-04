import { pipeline } from "@xenova/transformers";

let embedder = null;

// Load embedding model (MiniLM)
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

// Convert text to embedding vector
async function getEmbedding(text) {
  const model = await loadModel();

  const result = await model(text, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(result.data);
}

export default getEmbedding;
