import chunkText from '../backend/src/rag/chunker.js'
import getEmbedding from '../backend/src/rag/embedder.js'
import { addVector, search, getAllVectors } from '../backend/src/rag/vectorStore.js'

const text = `
React is a JavaScript library for building user interfaces. It uses a component-based architecture where UI is broken into reusable pieces.

React uses hooks like useState and useEffect to manage state and side effects. These hooks make functional components powerful and easier to maintain.

Node.js is a runtime environment that allows JavaScript to run on the server side. It is built on Chrome's V8 engine.

Express is a minimal backend framework built on top of Node.js. It helps in building APIs and web applications quickly.

MongoDB is a NoSQL database that stores data in flexible JSON-like documents. It is widely used in modern web applications.
`;

async function ingest() {
  const chunks = chunkText(text, 40, 1);

  console.log("\n===== CHUNKS =====");
  console.log("Total chunks:", chunks.length);

  chunks.forEach((c, i) => {
    console.log(`\nChunk ${i + 1}:`);
    console.log(c);
  });

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);

    addVector({
      chunk,
      embedding,
    });
  }

  console.log("\nIngestion complete");
}

async function queryTest() {
  const queries = [
    "How does React manage state?",
    "What is Node.js used for?",
    "What is Express framework?"
  ];

  for (const query of queries) {
    const queryEmbedding = await getEmbedding(query);

    const results = search(queryEmbedding, 2);

    console.log("\n\n============================");
    console.log("QUERY:", query);
    console.log("============================");

    results.forEach((r, i) => {
      console.log(`\n#${i + 1}`);
      console.log("Score:", r.score.toFixed(4));
      console.log("Chunk:", r.chunk);
    });
  }
}

async function run() {
  await ingest();
  await queryTest();
}

run();
