# Cortex

> A Retrieval-Augmented Generation (RAG) system built from scratch to understand how RAG works under the hood.

## Overview

Cortex is a learning project that explores the complete Retrieval-Augmented Generation (RAG) pipeline without relying on orchestration frameworks like LangChain.

The primary goal was to understand each stage of the retrieval pipeline by implementing it from scratch—from document ingestion to final response generation.

Rather than treating RAG as a black box, Cortex exposes every major step involved in retrieving relevant context and generating grounded responses.

---

## Why this project?

There are many excellent frameworks that make building RAG applications straightforward. However, before using those abstractions, I wanted to understand the underlying concepts myself.

This project helped me learn:

* How documents are chunked
* How embeddings represent text
* How vector similarity search works
* How retrieved context is injected into prompts
* How an LLM generates grounded responses

---

## Features

* Document and text ingestion
* Recursive document chunking
* Local embedding generation
* Custom in-memory vector store
* Cosine similarity search
* Multi-document indexing
* Document deletion by title
* Prompt preview
* Pipeline telemetry
* Configurable LLM providers
* Modern React-based interface

---

## RAG Pipeline

```text
Document / Text
       │
       ▼
Recursive Chunking
       │
       ▼
Embedding Generation
(Xenova/all-MiniLM-L6-v2)
       │
       ▼
In-Memory Vector Store
       │
       ▼
Cosine Similarity Search
       │
       ▼
Prompt Construction
       │
       ▼
LLM (OpenAI / Ollama)
       │
       ▼
Generated Response
```

---

## Tech Stack

### Frontend

* React 18
* Vite
* Tailwind CSS v4
* Lucide React

### Backend

* Node.js
* Express
* Layered Architecture

  * Controllers
  * Services
  * Core Providers

---

## Embedding Model

### Xenova/all-MiniLM-L6-v2

The embedding model runs locally using `@xenova/transformers`.

### Advantages

* No embedding API costs
* No network requests
* Local execution
* Documents remain on the local machine
* Fast enough for experimentation

### Trade-offs

* 384-dimensional embeddings
* Lower semantic capability than larger hosted embedding models
* Designed more for lightweight applications and learning

---

## Supported LLM Providers

### OpenAI

Default model:

```
gpt-4o-mini
```

**Pros**

* Better reasoning
* Higher-quality responses
* Consistent performance

**Cons**

* API costs
* Rate limits

---

### Ollama

Default model:

```
qwen2.5:0.5b
```

**Pros**

* Fully local inference
* No API costs
* Offline support
* Easy to swap models

**Cons**

* Smaller models have weaker reasoning
* Performance depends on local hardware

---

## Observability

One objective of Cortex was making every stage of the pipeline visible.

Telemetry includes:

* Embedding latency
* Retrieval latency
* LLM generation latency

The application also provides a prompt preview so it's easy to inspect the exact context being sent to the language model.

---

## Project Structure

```text
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   └── ...

server/
├── controllers/
├── services/
├── providers/
├── routes/
├── utils/
└── ...
```

---

## Future Improvements

Some areas I'd like to explore next:

* Persistent vector databases
* Hybrid search
* Reranking
* Metadata filtering
* Better chunking strategies
* Streaming responses
* Multiple embedding models
* Evaluation metrics

---

## Motivation

This project wasn't built as a production-ready RAG platform.

It was built to answer a simple question:

> **What actually happens between uploading a document and getting an AI-generated answer?**

Building every component myself made concepts like embeddings, vector search, retrieval, and prompt construction much easier to understand. It also gave me a much deeper appreciation for frameworks like LangChain by showing exactly what they abstract away.

---

## License

MIT License
