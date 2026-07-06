export function splitByParagraph(text) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function splitByLine(text) {
  return text
    .split(/\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function splitBySentence(text) {
  if (!text) return [];
  
  // Robust sentence splitting using lookbehind of punctuation followed by space
  const rawSegments = text.split(/(?<=[.!?])\s+/g);
  const sentences = [];
  let temp = "";
  
  // Common abbreviations to avoid splitting on
  const abbrevRegex = /\b(mr|mrs|ms|dr|prof|sr|jr|vs|ca|co|corp|inc|ltd|e\.g|i\.e|a\.m|p\.m|u\.s|u\.k|est|approx)\.?$/i;
  
  for (const segment of rawSegments) {
    if (temp) {
      temp += " " + segment;
    } else {
      temp = segment;
    }
    
    const words = temp.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    // Check if the segment ends in a common abbreviation or a single uppercase letter followed by dot (e.g. initials like "J. K.")
    const isAbbrev = abbrevRegex.test(lastWord) || /^[A-Z]\.$/i.test(lastWord);
    
    if (!isAbbrev) {
      sentences.push(temp.trim());
      temp = "";
    }
  }
  
  if (temp) {
    sentences.push(temp.trim());
  }
  
  return sentences.filter(Boolean);
}

export function splitByWord(text) {
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

export function splitByCharacter(text) {
  return text.split('');
}
