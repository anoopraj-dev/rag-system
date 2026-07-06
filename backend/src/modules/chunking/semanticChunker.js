import getEmbedding from "../embedding/embedder.js";
import { splitBySentence } from "./splitters.js";

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

/**
 * Splits text into semantically cohesive chunks.
 * Combines sentence embeddings cosine similarity with size constraints.
 * @param {string} text - The input text
 * @param {number} maxSize - Maximum character size of a chunk
 * @param {number} overlap - Overlap size in characters
 * @returns {Promise<string[]>} Semantically split chunks
 */
async function semanticChunker(text, maxSize = 500, overlap = 100) {
  if (!text) return [];

  // 1. Split into sentences
  const sentences = splitBySentence(text)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return [text];
  }

  // 2. Generate embeddings for all sentences in batches to prevent memory/CPU exhaustion
  let embeddings = [];
  const batchSize = 10;
  try {
    for (let i = 0; i < sentences.length; i += batchSize) {
      const batch = sentences.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(batch.map(s => getEmbedding(s)));
      embeddings.push(...batchEmbeddings);
    }
  } catch (error) {
    console.error("Error generating sentence embeddings for semantic chunking:", error);
    // Fallback to simple split by sentence size limits if embedding fails
    return fallbackSplit(sentences, maxSize);
  }

  // 3. Compute cosine similarity between adjacent sentences
  const similarities = [];
  for (let i = 0; i < sentences.length - 1; i++) {
    similarities.push(cosineSimilarity(embeddings[i], embeddings[i + 1]));
  }

  // 4. Calculate threshold (mean - 0.6 * stdDev)
  const meanSim = similarities.reduce((a, b) => a + b, 0) / similarities.length;
  const variance = similarities.reduce((a, b) => a + Math.pow(b - meanSim, 2), 0) / similarities.length;
  const stdDev = Math.sqrt(variance);
  
  // Clamped threshold to be stable
  const threshold = Math.max(0.4, Math.min(0.85, meanSim - 0.6 * stdDev));

  // 5. Group sentences into chunks based on threshold and maxSize
  const chunks = [];
  let currentGroup = [sentences[0]];
  let currentLength = sentences[0].length;

  for (let i = 1; i < sentences.length; i++) {
    const nextSentence = sentences[i];
    const sim = similarities[i - 1];

    // If adding this sentence exceeds maxSize, we must split
    const wouldExceedSize = currentLength + 1 + nextSentence.length > maxSize;
    
    // If similarity drops below the threshold, it is a topic shift
    const isTopicShift = sim < threshold;

    if (wouldExceedSize || isTopicShift) {
      chunks.push(currentGroup.join(" "));
      
      // Determine overlap sentences to carry forward to the next chunk
      let overlapGroup = [];
      let overlapLen = 0;
      for (let j = currentGroup.length - 1; j >= 0; j--) {
        const s = currentGroup[j];
        if (overlapLen + s.length > overlap && overlapGroup.length > 0) {
          break;
        }
        overlapGroup.unshift(s);
        overlapLen += s.length + 1;
      }

      currentGroup = [...overlapGroup, nextSentence];
      currentLength = currentGroup.join(" ").length;
    } else {
      currentGroup.push(nextSentence);
      currentLength += 1 + nextSentence.length;
    }
  }

  if (currentGroup.length > 0) {
    chunks.push(currentGroup.join(" "));
  }

  return chunks;
}

// Fallback logic in case embedding generation fails
function fallbackSplit(sentences, maxSize) {
  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const s of sentences) {
    if (currentLen + s.length > maxSize && current.length > 0) {
      chunks.push(current.join(" "));
      current = [s];
      currentLen = s.length;
    } else {
      current.push(s);
      currentLen += s.length + 1;
    }
  }
  if (current.length > 0) {
    chunks.push(current.join(" "));
  }
  return chunks;
}

export default semanticChunker;
