import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import { PipelineProvider } from "./state/pipelineStore";

export default function App() {
  const [conversations, setConversations] = useState([
    {
      id: "default_chat",
      title: "New Conversation",
      messages: []
    }
  ]);
  const [activeConversationId, setActiveConversationId] = useState("default_chat");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const updateConversationMessages = (chatId, newMessages) => {
    setConversations(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const resolvedMessages = typeof newMessages === "function"
          ? newMessages(chat.messages)
          : newMessages;

        let title = chat.title;
        const firstUserMsg = resolvedMessages.find(m => m.role === "user");
        if (firstUserMsg && chat.title === "New Conversation") {
          title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? "..." : "");
        }
        return {
          ...chat,
          title,
          messages: resolvedMessages
        };
      }
      return chat;
    }));
  };

  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newChat = {
      id: newId,
      title: "New Conversation",
      messages: []
    };
    setConversations(prev => [newChat, ...prev]);
    setActiveConversationId(newId);
  };

  const activeChat = conversations.find(c => c.id === activeConversationId) || conversations[0];

  return (
    <PipelineProvider>
      <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
        <Sidebar 
          conversations={conversations}
          activeId={activeConversationId}
          setActiveId={setActiveConversationId}
          onNewChat={handleNewChat}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          setMessages={(newMsgs) => updateConversationMessages(activeConversationId, newMsgs)}
        />

        <main className="flex-1 overflow-hidden bg-zinc-950 relative flex flex-col">
          <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
            <Dashboard 
              chat={activeChat}
              setMessages={(newMsgs) => updateConversationMessages(activeConversationId, newMsgs)}
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
            />
          </div>
        </main>
      </div>
    </PipelineProvider>
  );
}
