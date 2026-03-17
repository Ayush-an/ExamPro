import { BellIcon, EnvelopeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FiFile } from "react-icons/fi";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { fetchFeedbacks, sendNotice, fetchOrganizations } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

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

          {/* Profile */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="text-right flex flex-col">
              <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition truncate max-w-[120px]">
                {user?.name || user?.full_name || "Super Admin"}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || "SUPERADMIN"}</span>
            </div>
            <div className="relative">
              <img
                src={photo}
                className="object-cover w-10 h-10 rounded-xl ring-2 ring-slate-100 group-hover:ring-indigo-100 transition"
                alt="profile"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      <Transition show={noticeOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={() => setNoticeOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/30" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="scale-90 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transform transition ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-90 opacity-0"
          >
            <div className="relative w-full max-w-lg p-6 bg-white shadow-lg rounded-xl">
              <h2 className="mb-4 text-lg font-semibold">Create Notice</h2>

              <form className="space-y-4" onSubmit={handleSendNotice}>
                <div>
                  <label className="block mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Message</label>
                  <textarea
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    className="w-full h-24 px-3 py-2 border rounded-md outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Send to Organizations</label>
                  <div className="flex flex-col p-2 overflow-y-auto border rounded-md max-h-40">
                    {organizations.map((org) => (
                      <label key={org.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedOrgs.includes(org.id)}
                          onChange={() => toggleOrg(org.id)}
                        />
                        {org.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 rounded-md"
                    onClick={() => setNoticeOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Email Modal */}
      <Transition show={emailOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClose={() => setEmailOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/30" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="scale-90 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transform transition ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-90 opacity-0"
          >
            <div className="relative w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
              <h2 className="mb-4 text-lg font-semibold">Send Email</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Email sent successfully (Demo)");
                  setEmailOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block mb-1 text-sm font-medium">To</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border rounded-md outline-none"
                    placeholder="receiver@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Subject</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md outline-none"
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Message</label>
                  <textarea
                    required
                    className="w-full h-24 px-3 py-2 border rounded-md outline-none"
                    placeholder="Type your message..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
                    onClick={() => setEmailOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* Notification Drawer */}
      <Transition show={notifOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-hidden"
          onClose={() => setNotifOpen(false)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute inset-0 bg-black/30" />
            </Transition.Child>

            <div className="absolute inset-y-0 right-0 flex w-screen max-w-sm">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-full p-6 bg-white shadow-xl">
                  <h2 className="mb-4 text-lg font-semibold">Admin Feedbacks</h2>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {feedbacks.length === 0 ? (
                      <div className="text-gray-500">No feedbacks</div>
                    ) : (
                      feedbacks.map((fb) => (
                        <div key={fb.id} className="p-3 bg-gray-100 rounded-md">
                          <div className="text-sm font-semibold">{fb.senderName}</div>
                          <div className="mb-1 text-xs text-gray-500">{fb.organizationName}</div>
                          <div className="text-sm">{fb.message}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    className="mt-4 text-blue-600"
                    onClick={() => setNotifOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
