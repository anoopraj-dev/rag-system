import { splitByParagraph, splitBySentence, splitByWord, splitByCharacter } from "./splitters.js";

function estimateSize(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function recursiveChunker(text, maxSize = 80, overlap = 20) {
  if (!text) return [];

  function chunk(text, separatorIndex = 0) {
    const size = estimateSize(text);
    if (size <= maxSize) {
      return [text];
    }

    const separators = [
      { split: splitByParagraph, joinChar: "\n\n" },
      { split: splitBySentence, joinChar: " " },
      { split: splitByWord, joinChar: " " },
      { split: splitByCharacter, joinChar: "" }
    ];

    if (separatorIndex >= separators.length) {
      return [text];
    }

    const { split, joinChar } = separators[separatorIndex];
    const parts = split(text);
    
    let results = [];
    for (const part of parts) {
      const partSize = estimateSize(part);
      if (partSize <= maxSize) {
        results.push(part);
      } else {
        results.push(...chunk(part, separatorIndex + 1));
      }
    }

    return mergeChunks(results, maxSize, overlap, joinChar);
  }

  return chunk(text, 0);
}

function mergeChunks(chunks, maxSize, overlap, joinChar) {
  const merged = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const chunk of chunks) {
    const chunkSize = estimateSize(chunk);

    if (chunkSize > maxSize) {
      if (currentChunk.length > 0) {
        merged.push(currentChunk.join(joinChar));
        currentChunk = [];
        currentSize = 0;
      }
      merged.push(chunk);
      continue;
    }

    const potentialSeparatorSize = currentChunk.length > 0 ? estimateSize(joinChar) : 0;
    if (currentSize + potentialSeparatorSize + chunkSize > maxSize) {
      if (currentChunk.length > 0) {
        merged.push(currentChunk.join(joinChar));
      }

      // Carry over overlap chunks from currentChunk
      const overlapChunks = [];
      let overlapSize = 0;
      for (let i = currentChunk.length - 1; i >= 0; i--) {
        const item = currentChunk[i];
        const itemSize = estimateSize(item);
        if (overlapSize + itemSize <= overlap) {
          overlapChunks.unshift(item);
          overlapSize += itemSize;
        } else {
          break;
        }
      }

      currentChunk = [...overlapChunks, chunk];
      currentSize = estimateSize(currentChunk.join(joinChar));
    } else {
      currentChunk.push(chunk);
      currentSize = estimateSize(currentChunk.join(joinChar));
    }
  }

  if (currentChunk.length > 0) {
    merged.push(currentChunk.join(joinChar));
  }

  return merged;
}

export default recursiveChunker;
