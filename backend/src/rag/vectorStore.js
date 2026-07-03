const store = [];

// add chunk + embedding to memory

function addVector({ chunk, embedding, metadata = {} }) {
  store.push({
    chunk,
    embedding,
    metadata,
  });
}


// get stored vectors 

function getAllVectors() {
  return store;
}

// cosineSimiltarity

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

  //  safety guard (this fixes NaN)
  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (magA * magB);
}

//search function 

function search(queryVector, topK = 3) {
  const results = [];

  for (const item of store) {
    const score = cosineSimilarity(queryVector, item.embedding);

    results.push({
      chunk: item.chunk,
      score,
      metadata: item.metadata,
    })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}



export { addVector, getAllVectors, search }
