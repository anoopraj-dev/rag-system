import React from "react";

export default function ChunkItemList({ results }) {
  return (
    <div className="space-y-3">
      <h5 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-1">
        Retrieved Chunks ({results?.length || 0})
      </h5>
      {results && results.length > 0 ? (
        results.map((res, rIdx) => (
          <div key={rIdx} className="bg-zinc-900/30 border border-zinc-850 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-sm border-b border-zinc-850 pb-1.5">
              <span className="font-semibold text-indigo-400 truncate max-w-[170px]">
                {res.metadata?.title || "Raw snippet"}
              </span>
              <span className="font-mono text-emerald-450 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 text-xs">
                {(res.score * 100).toFixed(0)}% Match
              </span>
            </div>
            <p className="text-zinc-350 text-sm leading-relaxed max-h-28 overflow-y-auto pr-0.5 scrollbar-thin whitespace-pre-wrap">
              {res.chunk}
            </p>
          </div>
        ))
      ) : (
        <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-4 text-center text-sm text-zinc-500 italic">
          No context chunks retrieved
        </div>
      )}
    </div>
  );
}
