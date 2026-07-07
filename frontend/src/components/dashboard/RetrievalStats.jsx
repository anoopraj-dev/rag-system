import React from "react";

export default function RetrievalStats({ parameters }) {
  return (
    <div className="space-y-3 bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl">
      <h5 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Indexed Corpus Stats</h5>
      <div className="grid grid-cols-2 gap-2 text-sm font-mono text-zinc-400">
        <div className="bg-zinc-950 p-2 border border-zinc-900 rounded-lg">
          <span className="text-zinc-550 block mb-0.5 text-xs">Top-K Nodes:</span>
          <span className="text-zinc-200 font-bold text-sm">{parameters.topK}</span>
        </div>
        <div className="bg-zinc-950 p-2 border border-zinc-900 rounded-lg">
          <span className="text-zinc-550 block mb-0.5 text-xs">Overlap Size:</span>
          <span className="text-zinc-200 font-bold text-sm">100 chars</span>
        </div>
      </div>
    </div>
  );
}
