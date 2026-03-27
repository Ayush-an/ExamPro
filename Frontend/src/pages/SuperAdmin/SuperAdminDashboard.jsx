import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Subscriptions from './pages/Subscriptions';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Coupons from './pages/Coupons';

const SuperAdminDashboard = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 ml-64 overflow-y-auto">
                {/* Top Navbar */}
                <Navbar />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="manage" element={<Organizations />} />
                        <Route path="subscription" element={<Subscriptions />} />
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="organizations" element={<Organizations />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="coupons" element={<Coupons />} />
                        <Route path="*" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
