// src/components/TotalOrganizations.jsx

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { fetchOrganizations } from "../../../utils/api";
import { X, Building2, Mail, Globe2 } from "lucide-react";

export default function TotalOrganizations({ open, onClose }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchOrganizations();
        setOrgs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild>
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:scale-95"
              >
                <div className="bg-white p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <DialogTitle as="h3" className="text-2xl font-black text-slate-800 tracking-tight">
                          Registered Organizations
                        </DialogTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Platform Partners</p>
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Organizations...</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {orgs.length > 0 ? orgs.map((o) => (
                          <div key={o.id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors shadow-sm">
                                  {o.name ? o.name.charAt(0) : '?'}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-slate-800 truncate">{o.name}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Mail size={10} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider truncate">{o.email}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                  <Globe2 size={10} className="text-slate-400" />
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{o.country} • {o.state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${o.status_code === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                  <span className={`text-[8px] font-bold uppercase tracking-widest ${o.status_code === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {o.status_code || 'ACTIVE'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="py-20 text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No organizations found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
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