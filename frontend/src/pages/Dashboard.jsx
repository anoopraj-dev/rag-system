import React, { useState, useEffect } from "react";
import { FileText, Database, Trash2, RefreshCw } from "lucide-react";
import { getDocuments, deleteDocument } from "../services/api";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCorpus();
  }, []);

  const loadCorpus = async () => {
    try {
      setError("");
      const data = await getDocuments();
      setDocuments(data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch documents from server");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCorpus();
    setIsRefreshing(false);
  };

  const handleDelete = async (indexToDelete) => {
    const docToDelete = documents[indexToDelete];
    if (!docToDelete) return;
    try {
      setError("");
      await deleteDocument(docToDelete.name);
      await loadCorpus();
    } catch (e) {
      console.error(e);
      setError("Failed to delete document from server");
    }
  };

  const totalDocs = documents.length;
  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunks || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            System Dashboard
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Overview of indexed documents and search tokens.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition duration-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}


      {/* Basic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-semibold uppercase">Ingested Documents</span>
            <div className="text-2xl font-bold text-white">{totalDocs}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-semibold uppercase">Total Indexed Chunks</span>
            <div className="text-2xl font-bold text-white">{totalChunks}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ingested Corpus list */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800/80">
          <h3 className="text-sm font-bold text-white">Ingested Files</h3>
        </div>

        {totalDocs > 0 ? (
          <div className="divide-y divide-zinc-800/60">
            {documents.map((doc, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between text-sm hover:bg-zinc-900/20 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-zinc-200 block truncate max-w-[250px] md:max-w-[400px]">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {doc.size} • {doc.chunks} chunks • Strategy: {doc.strategy}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[10px] text-zinc-500 shrink-0">{doc.date}</span>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-zinc-500">
            <FileText className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
            <h4 className="text-xs font-semibold text-zinc-400">No documents indexed</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Ingest a text file or snippet on the "Ingest Document" page to populate the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
