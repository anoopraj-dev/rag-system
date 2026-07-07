import React from "react";
import { Database, Compass, FileText, Cpu, Clock } from "lucide-react";

export default function ExecutionTimeline({ activeMessage }) {
  return (
    <div className="space-y-3.5 bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl">
      <h5 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Execution Pipeline</h5>
      
      <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-855">
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6.5 h-6.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-200 block text-sm">1. Grounding Corpus</span>
            <span className="text-sm text-zinc-450 block truncate max-w-[240px]">
              {activeMessage.results?.[0]?.metadata?.title || "No file active"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6.5 h-6.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-200 block text-sm">2. Query Embeddings</span>
            <span className="text-sm text-zinc-455 block">all-MiniLM-L6-v2 | 384 Dim</span>
          </div>
        </div>

        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6.5 h-6.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-200 block text-sm">3. Vector Similarity Search</span>
            <span className="text-sm text-zinc-455 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-550" />
              {activeMessage.queryTime || Math.round(activeMessage.latency * 0.05) || 5} ms
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6.5 h-6.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-200 block text-sm">4. LLM Generation</span>
            <span className="text-sm text-zinc-455 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-550" />
              {activeMessage.llmTime || Math.round(activeMessage.latency * 0.8) || activeMessage.latency} ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
