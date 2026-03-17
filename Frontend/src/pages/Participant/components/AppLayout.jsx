import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#fafbfc] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-[#fafbfc]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
