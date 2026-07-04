function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length);
}

function buildMetadata(sections) {
  const result = [];

  sections.forEach((section, sectionIndex) => {
    const chunks = [section.text];

    chunks.forEach((chunk, chunkIndex) => {
      result.push({
        text: chunk,
        title: section.title,
        sectionIndex,
        chunkIndex,
        tokenEstimate: estimateTokens(chunk)
      })
    })
  })

  return result;
}

export default buildMetadata;
