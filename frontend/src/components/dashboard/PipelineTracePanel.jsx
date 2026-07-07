import React from "react";
import { Layers, Clock, ChevronUp, ChevronDown } from "lucide-react";
import ExecutionTimeline from "./ExecutionTimeline";
import RetrievalStats from "./RetrievalStats";
import ChunkItemList from "./ChunkItemList";

export default function PipelineTracePanel({ 
  activeMessage, 
  parameters, 
  showPromptPreview, 
  setShowPromptPreview 
}) {
  return (
    <div className="w-[360px] border-l border-zinc-900 bg-zinc-950 flex flex-col h-full shrink-0 overflow-y-auto">
      <div className="p-4.5 border-b border-zinc-900 bg-zinc-950 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          <Layers className="w-5 h-5" />
          <h4 className="text-base font-semibold text-white tracking-wide uppercase">Pipeline Trace</h4>
        </div>
      </div>

      {activeMessage && activeMessage.role === "assistant" && activeMessage.model !== "system" ? (
        <div className="p-4.5 space-y-5 text-base">
          <ExecutionTimeline activeMessage={activeMessage} />
          
          <RetrievalStats parameters={parameters} />

          <ChunkItemList results={activeMessage.results} />

          {activeMessage.rawPrompt && (
            <div className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-xl space-y-2">
              <button
                onClick={() => setShowPromptPreview(!showPromptPreview)}
                className="w-full flex justify-between items-center text-sm font-bold text-zinc-400 uppercase tracking-wider"
              >
                <span>Injected Prompt Template</span>
                {showPromptPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showPromptPreview && (
                <pre className="bg-zinc-950 p-2.5 border border-zinc-900 rounded-lg text-xs text-zinc-455 overflow-x-auto whitespace-pre-wrap max-h-48 font-mono leading-normal">
                  {activeMessage.rawPrompt}
                </pre>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-550 select-none">
          <Clock className="w-9 h-9 text-zinc-700 mb-2 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-450 uppercase tracking-wider">No Active Trace</span>
          <p className="text-sm text-zinc-550 mt-1 max-w-[200px] leading-relaxed">
            Click on any assistant message to load the RAG trace telemetry here.
          </p>
        </div>
      )}
    </div>
  );
}
