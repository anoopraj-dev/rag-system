function splitByParagraph(text) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitBySentence(text) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
}

function splitByWord(text) {
  return text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function splitByCharacter(text) {
  return text.split('');
}

export { splitByParagraph, splitBySentence, splitByWord, splitByCharacter }
