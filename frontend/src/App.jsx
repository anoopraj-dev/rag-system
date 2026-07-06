import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Search from "./pages/Search";
import Chat from "./pages/Chat";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "upload":
        return <Upload />;
      case "search":
        return <Search />;
      case "chat":
        return <Chat />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-tr from-zinc-950 via-zinc-950 to-indigo-950/20 relative">
        {/* Glow ambient background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        
        <div className="relative z-10">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}
