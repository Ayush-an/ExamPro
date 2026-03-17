import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import CreateAdmin from "../components/CreateAdmin";
import TotalAdmins from "../components/TotalAdmins";
import TotalOrganizations from "../components/TotalOrganizations";
import api from "../../../utils/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({ totalAdmins: 0, totalOrganizations: 0 });
  const [openCreate, setOpenCreate] = useState(false);
  const [openAdmins, setOpenAdmins] = useState(false);
  const [openOrgs, setOpenOrgs] = useState(false);

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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <div className="group relative p-8 bg-white border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active Admins</span>
            <h1 className="text-4xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition tracking-tighter cursor-pointer" onClick={() => setOpenAdmins(true)}>
              {(stats.totalAdmins ?? 0).toLocaleString()}
            </h1>
          </div>
          <div className="absolute top-8 right-8 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative p-8 bg-white border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Organizations</span>
            <h1 className="text-4xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition tracking-tighter cursor-pointer" onClick={() => setOpenOrgs(true)}>
              {(stats.totalOrganizations ?? 0).toLocaleString()}
            </h1>
          </div>
          <div className="absolute top-8 right-8 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Card 3: Action Card */}
        <button
          onClick={() => setOpenCreate(true)}
          className="group relative p-8 bg-slate-900 border-none shadow-lg shadow-slate-200 rounded-3xl hover:bg-black transition-all duration-300 text-left overflow-hidden"
        >
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Actions</span>
            <h1 className="text-4xl font-extrabold text-white group-hover:translate-x-2 transition tracking-tighter">
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
    </div>
  );
}
