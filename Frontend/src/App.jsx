import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/LandingPage/Landing';
import Login from './pages/LandingPage/Login';
import Subscription from './pages/LandingPage/components/Subscription';
import Registration from './pages/LandingPage/components/Registration';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ParticipantDashboard from './pages/Participant/ParticipantDashboard';
import SuperUserDashboard from './pages/SuperUser/superuser/SuperuserDashboard';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/registration" element={<Registration />} />

          <Route path="/superadmin/*" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/participant/*" element={
            <ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN', 'SUPERADMIN']}>
              <ParticipantDashboard />
            </ProtectedRoute>
          } />

          <Route path="/superuser/*" element={
            <ProtectedRoute allowedRoles={['SUPERUSER']}>
              <SuperUserDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
