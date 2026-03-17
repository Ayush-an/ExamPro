import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HomeIcon, UserIcon, FolderIcon, ArrowLeftOnRectangleIcon, WalletIcon, TicketIcon } from "@heroicons/react/24/outline";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const menuItems = [
        { name: "Dashboard", to: "/superadmin/dashboard", icon: HomeIcon },
        { name: "Manage", to: "/superadmin/manage", icon: FolderIcon },
        { name: "Profile", to: "/superadmin/profile", icon: UserIcon },
        { name: "Subscription", to: "/superadmin/subscription", icon: WalletIcon },
        { name: "Coupons", to: "/superadmin/coupons", icon: TicketIcon },
        { name: "Organization Data", to: "/superadmin/data", icon: FolderIcon },
    ];


    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
        month: "long",
    });
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const calendarDays = [
        ...Array(firstDayIndex).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];

    // Month change handlers
    const prevMonth = () => {
        setCurrentMonth((m) => {
            if (m === 0) {
                setCurrentYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const nextMonth = () => {
        setCurrentMonth((m) => {
            if (m === 11) {
                setCurrentYear((y) => y + 1);
                return 0;
            }
            return m + 1;
        });
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="fixed flex flex-col w-64 h-screen bg-white border-r border-slate-100 shadow-sm">

            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-8">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-indigo-600 rounded-lg">2B</div>
                <span className="text-xl font-bold tracking-tight text-slate-800">2BRAINR</span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink key={item.name} to={item.to} className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                            ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                            : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                        }`
                    }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Mini Calendar */}
            <div className="px-4 mt-4">
                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition">
                            <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            {monthName} {currentYear}
                        </h4>
                        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition">
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mt-2">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                            <div key={`${d}-${idx}`} className="text-[10px] font-bold text-slate-300 text-center">{d}</div>
                        ))}
                        {calendarDays.map((day, i) => {
                            if (day === null) return <div key={i}></div>;
                            const isToday =
                                day === today.getDate() &&
                                currentMonth === today.getMonth() &&
                                currentYear === today.getFullYear();

                            return (
                                <div key={i} className={`text-[10px] p-1 rounded-md text-center transition ${isToday
                                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100"
                                    : "text-slate-500 hover:bg-white hover:text-indigo-600 cursor-default"
                                    }`}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Logout */}
            <div className="px-4 pb-8 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 rounded-xl hover:bg-red-50 hover:text-red-600 group"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    Logout
                </button>
            </div>
        </div>
    );
}