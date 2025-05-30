import { useState } from "react";

export default function SaveModal({ onSave, onClose, saving }) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onSave(title);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center text-purple-400">
          Strategy Title
        </h2>
        <input
          type="text"
          className="w-full border border-gray-600 bg-gray-900 text-white rounded p-2 placeholder-gray-400"
          placeholder="e.g. SMA-20-50-Bullish"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
