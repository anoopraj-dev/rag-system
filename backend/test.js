import recursiveChunk from "../backend/src/rag/chunking/recursiveChunker.js"

const text = `
React is a JavaScript library for building user interfaces.

It follows a component-based architecture where UI is split into reusable components.

Hooks like useState and useEffect help manage state and side effects.

React Context allows data sharing without prop drilling.

Express is a backend framework built on Node.js.

It simplifies routing, middleware, and HTTP request handling.

Middleware functions execute before the final route handler.

MongoDB is a NoSQL database.

Aggregation pipelines allow powerful data processing.
`;

const chunks = recursiveChunk(text, 120);

console.log("Total Chunks:", chunks.length);

chunks.forEach((chunk, index) => {
  console.log("\n====================");
  console.log(`Chunk ${index + 1}`);
  console.log("====================");
  console.log(chunk);
  console.log("Length:", chunk.length);
});
