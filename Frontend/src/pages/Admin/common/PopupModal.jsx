// src/components/common/PopupModal.jsx
import React from "react";

export default function PopupModal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute text-xl text-gray-600 top-2 right-2 hover:text-gray-900"
        >
          ✖
        </button>

        {children}
      </div>
    </div>
  );
}
