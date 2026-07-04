function processDocument(text) {
  if (typeof text !== 'string') {
    throw new Error('Invalid document format. Text must be a string.');
  }

  // Normalize whitespace: convert line endings and collapse extra spaces
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .trim();

  return cleaned;
}

export default processDocument;
