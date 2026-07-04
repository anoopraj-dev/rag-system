function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .trim();
}

function normalizeNewlines(text) {
  return text.replace(/\n{3,}/g, "\n\n");
}

function cleanText(text) {
  let cleaned = normalizeWhitespace(text);
  cleaned = normalizeNewlines(cleaned);

  return cleaned;
}

export default cleanText;
