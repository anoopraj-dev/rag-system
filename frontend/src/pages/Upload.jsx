import React, { useState } from "react";
import { UploadCloud, FileText, Play, Loader2, CheckCircle2, Type } from "lucide-react";
import { uploadDocument } from "../services/api";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [inputType, setInputType] = useState("file"); // file, text
  const [chunkStrategy, setChunkStrategy] = useState("recursive");
  const [chunkSize, setChunkSize] = useState(512);
  const [chunkOverlap, setChunkOverlap] = useState(100);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultData, setResultData] = useState(null);

  const startIngestion = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    setResultData(null);

    let textToUpload = "";
    let docName = "";
    let docSize = "";

    try {
      let payload;
      if (inputType === "file") {
        if (!selectedFile) throw new Error("Select a file first");
        docName = selectedFile.name;
        docSize = `${(selectedFile.size / 1024).toFixed(1)} KB`;
        payload = selectedFile;
      } else {
        if (!pastedText.trim()) throw new Error("Paste some text first");
        docName = `Snippet (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        docSize = `${(pastedText.length / 1024).toFixed(1)} KB`;
        payload = pastedText;
      }

      // Call API
      const result = await uploadDocument(payload, { chunkSize, chunkOverlap });

      setResultData(result);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process text");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetIngestion = () => {
    setSelectedFile(null);
    setPastedText("");
    setResultData(null);
    setErrorMessage("");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Ingest Document
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Load new raw text or markdown files into the vector database.
        </p>
      </div>

      {!isProcessing && !resultData ? (
        <div className="space-y-5">
          {/* Input Type */}
          <div className="flex bg-zinc-900/60 p-1 border border-zinc-800 rounded-lg w-fit text-xs">
            <button
              onClick={() => { setInputType("file"); setErrorMessage(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-md transition ${inputType === "file" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => { setInputType("text"); setErrorMessage(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-md transition ${inputType === "text" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
          </div>

          {/* Source Area */}
          {inputType === "file" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) {
                  setSelectedFile(e.dataTransfer.files[0]);
                  setErrorMessage("");
                }
              }}
              onClick={() => document.getElementById("fileSelector").click()}
              className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition"
            >
              <input
                id="fileSelector"
                type="file"
                className="hidden"
                accept=".txt,.md,.json,.csv,.pdf"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setSelectedFile(e.target.files[0]);
                    setErrorMessage("");
                  }
                }}
              />
              <UploadCloud className="w-8 h-8 text-zinc-500 mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-semibold text-zinc-200 truncate max-w-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Click to browse or drop file here
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Supports PDF, text, markdown, csv, json
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-4">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste text here..."
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-zinc-200 placeholder-zinc-500 text-sm focus:border-indigo-500/30 outline-none resize-none font-sans"
              />
            </div>
          )}



          {/* Error Message */}
          {errorMessage && (
            <p className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errorMessage}
            </p>
          )}

          {/* Submit */}
          {((inputType === "file" && selectedFile) || (inputType === "text" && pastedText.trim())) && (
            <button
              onClick={startIngestion}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ingest to Vector DB</span>
            </button>
          )}
        </div>
      ) : isProcessing ? (
        <div className="p-12 text-center bg-zinc-900/20 border border-zinc-800 rounded-xl space-y-3">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-medium">Processing document & indexing vectors...</p>
        </div>
      ) : (
        <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center space-y-4 max-w-sm mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-md font-bold text-white">Ingested Successfully</h3>
            <p className="text-xs text-zinc-400">
              The content has been sliced into {resultData?.totalChunks} vector chunks.
            </p>
          </div>
          <button
            onClick={resetIngestion}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-semibold transition"
          >
            Ingest Another
          </button>
        </div>
      )}
    </div>
  );
}
