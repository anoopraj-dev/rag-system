import React from "react";
import { MessageSquare } from "lucide-react";

export default function ChatHistoryList({ conversations, activeId, setActiveId }) {
  return (
    <div className="flex-1 overflow-y-auto px-3 space-y-1 py-4">
      <span className="text-xs font-semibold text-zinc-455 px-3 block mb-2">
        Chat History
      </span>
      {conversations.length > 0 ? (
        conversations.map((chat) => {
          const isActive = activeId === chat.id;
          return (
            <button
              key={chat.id}
              onClick={() => setActiveId(chat.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition text-left text-sm ${
                isActive
                  ? "bg-zinc-900 border border-zinc-800 text-indigo-400 font-semibold"
                  : "text-zinc-450 hover:text-zinc-200 hover:bg-zinc-900/30"
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
              <span className="truncate flex-1">{chat.title || "New Chat"}</span>
            </button>
          );
        })
      ) : (
        <div className="text-center p-6 text-sm text-zinc-500 italic">
          No active conversations
        </div>
      )}
    </div>
  );
}
