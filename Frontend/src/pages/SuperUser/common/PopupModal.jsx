import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PopupModal({ open, onClose, children, maxWidth = "max-w-2xl" }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full ${maxWidth} bg-white rounded-[44px] shadow-2xl border border-slate-100 overflow-hidden`}
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 z-[160] p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition shadow-sm"
            >
              <X size={20} />
            </button>

            <div className="p-0">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
