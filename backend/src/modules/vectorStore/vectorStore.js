const store = [];

// Add chunk + embedding to store
function addVector({ id, chunk, embedding, metadata = {} }) {
  store.push({
    id,
    chunk,
    embedding,
    metadata,
  });
}

// Get all vectors in the store
function getAllVectors() {
  return store;
}

// Clear the store
function clear() {
  store.length = 0;
}

// Calculate cosine similarity
function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;

  return dot / (magA * magB);
}

// Search for the topK most similar vectors
function search(queryVector, topK) {
  const results = [];

  console.log('items in store', store)

  for (const item of store) {
    const score = cosineSimilarity(queryVector, item.embedding);

    results.push({
      id: item.id,
      chunk: item.chunk,
      score,
      metadata: item.metadata,
    });
  }

  console.log('results after serarch', results)

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Delete all vectors matching a specific document/section title
function deleteByTitle(title) {
  for (let i = store.length - 1; i >= 0; i--) {
    const currentTitle = store[i].metadata?.title || "Untitled";
    if (currentTitle === title) {
      store.splice(i, 1);
    }
  }
}

export default {
  addVector,
  getAllVectors,
  search,
  clear,
  deleteByTitle,
};

