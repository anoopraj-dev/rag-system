import vectorStore from "../vectorStore/vectorStore.js";

async function indexChunks(chunksWithMetadata, embeddings) {
  if (chunksWithMetadata.length !== embeddings.length) {
    throw new Error("Mismatch between number of chunks and embeddings.");
  }

  for (let i = 0; i < chunksWithMetadata.length; i++) {
    const chunk = chunksWithMetadata[i];
    const embedding = embeddings[i];

    vectorStore.addVector({
      id: `${chunk.sectionIndex}-${chunk.chunkIndex}`,
      chunk: chunk.text,
      embedding,
      metadata: chunk,
    });
  }

  return chunksWithMetadata;
}

export default indexChunks;
