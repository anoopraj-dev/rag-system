import fs from "fs";
import sectionize from "../backend/src/rag/chunking/sectionizer.js";
import recursiveChunk from "../backend/src/rag/chunking/recursiveChunker.js";
import mergeChunks from "../backend/src/rag/chunking/merger.js";
import buildMetadata from "../backend/src/rag/chunking/metadataBuilder.js";

const text = fs.readFileSync("./sample.txt", "utf-8");

// Step 1
const sections = sectionize(text);

// Step 2
const chunkedSections = sections.map(section => ({
  ...section,
  chunks: recursiveChunk(section.text)
}));


// Step 3
const mergedSections = chunkedSections.map(section => ({
  title: section.title,
  text: mergeChunks(section.chunks)
}));
console.log("MERGED:");
console.dir(mergedSections, { depth: null });

const finalChunks = buildMetadata(mergedSections);

console.dir(finalChunks, { depth: null });
