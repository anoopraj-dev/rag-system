import { splitByParagraph, splitBySentence, splitByWord, splitByCharacter } from './splitters.js'

const splitters = [
  splitByParagraph,
  splitBySentence,
  splitByWord,
  splitByCharacter
];

function recursiveChunk(text, maxSize = 500, level = 0) {
  if (text.length <= maxSize) {
    return [text];
  }

  if (level >= splitters.length) {
    return [text];
  }

  const splitter = splitters[level];
  const parts = splitter(text);

  let chunks = [];

  for (const part of parts) {
    if (part.length <= maxSize) {
      chunks.push(part);
    } else {
      chunks.push(
        ...recursiveChunk(part, maxSize, level + 1)
      )
    }
  }

  return chunks;
}

export default recursiveChunk;
