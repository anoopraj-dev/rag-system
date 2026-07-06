import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { sendChatMessage } from "../services/api";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! Ask me any question, and I will search the vector database to retrieve the matching chunk context.",
      results: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [topK, setTopK] = useState(3);
  const [expandedResultIdx, setExpandedResultIdx] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput("");

    // Add User Message
    const userMsg = { id: `user_${Date.now()}`, role: "user", text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await sendChatMessage(userText, topK);

      if (data.success && data.data) {
        const results = data.data.results || [];
        const assistantText = data.data.answer || (results.length > 0
          ? "Here is what I found based on your query:"
          : "I couldn't find strong matches in your knowledge base.");

        const aiMsg = {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          text: assistantText,
          results: results,
          confidenceType: data.data.type,
          confidenceValue: data.data.confidence
        };

        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: "assistant",
        text: `Error querying vector database: ${err.message || "Failed to reach backend"}`,
        results: []
      }]);
    } finally {
      setIsTyping(false);
      setExpandedResultIdx(null);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Session reset. Ask me a question to look up context nodes.",
        results: []
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/40 flex items-center justify-between px-6">
        <div>
          <h3 className="text-sm font-bold text-white">Agent Chat</h3>
          <p className="text-[10px] text-zinc-500">Retrieves context from indexed documents</p>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, msgIdx) => {
          const isAI = msg.role === "assistant";
          return (
            <div
              key={msg.id || msgIdx}
              className={`flex gap-3.5 ${isAI ? "justify-start" : "justify-end"}`}
            >
              {isAI && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`p-4 rounded-xl max-w-[85%] text-sm leading-relaxed ${isAI
                  ? "bg-zinc-900/50 border border-zinc-800/80 text-zinc-200"
                  : "bg-indigo-600 text-white font-medium shadow-md"
                }`}>
                {isAI && msg.confidenceType && (
                  <div className="mb-2.5 flex items-center gap-1.5 select-none">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider border uppercase ${
                      msg.confidenceType === "high_confidence"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : msg.confidenceType === "low_confidence"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                    }`}>
                      {msg.confidenceType.replace("_", " ")}
                    </span>
                    {msg.confidenceValue !== undefined && (
                      <span className="text-[9px] text-zinc-500 font-semibold font-mono">
                        Margin: {msg.confidenceValue.toFixed(4)}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-zinc-100 font-medium">{msg.text}</p>

                {/* Render results lists if AI and has results */}
                {isAI && msg.results && msg.results.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2">
                    {msg.results.map((r, rIdx) => {
                      const score = typeof r.score === "number" ? r.score.toFixed(4) : "N/A";
                      const metadata = r.metadata || {};
                      const uniqueKey = `${msg.id}_${rIdx}`;
                      const isExpanded = expandedResultIdx === uniqueKey;

                      return (
                        <div key={rIdx} className="bg-zinc-950/60 border border-zinc-850 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedResultIdx(isExpanded ? null : uniqueKey)}
                            className="w-full p-2.5 flex items-center justify-between text-xs text-zinc-350 hover:bg-zinc-900/40 transition text-left"
                          >
                            <div className="flex items-center gap-2 truncate pr-4">
                              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate font-semibold text-zinc-300">
                                {metadata.title || "Context Node"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded">
                                Score: {score}
                              </span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3 border-t border-zinc-900 bg-zinc-950/40 text-xs text-zinc-300 leading-relaxed font-sans">
                              {r.chunk}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing */}
        {isTyping && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center gap-1.5 text-zinc-500 text-xs animate-pulse">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/20">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the indexed context..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500/30 transition"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
