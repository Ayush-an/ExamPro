// Navbar.jsx
import { BellIcon, EnvelopeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FiFile } from "react-icons/fi";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { fetchFeedbacks, sendNotice, fetchOrganizations } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import SuperAdminProfilePopup from "./SuperAdminProfilePopup";
import { X, Send, Mail, Bell, AlertCircle } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();

  const photo = user?.photo
    ? `${import.meta.env.VITE_API_URL}/uploads/superadmin/${user.photo}`
    : "https://i.pravatar.cc/40";


  // States
  const [emailOpen, setEmailOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  // Fetch organizations when notice modal opens
  useEffect(() => {
    if (noticeOpen) {
      fetchOrganizations().then((res) => setOrganizations(res));
    }
  }, [noticeOpen]);

  // Toggle organization selection for checkbox
  const toggleOrg = (orgId) => {
    setSelectedOrgs((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    );
  };

  // Send notice
  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMessage || selectedOrgs.length === 0) {
      alert("Title, message, and at least one organization are required");
      return;
    }

    const res = await sendNotice({
      title: noticeTitle,
      message: noticeMessage,
      organizations: selectedOrgs,
    });

    if (res.success) {
      alert("Notice sent successfully to selected organizations");
      setNoticeOpen(false);
      setNoticeTitle("");
      setNoticeMessage("");
      setSelectedOrgs([]);
    } else {
      alert("Failed to send notice: " + (res.error || "Unknown error"));
    }
  };


  // Fetch feedbacks when notification drawer opens
  useEffect(() => {
    if (notifOpen) {
      fetchFeedbacks()
        .then((res) => {
          const adminFeedbacks = res.filter((fb) => fb.senderRole === "Admin");
          setFeedbacks(adminFeedbacks);
        })
        .catch(console.error);
    }
  }, [notifOpen]);

  return (
    <>
      {/* NAVBAR */}
      <div className="flex items-center justify-between w-full px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
        {/* Left Section: Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition" />
            <input
              type="text"
              placeholder="Search organizations, transactions..."
              className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 transition outline-none"
            />
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setNoticeOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
              title="Create Notice"
            >
              <FiFile className="w-5 h-5" />
            </button>
            <button
              onClick={() => setEmailOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition relative"
              title="Messages"
            >
              <EnvelopeIcon className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-slate-50"></span>
            </button>
            <button
              onClick={() => setNotifOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
              title="Notifications"
            >
              <BellIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {/* Profile Popover */}
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-3 pl-2 cursor-pointer group outline-none focus:outline-none border-none bg-transparent">
              <div className="text-right flex flex-col pointer-events-none">
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition truncate max-w-[120px]">
                  {user?.name || user?.full_name || "Super Admin"}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || "SUPERADMIN"}</span>
              </div>
              <div className="relative pointer-events-none">
                <img
                  src={photo}
                  className="object-cover w-10 h-10 rounded-xl ring-2 ring-slate-100 group-hover:ring-indigo-100 transition"
                  alt="profile"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </PopoverButton>

            <PopoverPanel
              transition
              anchor="bottom end"
              className="z-50 mt-3 w-screen max-w-sm transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
            >
              {({ close }) => <SuperAdminProfilePopup onClose={close} />}
            </PopoverPanel>
          </Popover>
        </div>
      </div>

      {/* Notice Modal */}
      <Transition show={noticeOpen}>
        <Dialog
          onClose={() => setNoticeOpen(false)}
          className="relative z-50 shadow-2xl"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild>
                <DialogPanel
                  transition
                  className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:scale-95"
                >
                  <form onSubmit={handleSendNotice} className="p-8">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                             <FiFile size={20} />
                          </div>
                          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">System Notice</DialogTitle>
                       </div>
                       <button type="button" onClick={() => setNoticeOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Notice Title</label>
                        <input
                          type="text"
                          value={noticeTitle}
                          onChange={(e) => setNoticeTitle(e.target.value)}
                          placeholder="Broadcast Heading..."
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Message Content</label>
                        <textarea
                          value={noticeMessage}
                          onChange={(e) => setNoticeMessage(e.target.value)}
                          placeholder="Type your announcement here..."
                          className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Target Organizations</label>
                        <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl max-h-40 overflow-y-auto custom-scrollbar">
                          {organizations.map((org) => (
                            <label key={org.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedOrgs.includes(org.id)}
                                onChange={() => toggleOrg(org.id)}
                                className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition">{org.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition"
                        onClick={() => setNoticeOpen(false)}
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        <Send size={14} /> Send Broadcast
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Email Modal */}
      <Transition show={emailOpen}>
        <Dialog
          onClose={() => setEmailOpen(false)}
          className="relative z-50"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild>
                <DialogPanel
                  transition
                  className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-md data-[closed]:sm:scale-95"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Email sent successfully (Demo)");
                      setEmailOpen(false);
                    }}
                    className="p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                             <Mail size={20} />
                          </div>
                          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Send Email</DialogTitle>
                       </div>
                       <button type="button" onClick={() => setEmailOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Recipient Email</label>
                        <input
                          type="email"
                          required
                          placeholder="receiver@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="Communication Subject..."
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Message body</label>
                        <textarea
                          required
                          placeholder="Write your secure message..."
                          className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition"
                        onClick={() => setEmailOpen(false)}
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        <Send size={14} /> Send Email
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Notification Drawer */}
      <Transition show={notifOpen}>
        <Dialog
          onClose={() => setNotifOpen(false)}
          className="relative z-50"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <TransitionChild>
                  <DialogPanel
                    transition
                    className="pointer-events-auto w-screen max-w-sm transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
                  >
                    <div className="flex h-full flex-col overflow-y-hidden bg-white shadow-2xl rounded-l-[3rem]">
                       <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Bell size={20} />
                             </div>
                             <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Feedbacks</DialogTitle>
                          </div>
                          <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
                       </div>

                       <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                          {feedbacks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                               <AlertCircle size={40} className="mb-4" />
                               <p className="text-xs font-bold uppercase tracking-widest">No feedbacks yet</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {feedbacks.map((fb) => (
                                <div key={fb.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-lg hover:shadow-indigo-50 transition duration-300 group">
                                  <div className="flex flex-col gap-1 mb-2">
                                     <span className="text-sm font-black text-slate-800 tracking-tight">{fb.senderName}</span>
                                     <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest group-hover:text-amber-500 transition">@ {fb.organizationName}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{fb.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>

                       <div className="p-8 border-t border-slate-100">
                          <button
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 transition shadow-lg shadow-slate-200"
                            onClick={() => setNotifOpen(false)}
                          >
                            Close Notifications
                          </button>
                       </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
