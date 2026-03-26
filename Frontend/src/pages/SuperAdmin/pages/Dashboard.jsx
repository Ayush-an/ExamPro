import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import CreateAdmin from "../components/CreateAdmin";
import TotalAdmins from "../components/TotalAdmins";
import TotalOrganizations from "../components/TotalOrganizations";
import GlobalDetailsPopup from "../components/GlobalDetailsPopup";
import api from "../../../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalOrganizations: 0,
    totalParticipants: 0,
    totalSuperUsers: 0,
    totalQuestions: 0,
    totalNotices: 0,
    totalAssignments: 0
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [openAdmins, setOpenAdmins] = useState(false);
  const [openOrgs, setOpenOrgs] = useState(false);
  const [globalPopup, setGlobalPopup] = useState({ open: false, type: "" });

  const fetchStats = async () => {
    try {
      const res = await api.get('/superadmin/dashboard');
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // ----- BAR CHART DATA -----
  const barData = {
    labels: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"],
    datasets: [
      {
        label: "Organizations",
        backgroundColor: "#6366f1",
        borderRadius: 8,
        data: [40, 55, 30, 60, 45, 70, 50, 40]
      },
      {
        label: "Subscriptions",
        backgroundColor: "#94a3b8",
        borderRadius: 8,
        data: [80, 60, 40, 55, 75, 80, 60, 70]
      }
    ]
  };

  // ----- DONUT CHART DATA -----
  const donutData = {
    labels: ["Basic", "Standard", "Premium"],
    datasets: [
      {
        data: [30, 30, 40],
        backgroundColor: ["#6366f1", "#0ea5e9", "#ef4444"],
        hoverOffset: 10,
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* GRID TOP CARDS */}
      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Total Admins */}
        <StatCard 
          label="Total Active Admins" 
          value={stats.totalAdmins} 
          onClick={() => setOpenAdmins(true)}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />} 
        />

        {/* Total Organizations */}
        <StatCard 
          label="Registered Organizations" 
          value={stats.totalOrganizations} 
          onClick={() => setOpenOrgs(true)}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />} 
        />

        {/* Total Participants */}
        <StatCard 
          label="Total Participants" 
          value={stats.totalParticipants} 
          color="emerald"
          onClick={() => setGlobalPopup({ open: true, type: "Participants" })}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />} 
        />

        {/* Total Super Users */}
        <StatCard 
          label="Total Super Users" 
          value={stats.totalSuperUsers} 
          color="amber"
          onClick={() => setGlobalPopup({ open: true, type: "Super Users" })}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />} 
        />

        {/* Total Questions */}
        <StatCard 
          label="Total Questions" 
          value={stats.totalQuestions} 
          color="violet"
          onClick={() => setGlobalPopup({ open: true, type: "Questions" })}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} 
        />

        {/* Total Notices */}
        <StatCard 
          label="Total Notices" 
          value={stats.totalNotices} 
          color="rose"
          onClick={() => setGlobalPopup({ open: true, type: "Notices" })}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />} 
        />

        {/* Total Assignments */}
        <StatCard 
          label="Total Assignments" 
          value={stats.totalAssignments} 
          color="sky"
          onClick={() => setGlobalPopup({ open: true, type: "Assignments" })}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />} 
        />

        {/* Action Card */}
        <button
          onClick={() => setOpenCreate(true)}
          className="group relative p-8 bg-slate-900 border-none shadow-lg shadow-slate-200 rounded-3xl hover:bg-black transition-all duration-300 text-left overflow-hidden min-h-[140px]"
        >
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Actions</span>
            <h1 className="text-3xl font-extrabold text-white group-hover:translate-x-2 transition tracking-tighter">
              Create Admin
            </h1>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-600 rounded-full opacity-20 group-hover:scale-150 transition duration-700"></div>
          <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:rotate-12 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* BAR CHART CARD */}
        <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Growth Overview</h2>
            <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Stats</div>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { border: { display: false }, grid: { display: true, color: '#f8fafc' } },
                  x: { border: { display: false }, grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* DONUT CHART CARD */}
        <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Subscription Types</h2>
            <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Share</div>
          </div>
          <div className="h-[300px] flex items-center justify-center relative">
            <div className="w-56 h-56">
              <Doughnut
                data={donutData}
                options={{
                  maintainAspectRatio: false,
                  cutout: '75%',
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
            {/* Legend inside Donut? No, below for clarity */}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            {donutData.labels.map((label, idx) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutData.datasets[0].backgroundColor[idx] }}></span>
                <span className="text-xs font-bold text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateAdmin open={openCreate} onClose={() => setOpenCreate(false)} onCreated={fetchStats} />
      <TotalAdmins open={openAdmins} onClose={() => setOpenAdmins(false)} />
      <TotalOrganizations open={openOrgs} onClose={() => setOpenOrgs(false)} />
      <GlobalDetailsPopup 
        type={globalPopup.type} 
        open={globalPopup.open} 
        onClose={() => setGlobalPopup({ ...globalPopup, open: false })} 
      />
    </div>
  );
}

const StatCard = ({ label, value, onClick, icon, color = "indigo" }) => {
  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    violet: "text-violet-600 bg-violet-50",
    rose: "text-rose-600 bg-rose-50",
    sky: "text-sky-600 bg-sky-50",
  };

  const [textColor, bgColor] = colorMap[color].split(" ");

  return (
    <div 
      className={`group relative p-8 bg-white border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <h1 className={`text-4xl font-extrabold text-slate-800 group-hover:${textColor} transition tracking-tighter`}>
          {(value ?? 0).toLocaleString()}
        </h1>
      </div>
      <div className={`absolute top-8 right-8 w-12 h-12 ${bgColor} ${textColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 scale-0 group-hover:scale-100"></div>
    </div>
  );
};
