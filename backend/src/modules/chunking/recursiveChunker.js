import { splitByParagraph, splitByLine, splitBySentence, splitByWord, splitByCharacter } from "./splitters.js";

function estimateSize(text) {
  return text.length;
}

function recursiveChunker(text, maxSize = 500, overlap = 100) {
  if (!text) return [];

  const separators = [
    { split: splitByParagraph, joinChar: "\n\n" },
    { split: splitByLine, joinChar: "\n" },
    { split: splitBySentence, joinChar: " " },
    { split: splitByWord, joinChar: " " },
    { split: splitByCharacter, joinChar: "" }
  ];

  // Helper to split text recursively into non-overlapping pieces that are each <= maxSize
  function getPieces(subText, absoluteStart = 0, separatorIndex = 0) {
    const size = estimateSize(subText);
    if (size <= maxSize) {
      return [{ text: subText, start: absoluteStart, end: absoluteStart + subText.length }];
    }

    if (separatorIndex >= separators.length) {
      return [{ text: subText, start: absoluteStart, end: absoluteStart + subText.length }];
    }

    const { split } = separators[separatorIndex];
    const parts = split(subText);

    if (parts.length <= 1) {
      return getPieces(subText, absoluteStart, separatorIndex + 1);
    }

    const pieces = [];
    let lastIndex = 0;

    for (const part of parts) {
      const indexInText = subText.indexOf(part, lastIndex);
      const partAbsoluteStart = absoluteStart + indexInText;
      
      const partSize = estimateSize(part);
      if (partSize <= maxSize) {
        pieces.push({
          text: part,
          start: partAbsoluteStart,
          end: partAbsoluteStart + part.length
        });
      } else {
        pieces.push(...getPieces(part, partAbsoluteStart, separatorIndex + 1));
      }
      
      lastIndex = indexInText + part.length;
    }

    return pieces;
  }

  const pieces = getPieces(text, 0, 0);
  return mergePieces(pieces, text, maxSize, overlap);
}

function mergePieces(pieces, originalText, maxSize, overlap) {
  const chunks = [];
  if (pieces.length === 0) return [];

  let i = 0;
  while (i < pieces.length) {
    const chunkStartPiece = pieces[i];
    let chunkEndPiece = pieces[i];
    let j = i;

    // Expand the chunk as much as possible under maxSize
    while (j < pieces.length) {
      const candidateEndPiece = pieces[j];
      const combinedText = originalText.substring(chunkStartPiece.start, candidateEndPiece.end);
      const combinedSize = estimateSize(combinedText);

      if (combinedSize <= maxSize || j === i) {
        chunkEndPiece = candidateEndPiece;
        j++;
      } else {
        break;
      }
    }

    // Add the chunk
    chunks.push(originalText.substring(chunkStartPiece.start, chunkEndPiece.end));

    if (j >= pieces.length) {
      break;
    }

    // Determine the next starting piece index (i) based on the overlap
    let overlapSize = 0;
    let nextStartIdx = j - 1;
    for (let k = j - 1; k >= i; k--) {
      const item = pieces[k];
      const itemText = originalText.substring(item.start, chunkEndPiece.end);
      const itemSize = estimateSize(itemText);
      
      nextStartIdx = k;
      overlapSize = itemSize;
      if (overlapSize >= overlap) {
        break;
      }
    }

    // Guard against infinite loop
    if (nextStartIdx <= i) {
      i = j;
    } else {
      i = nextStartIdx;
    }
  }

  return chunks;
}

export default recursiveChunker;
