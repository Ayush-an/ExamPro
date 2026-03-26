// src/components/GlobalDetailsPopup.jsx

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import api from "../../../utils/api";
import { Users, GraduationCap, FileText, Bell, Inbox, X } from "lucide-react";

const icons = {
  Participants: GraduationCap,
  "Super Users": Users,
  Questions: FileText,
  Notices: Bell,
  Assignments: Inbox,
};

export default function GlobalDetailsPopup({ type, open, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !type) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/superadmin/list/${type.toLowerCase().replace(" ", "")}`);
        setData(res.data || []);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, type]);

  const Icon = icons[type] || FileText;

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-60">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild>
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-3xl data-[closed]:sm:scale-95"
              >
                <div className="bg-white p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Icon size={24} />
                      </div>
                      <div>
                        <DialogTitle as="h3" className="text-2xl font-black text-slate-800 tracking-tight">
                          Global System {type}
                        </DialogTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Repository Data</p>
                      </div>
                    </div>
                    <button 
                      onClick={onClose}
                      className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="relative">
                    {loading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Data...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {data.length > 0 ? data.map((item, idx) => (
                          <div key={idx} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                             <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                   <Icon size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                   <div className="text-sm font-bold text-slate-800 truncate">{item.name || item.full_name || item.title || 'Untitled Record'}</div>
                                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                                      {item.organizationName || item.Organization?.name ? `@${item.organizationName || item.Organization?.name} • ` : ''}
                                      {item.email || item.message || item.description || 'No additional details'}
                                   </div>
                                </div>
                             </div>
                          </div>
                        )) : (
                          <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-4 border-2 border-dashed border-slate-100">
                              <Icon size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No global records found</p>
                            <p className="text-[10px] text-slate-300 mt-2 font-medium italic">Data may still be syncing with core services</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Repository Status</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Synchronized
                      </span>
                    </div>
                    <button 
                      className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 transition shadow-lg shadow-slate-200" 
                      onClick={onClose}
                    >
                      Close Repository
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
