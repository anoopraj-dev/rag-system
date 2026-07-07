import React from "react";

export default function DeleteConfirmModal({ deleteTarget, isDeleting, onCancel, onConfirm }) {
  if (!deleteTarget) return null;
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-850 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 text-left">
        <h3 className="text-base font-bold text-white">Delete Document?</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-zinc-200">"{deleteTarget}"</span>? This will remove all associated chunks and embeddings from the vector store.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-455 hover:text-zinc-200 text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-650 hover:bg-red-550 text-white text-sm font-semibold rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
