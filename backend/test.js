import fs from "fs";
import path from "path";
import ragService from "./src/services/ragService.js";
import vectorStore from "./src/modules/vectorStore/vectorStore.js";

async function run() {
  console.log("\n=================================");
  console.log("📄 LOADING SAMPLE DATA FOR TESTING");
  console.log("=================================\n");

  const samplePath = path.resolve("./sample.txt");
  if (!fs.existsSync(samplePath)) {
    throw new Error(`Sample text file not found at ${samplePath}`);
  }

  const text = fs.readFileSync(samplePath, "utf-8");
  console.log("Loaded document length:", text.length, "characters");

  console.log("\n=================================");
  console.log("⚙️  RUNNING FULL INGESTION PIPELINE");
  console.log("=================================\n");

  const startTime = Date.now();
  const indexedChunks = await ragService.ingest(text);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`Ingestion completed in ${duration}s.`);
  console.log("Total enriched chunks generated:", indexedChunks.length);

  console.log("\n=================================");
  console.log("🧠 VECTOR STORE VERIFICATION");
  console.log("=================================\n");

  const totalVectors = vectorStore.getAllVectors().length;
  console.log("Total vectors currently stored in-memory:", totalVectors);

  console.log("\n=================================");
  console.log("🔍 EXECUTING RETRIEVAL QUERIES");
  console.log("=================================\n");

  const testQueries = [
    "What is React?",
    "Explain hooks",
    "What is Node.js?"
  ];

  for (const queryText of testQueries) {
    console.log("---------------------------------");
    console.log(`QUERY: "${queryText}"`);
    console.log("---------------------------------");

    const result = await ragService.query(queryText, 2);

    console.log("\nRANKED SEARCH RESULTS:\n");
    result.results.forEach((r, idx) => {
      console.log(`[Rank ${idx + 1}] Similarity Score: ${r.score.toFixed(4)}`);
      console.log(`ID: ${r.id}`);
      console.log(`Title: "${r.metadata.title}"`);
      console.log(`Text Chunk: ${r.chunk}`);
      console.log("");
    });

    console.log("RETURNED CONTEXT CHUNKS:\n");
    console.log(result.context);
    console.log("\n=================================\n");
  }
}

run().catch((err) => {
  console.error("❌ TEST RUN FAILED:", err);
  process.exit(1);
});
