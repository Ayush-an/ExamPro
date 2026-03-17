//AdminDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { User, Bell, LogOut, Menu, ChevronDown, LayoutDashboard, Users, GraduationCap, FileText, Send, MessageSquare, Plus, Search, CheckCircle2 } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats, fetchMyNotices, fetchGroups, fetchParticipants, fetchExams, fetchSuperUsersByOrg } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

import CreateSuperUser from "./components/CreateSuperUser.jsx";
import CreateGroup from "./groups/CreateGroup.jsx";
import CreateParticipant from "./participant/CreateParticipant.jsx";
import CreateExam from "./exam/CreateExam.jsx";
import CreateQuestion from "./question/CreateQuestion.jsx";

import ManageGroups from "./groups/ManageGroups.jsx";
import RemoveGroup from "./groups/RemoveGroup.jsx";

import ManageParticipants from "./participant/ManageParticipant.jsx";
import RemoveParticipant from "./participant/RemoveParticipant.jsx";
import StagingParticipant from "./participant/StagingParticipant.jsx";
import ActiveParticipant from "./participant/ActiveParticipant.jsx";
import ParticipantSummary from "./participant/ParticipantSummary.jsx";
import ParticipantHistory from "./participant/ParticipantHistory.jsx";

import ManageExams from "./exam/ManageExam.jsx";
import RemoveExam from "./exam/RemoveExam.jsx";

