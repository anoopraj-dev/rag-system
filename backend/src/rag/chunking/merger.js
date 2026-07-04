function mergeChunks(parts, maxChunkSize = 500) {
  const merged = [];

  let currentChunk = '';

  for (const part of parts) {
    const candidate =
      currentChunk.length === 0
        ? part
        : currentChunk + '\n\n' + part;

    if (candidate.length <= maxChunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk.length > 0) {
        merged.push(currentChunk);
      }
      currentChunk = part;
    }
  }

  if (currentChunk.length > 0) {
    merged.push(currentChunk);
  }


  return merged.join('\n\n');
}

export default mergeChunks;
