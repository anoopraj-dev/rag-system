import React from "react";
import { UploadCloud, RefreshCw, FileText, Loader2, Plus, Trash2 } from "lucide-react";

export default function KnowledgeIndex({
  serverDocs,
  loadDocuments,
  isRefreshingDocs,
  uploadState,
  handleUpload,
  fileInputRef,
  showPasteForm,
  setShowPasteForm,
  pasteTitle,
  setPasteTitle,
  pasteContent,
  setPasteContent,
  handlePasteSubmit,
  isSidebarIngesting,
  setDeleteTarget
}) {
  return (
    <div className="p-4 border-b border-zinc-900/60 space-y-3 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 block">
          KNOWLEDGE INDEX
        </span>
        <button 
          onClick={loadDocuments} 
          disabled={isRefreshingDocs}
          className="text-zinc-500 hover:text-zinc-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDocs ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept=".txt,.pdf"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { fileInputRef.current?.click(); setShowPasteForm(false); }}
            disabled={uploadState === "uploading"}
            className="flex-1 py-1.5 px-2 border border-dashed border-zinc-800 hover:border-indigo-500/40 bg-zinc-900/10 hover:bg-zinc-900/30 rounded-xl text-xs text-zinc-455 flex items-center justify-center gap-1.5 transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{uploadState === "uploading" ? "..." : "File"}</span>
          </button>
          <button
            onClick={() => setShowPasteForm(!showPasteForm)}
            className={`flex-1 py-1.5 px-2 border border-dashed rounded-xl text-xs flex items-center justify-center gap-1.5 transition ${
              showPasteForm 
                ? "border-indigo-500 bg-indigo-500/5 text-indigo-400" 
                : "border-zinc-800 hover:border-indigo-500/40 bg-zinc-900/10 hover:bg-zinc-900/30 text-zinc-455"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {showPasteForm && (
        <form onSubmit={handlePasteSubmit} className="bg-zinc-900/30 border border-zinc-855 p-3 rounded-xl space-y-2 text-left animate-fade-in">
          <input
            type="text"
            required
            value={pasteTitle}
            onChange={(e) => setPasteTitle(e.target.value)}
            placeholder="Title (e.g. guide.txt)"
            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-zinc-250 placeholder-zinc-655 outline-none focus:border-indigo-500/45 transition"
          />
          <textarea
            required
            rows="3"
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste content here..."
            className="w-full bg-zinc-950 border border-zinc-855 rounded-lg p-2 text-xs text-zinc-250 placeholder-zinc-655 outline-none focus:border-indigo-500/45 transition resize-none font-sans"
          />
          <button
            type="submit"
            disabled={isSidebarIngesting || !pasteContent.trim()}
            className="w-full py-1 bg-indigo-655 hover:bg-indigo-555 text-white rounded-lg text-xs font-semibold transition"
          >
            {isSidebarIngesting ? "Indexing..." : "Index Snippet"}
          </button>
        </form>
      )}

      {(uploadState === "uploading" || isSidebarIngesting) && (
        <div className="flex items-center gap-2 p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-[11px] text-indigo-400 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Indexing new content...</span>
        </div>
      )}

      <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
        {serverDocs.length > 0 && (
          serverDocs.map((doc, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-2 bg-zinc-900/40 border border-zinc-800/80 rounded-lg text-xs animate-fade-in"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate text-zinc-300 font-medium">{doc.name || doc.title}</span>
              </div>
              <button
                onClick={() => setDeleteTarget(doc.name || doc.title)}
                className="text-zinc-600 hover:text-red-400 p-0.5 rounded transition shrink-0 ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
