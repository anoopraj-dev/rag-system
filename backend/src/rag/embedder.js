import { pipeline } from "@xenova/transformers";

let embedder = null;

//load embedding model (MiniLM);
async function loadModel() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"

    )
  }

  return embedder;
}


// convert text - embedding vector
async function getEmbedding(text) {
  const model = await loadModel();

  const result = await model(text, {
    pooling: "mean",
    normalize: true
  })
  console.log("Embedding sample:", result.data.slice(0, 10));
  console.log("Embedding length:", result.data.length);
  //convert to plain array

  return Array.from(result.data);
}

export default getEmbedding;



