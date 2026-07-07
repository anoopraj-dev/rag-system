import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, Loader2, Menu, Cpu
} from "lucide-react";
import { usePipeline } from "../state/pipelineStore";
import { usePipelineExecution } from "../hooks/usePipelineExecution";

import PipelineTracePanel from "../components/dashboard/PipelineTracePanel";
import MessageItem from "../components/dashboard/MessageItem";

export default function Dashboard({ 
  chat, 
  setMessages, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed 
}) {
  const {
    parameters,
    pipelineState,
    loadDocuments
  } = usePipeline();

  const { isTyping, executePipeline } = usePipelineExecution();

  const messages = chat?.messages || [];
  const [input, setInput] = useState("");
  const [activeMessageId, setActiveMessageId] = useState("");
  const [openSources, setOpenSources] = useState({});
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const lastAIMessage = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAIMessage) {
      setActiveMessageId(lastAIMessage.id);
    } else if (messages.length > 0) {
      setActiveMessageId(messages[messages.length - 1].id);
    } else {
      setActiveMessageId("welcome");
    }
  }, [chat?.id, messages.length]);

  const activeMessage = messages.find(m => m.id === activeMessageId) || messages[messages.length - 1];

  const toggleSources = (msgId) => {
    setOpenSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput("");

    const tempUserMsgId = `user_${Date.now()}`;
    const userMsg = { id: tempUserMsgId, role: "user", text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    
    const response = await executePipeline(userText, messages, setMessages);
    if (response && response.pipelineState) {
      loadDocuments();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-row h-full overflow-hidden relative bg-zinc-950">
      <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative border-r border-zinc-900/60 font-sans">
        <header className="p-5 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-lg transition mr-1"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-white">Cortex RAG Console</h2>
              <p className="text-sm font-medium text-indigo-400 mt-0.5">
                {pipelineState.document?.name 
                  ? `Active context: ${pipelineState.document.name}` 
                  : "No active context"}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <MessageItem 
                key={msg.id || idx}
                msg={msg}
                idx={idx}
                isActive={activeMessageId === msg.id}
                setActiveMessageId={setActiveMessageId}
                openSources={openSources}
                toggleSources={toggleSources}
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto px-4 py-16 space-y-6 text-center select-none animate-fade-in">
              <div className="inline-flex p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 mb-4 animate-pulse">
                <Cpu className="w-14 h-14" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">Cortex Vector Search & Inference</h2>
              <p className="text-base text-zinc-455 mt-2 max-w-md leading-relaxed">
                Ground your queries with contextual reference files. Ingest documents or paste raw text snippets directly from the sidebar.
              </p>
            </div>
          )}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl flex items-center gap-2.5 text-zinc-300 text-sm">
                <Loader2 className="w-4.5 h-4.5 text-indigo-400 animate-spin" />
                <span>Retrieving matches & generating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
              placeholder="Ask anything about the uploaded documents..."
              className="flex-1 bg-zinc-950 border border-zinc-855 rounded-xl px-4 py-3 text-base text-zinc-200 placeholder-zinc-655 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition resize-none max-h-24 min-h-[46px]"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3.5 bg-indigo-650 hover:bg-indigo-550 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-xl font-bold transition shrink-0 shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <PipelineTracePanel 
        activeMessage={activeMessage}
        parameters={parameters}
        showPromptPreview={showPromptPreview}
        setShowPromptPreview={setShowPromptPreview}
      />
    </div>
  );
}
