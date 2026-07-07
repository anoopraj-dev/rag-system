import React from "react";
import { UploadCloud, Check, Bot, User, FileText } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

export default function MessageItem({
  msg,
  idx,
  isActive,
  setActiveMessageId,
  openSources,
  toggleSources
}) {
  const isAI = msg.role === "assistant";
  const isIngest = msg.role === "ingest";

  if (isIngest) {
    const stepNames = ["Uploading", "Reading data", "Chunking", "Embedding", "Vector storage", "Ready state"];
    return (
      <div className="flex justify-start animate-fade-in">
        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 mr-3">
          <UploadCloud className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="bg-zinc-900/60 border border-zinc-850 rounded-2xl p-4 max-w-[80%] min-w-[280px]">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-3">
            <span className="text-sm font-bold text-zinc-200 truncate max-w-[150px]">{msg.fileName}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded border uppercase bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
              {msg.step === 6 ? "Success" : msg.step === -1 ? "Error" : "Indexing"}
            </span>
          </div>

          <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-zinc-855">
            {stepNames.map((name, sIdx) => {
              const stepNum = sIdx + 1;
              const isDone = msg.step > stepNum || msg.step === 6;
              const isCurrent = msg.step === stepNum;
              return (
                <div key={sIdx} className="flex items-center gap-3 text-sm relative z-10">
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs border font-bold ${
                    isDone ? "bg-emerald-500 border-emerald-500 text-zinc-950" : isCurrent ? "bg-indigo-650 border-indigo-400 text-white animate-pulse" : "border-zinc-800 bg-zinc-950 text-zinc-650"
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : stepNum}
                  </div>
                  <span className={isDone ? "text-zinc-350" : isCurrent ? "text-indigo-400 font-semibold" : "text-zinc-550"}>{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${isAI ? "justify-start" : "justify-end"} animate-fade-in`}>
      {isAI && (
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div
        onClick={() => isAI && msg.model !== "system" && setActiveMessageId(msg.id)}
        className={`p-4 rounded-2xl max-w-[85%] text-base leading-relaxed cursor-pointer transition ${
          isAI
            ? isActive
              ? "bg-zinc-900 border border-indigo-500/50 shadow-md text-zinc-100"
              : "bg-zinc-900/60 border border-zinc-855 text-zinc-250 hover:border-zinc-800"
            : "bg-indigo-655 text-white font-medium ml-auto animate-fade-in"
        }`}
      >
        {isAI ? (
          <MarkdownRenderer text={msg.text} />
        ) : (
          <p className="whitespace-pre-wrap">{msg.text}</p>
        )}

        {isAI && msg.results && msg.results.length > 0 && (
          <div className="mt-3.5 pt-2.5 border-t border-zinc-855">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleSources(msg.id); }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-350 transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{openSources[msg.id] ? "Hide Sources" : `View Sources (${msg.results.length})`}</span>
            </button>
            
            {openSources[msg.id] && (
              <div className="mt-2.5 space-y-2.5 max-h-60 overflow-y-auto pr-1 animate-fade-in">
                {msg.results.map((res, rIdx) => (
                  <div key={rIdx} className="bg-zinc-950/80 border border-zinc-850 rounded-lg p-3 text-sm text-zinc-350 space-y-1">
                    <div className="flex justify-between items-center text-xs border-b border-zinc-900/80 pb-1.5 mb-1.5 text-zinc-400">
                      <span className="font-semibold truncate max-w-[220px]">{res.metadata?.title || "Untitled Document"}</span>
                      <span className="font-mono text-emerald-450">Match: {(res.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{res.chunk}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isAI && msg.model !== "system" && (
          <div className="mt-2 pt-1.5 text-xs text-zinc-550 font-mono flex items-center justify-between">
            <span>Model: {msg.model || "Local RAG"}</span>
            <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">Active Inspect</span>
          </div>
        )}
      </div>
      {!isAI && (
        <div className="w-9 h-9 rounded-lg bg-indigo-650 text-white flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
