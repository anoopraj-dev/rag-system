import React from "react";
import { LayoutDashboard, UploadCloud, Search, MessageSquare, Cpu } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Ingest Document", icon: UploadCloud },
    { id: "search", label: "Search Chunks", icon: Search },
    { id: "chat", label: "Chat Agent", icon: MessageSquare },
  ];

  return (
    <aside className="w-60 border-r border-zinc-900 bg-zinc-950 flex flex-col h-screen select-none">
      {/* Header / Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-bold text-base tracking-wider text-white">
            CORTEX
          </h1>
          <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-widest block">
            RAG ENGINE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 text-left text-sm ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-medium"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Simple Connection Status */}
      <div className="p-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
        <span className="text-[10px] text-zinc-650">v1.0.0</span>
      </div>
    </aside>
  );
}
