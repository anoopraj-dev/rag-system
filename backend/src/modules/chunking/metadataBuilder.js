function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length);
}

function buildMetadata(chunks) {
  // chunks is expected to be an array of objects:
  // { text: string, title: string, sectionIndex: number, chunkIndex: number }
  return chunks.map((chunk) => ({
    text: chunk.text,
    title: chunk.title,
    sectionIndex: chunk.sectionIndex,
    chunkIndex: chunk.chunkIndex,
    tokenEstimate: estimateTokens(chunk.text)
  }));
}

export default buildMetadata;
