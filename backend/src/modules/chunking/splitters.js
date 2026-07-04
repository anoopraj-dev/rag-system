export function splitByParagraph(text) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function splitBySentence(text) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
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
