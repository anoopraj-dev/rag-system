import React, { useRef, useState } from "react";
import { Cpu, Plus } from "lucide-react";
import { usePipeline } from "../state/pipelineStore";
import { uploadDocument, deleteDocument } from "../services/api";

import KnowledgeIndex from "./sidebar/KnowledgeIndex";
import ChatHistoryList from "./sidebar/ChatHistoryList";
import DeleteConfirmModal from "./sidebar/DeleteConfirmModal";

export default function Sidebar({ 
  conversations, 
  activeId, 
  setActiveId, 
  onNewChat, 
  isCollapsed, 
  setIsCollapsed,
  setMessages
}) {
  const { 
    serverDocs, 
    loadDocuments, 
    isRefreshingDocs,
    parameters
  } = usePipeline();

  const fileInputRef = useRef(null);
  const [uploadState, setUploadState] = useState(null);
  
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [isSidebarIngesting, setIsSidebarIngesting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState("uploading");
    
    const ingestMsgId = `ingest_${Date.now()}`;
    const initialIngestMsg = {
      id: ingestMsgId,
      role: "ingest",
      fileName: file.name,
      status: "Uploading",
      step: 1
    };
    if (setMessages) setMessages(prev => [...prev, initialIngestMsg]);

    let uploadStep = 1;
    const progressInterval = setInterval(() => {
      if (uploadStep < 5) {
        uploadStep += 1;
        if (setMessages) {
          setMessages(prevMsgs => prevMsgs.map(m => {
            if (m.id === ingestMsgId) {
              const statusMap = {
                2: "Reading file",
                3: "Chunking",
                4: "Embedding",
                5: "Vector storage"
              };
              return { ...m, status: statusMap[uploadStep], step: uploadStep };
            }
            return m;
          }));
        }
      }
    }, 450);

    try {
      const response = await uploadDocument(file, {
        chunkSize: parameters.chunkSize
      });
      clearInterval(progressInterval);

      if (response.success) {
        setUploadState("success");
        if (setMessages) {
          setMessages(prev => prev.map(m => {
            if (m.id === ingestMsgId) {
              return {
                ...m,
                status: "Ready state",
                step: 6,
                totalChunks: response.totalChunks
              };
            }
            return m;
          }));

          setMessages(prev => [
            ...prev,
            {
              id: `assistant_confirm_${Date.now()}`,
              role: "assistant",
              text: `Document "${file.name}" indexed successfully (${response.totalChunks} chunks).`,
              results: [],
              latency: 0,
              confidenceType: "high_confidence",
              maxScore: 1.0,
              model: "system",
              rawPrompt: "Ingestion complete."
            }
          ]);
        }
        loadDocuments();
        setTimeout(() => setUploadState(null), 2000);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setUploadState("error");
      if (setMessages) {
        setMessages(prev => prev.map(m => {
          if (m.id === ingestMsgId) {
            return { ...m, status: `Ingestion Failed: ${err.message}`, step: -1 };
          }
          return m;
        }));
      }
      setTimeout(() => setUploadState(null), 3000);
    }
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!pasteContent.trim() || isSidebarIngesting) return;

    const docTitle = pasteTitle.trim() || `snippet_${Date.now()}.txt`;
    setIsSidebarIngesting(true);

    const ingestMsgId = `ingest_${Date.now()}`;
    const initialIngestMsg = {
      id: ingestMsgId,
      role: "ingest",
      fileName: docTitle,
      status: "Uploading",
      step: 1
    };
    if (setMessages) setMessages(prev => [...prev, initialIngestMsg]);

    let uploadStep = 1;
    const progressInterval = setInterval(() => {
      if (uploadStep < 5) {
        uploadStep += 1;
        if (setMessages) {
          setMessages(prevMsgs => prevMsgs.map(m => {
            if (m.id === ingestMsgId) {
              const statusMap = {
                2: "Reading content",
                3: "Chunking text",
                4: "Generating embeddings",
                5: "Vector indexing"
              };
              return { ...m, status: statusMap[uploadStep], step: uploadStep };
            }
            return m;
          }));
        }
      }
    }, 450);

    try {
      const response = await uploadDocument(pasteContent, {
        title: docTitle,
        chunkSize: parameters.chunkSize
      });
      clearInterval(progressInterval);

      if (response.success) {
        setPasteTitle("");
        setPasteContent("");
        setShowPasteForm(false);
        if (setMessages) {
          setMessages(prev => prev.map(m => {
            if (m.id === ingestMsgId) {
              return {
                ...m,
                status: "Ready state",
                step: 6,
                totalChunks: response.totalChunks
              };
            }
            return m;
          }));

          setMessages(prev => [
            ...prev,
            {
              id: `assistant_confirm_${Date.now()}`,
              role: "assistant",
              text: `Raw text snippet "${docTitle}" indexed successfully (${response.totalChunks} chunks).`,
              results: [],
              latency: 0,
              confidenceType: "high_confidence",
              maxScore: 1.0,
              model: "system",
              rawPrompt: "Ingestion complete."
            }
          ]);
        }
        loadDocuments();
      }
    } catch (err) {
      clearInterval(progressInterval);
      if (setMessages) {
        setMessages(prev => prev.map(m => {
          if (m.id === ingestMsgId) {
            return { ...m, status: `Ingestion Failed: ${err.message}`, step: -1 };
          }
          return m;
        }));
      }
      alert(err.message || "Failed to ingest text snippet.");
    } finally {
      setIsSidebarIngesting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteDocument(deleteTarget);
      if (res.success) {
        loadDocuments();
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <aside 
      className={`border-r border-zinc-900 bg-zinc-950 flex flex-col h-screen select-none transition-all duration-300 ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-64"
      }`}
    >
      <div className="p-5 flex items-center justify-between border-b border-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-base tracking-wider text-white">
              CORTEX RAG
            </h1>
            <span className="text-xs text-zinc-455 block">
              Vector Query System
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(true)}
          className="text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-900 rounded-lg transition lg:hidden"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 border-b border-zinc-900/40">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-550 border border-indigo-500/10 text-white rounded-xl text-sm font-semibold transition duration-200 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      <KnowledgeIndex
        serverDocs={serverDocs}
        loadDocuments={loadDocuments}
        isRefreshingDocs={isRefreshingDocs}
        uploadState={uploadState}
        handleUpload={handleUpload}
        fileInputRef={fileInputRef}
        showPasteForm={showPasteForm}
        setShowPasteForm={setShowPasteForm}
        pasteTitle={pasteTitle}
        setPasteTitle={setPasteTitle}
        pasteContent={pasteContent}
        setPasteContent={setPasteContent}
        handlePasteSubmit={handlePasteSubmit}
        isSidebarIngesting={isSidebarIngesting}
        setDeleteTarget={setDeleteTarget}
      />

      <ChatHistoryList
        conversations={conversations}
        activeId={activeId}
        setActiveId={setActiveId}
      />

      <DeleteConfirmModal
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </aside>
  );
}
