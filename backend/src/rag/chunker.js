export default function chunkText(text, chunkSize = 20, overlap = 5) {
  if (!text) return [];

  // normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // split into words

  const words = cleanText.split(' ');

  const chunks = [];
  let start = 0;

  //create chunks 
  while (start < words.length) {

    const end = start + chunkSize;

    const chunkWords = words.slice(start, end);
    const chunk = chunkWords.join(' ');

    chunks.push(chunk);

    // move forward with overlap

    start = end - overlap;

    if (start < 0) start = 0;
    if (start > words.length) break;
  }

  return chunks;
}


