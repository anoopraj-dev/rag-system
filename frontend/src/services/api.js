const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function uploadDocument(input, options = {}) {
  let body;
  let headers = {};

  if (input instanceof File) {
    body = new FormData();
    body.append("file", input);
    if (options.chunkSize) body.append("chunkSize", options.chunkSize);
    if (options.chunkOverlap) body.append("chunkOverlap", options.chunkOverlap);
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ 
      text: input,
      title: options.title,
      chunkSize: options.chunkSize,
      chunkOverlap: options.chunkOverlap
    });
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers,
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upload document");
  }
  return data;
}

export async function queryRAG(query, topK = 1) {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, topK }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to query RAG system");
  }
  return data;
}

export async function sendChatMessage(message, topK = 5) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, topK }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to get chat response");
  }
  return data;
}

export async function getDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch documents");
  }
  return data.documents || [];
}

export async function deleteDocument(name) {
  const response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete document");
  }
  return data;
}

