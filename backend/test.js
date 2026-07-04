import fs from "fs";
import sectionize from "../backend/src/rag/chunking/sectionizer.js";
import recursiveChunk from "../backend/src/rag/chunking/recursiveChunker.js";
import mergeChunks from "../backend/src/rag/chunking/merger.js";

const text = fs.readFileSync("./sample.txt", "utf-8");

// Step 1
const sections = sectionize(text);
console.dir(sections, { depth: null });

// Step 2
const chunkedSections = sections.map(section => ({
  ...section,
  chunks: recursiveChunk(section.text)
}));

console.log("CHUNKED:");
console.dir(chunkedSections, { depth: null });

// Step 3
const mergedSections = chunkedSections.map(section => ({
  title: section.title,
  text: mergeChunks(section.chunks)
}));

console.log("MERGED:");
console.dir(mergedSections, { depth: null });