import ManageQuestion from "./question/ManageQuestion";
import StagingQuestion from "./question/StagingQuestion.jsx";
import QuestionSummary from "./question/QuestionSummary.jsx";
import QuestionHistory from "./question/QuestionHistory.jsx";
import SendNotice from "./components/SendNotice.jsx";
import SendFeedback from "./components/SendFeedback.jsx";
import StatsListPopup from "./common/StatsListPopup.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [popupComponent, setPopupComponent] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalParticipants: 0,
    totalSuperUsers: 0,
    totalExams: 0,
    ActiveExams: 0,
    InactiveExams: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statsData = await fetchDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error("Stats Error:", err);
      }
    };
    loadDashboardData();
  }, [refreshKey]);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await fetchMyNotices();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notices:", err);
      }
    };
    loadNotices();
  }, []);

  const openPopup = (component) => setPopupComponent(component);
  const closePopup = () => setPopupComponent(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, onClick: () => setActiveComponent(null) },
    {
      name: "Groups", icon: Users,
      children: ["Create Group", "Manage Group", "Remove Group"],
      onClick: (action) => {
        if (action === "Create Group") openPopup(<CreateGroup onSuccess={() => setRefreshKey(k => k + 1)} />);
        else if (action === "Manage Group") setActiveComponent(<ManageGroups />);
        else if (action === "Remove Group") setActiveComponent(<RemoveGroup />);
      },
    },
    {
      name: "Participant", icon: GraduationCap,
      children: ["Create Participant", "Active Participant", "Manage Participant", "Remove Participant", "Staging Participant", "Upload Summary", "Participant History"],
      onClick: (action) => {
        if (action === "Create Participant") openPopup(<CreateParticipant onSuccess={() => setRefreshKey(k => k + 1)} />);
        else if (action === "Active Participant") setActiveComponent(<ActiveParticipant />);
        else if (action === "Manage Participant") setActiveComponent(<ManageParticipants />);
        else if (action === "Remove Participant") setActiveComponent(<RemoveParticipant />);
        else if (action === "Staging Participant") setActiveComponent(<StagingParticipant />);
        else if (action === "Upload Summary") setActiveComponent(<ParticipantSummary />);
        else if (action === "Participant History") setActiveComponent(<ParticipantHistory />);
      },
    },
    {
      name: "Exams", icon: FileText,
      children: ["Create Exam", "Manage Exam", "Remove Exam"],
      onClick: (action) => {
        if (action === "Create Exam") openPopup(<CreateExam onSuccess={() => setRefreshKey(k => k + 1)} />);
        else if (action === "Manage Exam") setActiveComponent(<ManageExams />);
        else if (action === "Remove Exam") setActiveComponent(<RemoveExam />);
      },
    },
    {
      name: "Questions", icon: Plus,
      children: ["Create Questions", "Manage Questions", "Staging Questions", "Question Summary", "Question History"],
      onClick: (action) => {
        if (action === "Create Questions") openPopup(<CreateQuestion onSuccess={() => setRefreshKey(k => k + 1)} />);
        else if (action === "Manage Questions") setActiveComponent(<ManageQuestion />);
        else if (action === "Staging Questions") setActiveComponent(<StagingQuestion />);
        else if (action === "Question Summary") setActiveComponent(<QuestionSummary />);
        else if (action === "Question History") setActiveComponent(<QuestionHistory />);
      },
    },
    {
      name: "Super User", icon: User,
      children: ["Create Super User"],
      onClick: (action) => {
        if (action === "Create Super User") openPopup(<CreateSuperUser onSuccess={() => setRefreshKey(k => k + 1)} />);
      },
    },
    { name: "Notice", icon: Send, children: ["Send Notice"], onClick: (action) => action === "Send Notice" && openPopup(<SendNotice />) },
    { name: "Feedback", icon: MessageSquare, children: ["Send Feedback"], onClick: (action) => action === "Send Feedback" && openPopup(<SendFeedback />) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">

        {/* TOP NAVBAR */}
        <div className="flex items-center justify-between px-8 py-3">

          {/* Logo */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => setActiveComponent(null)}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold transition group-hover:rotate-12">
              2B
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-800">
              2BRAINR
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* Notification */}
            <button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition">
              <Bell size={18} />

              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} />
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            {/* Profile */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                  {user?.name || "Admin"}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Organization Admin
                </span>
              </div>

              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </div>

        {/* SECOND NAVBAR (MENU) */}
        <div className="border-t border-slate-100 bg-slate-50">

          <nav className="flex items-center gap-1 px-8 py-2">

            {navItems.map((item) => (
              <div key={item.name} className="relative group">

                <button
                  onClick={() => !item.children && item.onClick()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                >
                  <item.icon size={18} />

                  {item.name}

                  {item.children && (
                    <ChevronDown
                      size={14}
                      className="group-hover:rotate-180 transition duration-300"
                    />
                  )}
                </button>

                {item.children && (
                  <div className="absolute top-full left-0 w-56 pt-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition">

                    <div className="bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden">
                      <div className="py-2">
                        {item.children.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => item.onClick(sub)}
                            className="w-full text-left px-5 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            ))}

          </nav>

        </div>

      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto animate-in fade-in duration-500">
        {activeComponent ? (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[200px] -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <button onClick={() => setActiveComponent(null)} className="mb-8 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">← Back to Dashboard</button>
              {React.isValidElement(activeComponent) ? React.cloneElement(activeComponent, { onClose: () => setActiveComponent(null) }) : activeComponent}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Participants", value: stats.totalParticipants, color: "indigo", icon: GraduationCap },
                { label: "Total Groups", value: stats.totalGroups, color: "slate", icon: Users },
                { label: "Total Exams", value: stats.totalExams, color: "slate", icon: FileText },
                { label: "Active Exams", value: stats.ActiveExams, color: "emerald", icon: CheckCircle2 },
              ].map((stat, idx) => (
                <div key={idx} className="group relative p-8 bg-white border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => stat.label.includes("Participant") ? setActiveComponent(<ManageParticipants />) : null}>
                  <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <h1 className={`text-4xl font-extrabold ${stat.color === 'emerald' ? 'text-emerald-600' : 'text-slate-800'} group-hover:text-indigo-600 transition tracking-tighter`}>{(stat.value ?? 0).toLocaleString()}</h1>
                  </div>
                  <div className={`absolute top-8 right-8 w-12 h-12 ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition duration-300`}>
                    {stat.icon && <stat.icon size={24} />}
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 scale-0 group-hover:scale-100"></div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-[40px] p-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Performance Overview</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Growth</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Monthly</span>
                  </div>
                </div>
                <div className="h-[350px]">
                  <Bar
                    data={{
                      labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"],
                      datasets: [{
                        label: "Participants",
                        data: [12, 19, 13, 15, 22, 30, 25, 35],
                        backgroundColor: "#4f46e5",
                        borderRadius: 12,
                        hoverBackgroundColor: "#4338ca",
                      }]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { grid: { color: "#f8fafc", drawBorder: false }, ticks: { font: { weight: 'bold', size: 10 }, color: "#94a3b8" } },
                        x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: "#94a3b8" } }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-indigo-100">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600 rounded-full opacity-20 blur-3xl group-hover:scale-125 transition duration-700"></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Administrative Console</span>
                  <h2 className="text-3xl font-extrabold mt-4 tracking-tight leading-tight">Quick Action Center</h2>
                  <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed">Systematically provision users and groups from a unified interface.</p>
                </div>
                <div className="space-y-3 relative z-10 mt-12">
                  <button onClick={() => openPopup(<CreateParticipant onSuccess={() => setRefreshKey(k => k + 1)} />)} className="w-full flex items-center justify-between p-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all font-bold text-sm">Create New Participant <Plus size={18} /></button>
                  <button onClick={() => openPopup(<CreateGroup onSuccess={() => setRefreshKey(k => k + 1)} />)} className="w-full flex items-center justify-between p-5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl border border-transparent shadow-xl shadow-indigo-900/50 transition-all font-bold text-sm">Provision New Group <Plus size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Popup Backdrop */}
      <Transition show={!!popupComponent} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={closePopup}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[40px] bg-white p-12 text-left align-middle shadow-2xl transition-all border border-slate-50 relative">
                  <button onClick={closePopup} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">✖</button>
                  <div className="mt-2">
                    {React.isValidElement(popupComponent) ? React.cloneElement(popupComponent, { onClose: closePopup, onSuccess: () => { setRefreshKey(k => k + 1); closePopup(); } }) : popupComponent}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminDashboard;