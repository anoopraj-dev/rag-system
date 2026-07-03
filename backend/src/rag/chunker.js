function chunkText(text, maxWords = 40, overlapSentences = 1) {
  const sentences = text
    .replace(/\n/g, " ")
    .match(/[^.!?]+[.!?]?/g) || [];

  const chunks = [];
  let chunk = [];
  let wordCount = 0;

  for (let sentence of sentences) {
    const words = sentence.split(" ");

    if (wordCount + words.length > maxWords) {
      chunks.push(chunk.join(" ").trim());

      chunk = chunk.slice(-overlapSentences);
      wordCount = chunk.reduce((acc, s) => acc + s.split(" ").length, 0);
    }

    chunk.push(sentence.trim());
    wordCount += words.length;
  }

  if (chunk.length) {
    chunks.push(chunk.join(" ").trim());
  }

  return chunks;
}

export default chunkText;
