import React, { useState } from "react";
import { Search as SearchIcon, FileText, Copy, Check, Info, Loader2 } from "lucide-react";
import { queryRAG } from "../services/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(3);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // States
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setErrorMessage("");
    setSearchResults([]);

    try {
      const data = await queryRAG(query, topK);
      if (data.success && data.data) {
        setSearchResults(data.data.results || []);
      }
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to retrieve matches");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Vector Search
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Query the index directly to retrieve matching semantic text coordinates.
        </p>
      </div>

      {/* Search Row */}
      <form onSubmit={triggerSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query vector spaces (e.g. 'revenue', 'parameters')..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500/30 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs rounded-lg transition"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>

        {/* Limit Option */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 pl-1">
          <span>Max Results:</span>
          <select
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded px-1.5 py-0.5 outline-none"
          >
            <option value={3}>3 Chunks</option>
            <option value={5}>5 Chunks</option>
            <option value={10}>10 Chunks</option>
          </select>
        </div>
      </form>

      {/* Error */}
      {errorMessage && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {errorMessage}
        </p>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {isSearching ? (
          <div className="p-10 text-center bg-zinc-900/10 border border-dashed border-zinc-850 rounded-xl">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Querying vector models...</p>
          </div>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((result, idx) => {
                const metadata = result.metadata || {};
                const score = typeof result.score === "number" ? result.score.toFixed(4) : "N/A";
                
                return (
                  <div 
                    key={result.id || idx} 
                    className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3 hover:border-zinc-700/80 transition"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="font-semibold text-zinc-350 truncate">
                          {metadata.title || "Indexed Fragment"}
                        </span>
                        {metadata.sectionIndex !== undefined && (
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            (Sec {metadata.sectionIndex}, Chunk {metadata.chunkIndex})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        Score: {score}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed font-sans font-medium">
                      {result.chunk}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 text-[11px] text-zinc-500">
                      <span>Tokens: {metadata.tokenEstimate || "N/A"}</span>
                      <button
                        onClick={() => handleCopy(idx, result.chunk)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center border border-dashed border-zinc-800 rounded-xl space-y-2">
              <Info className="w-6 h-6 text-zinc-700 mx-auto" />
              <p className="text-xs font-semibold text-zinc-400">No relevant vectors retrieved</p>
              <p className="text-[11px] text-zinc-500">Try adjusting your query or make sure you have ingested files.</p>
            </div>
          )
        ) : (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
            Enter a search term above to test matching index scores.
          </div>
        )}
      </div>
    </div>
  );
}
