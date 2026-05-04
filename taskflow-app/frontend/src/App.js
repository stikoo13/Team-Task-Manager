import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Members from "./pages/Members";
import Profile from "./pages/Profile";
import ClientDashboard from "./pages/ClientDashboard";
import { ThemeProvider } from "./context/ThemeContext";

// Helper: read user from localStorage
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
};

// Protected route wrapper
function Protected({ children, roles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin routes */}
          <Route path="/dashboard" element={
            <Protected roles={['admin','member']}>
              <Dashboard />
            </Protected>
          } />
          <Route path="/projects" element={
            <Protected roles={['admin','member']}>
              <Projects />
            </Protected>
          } />
          <Route path="/tasks" element={
            <Protected roles={['admin','member']}>
              <Tasks />
            </Protected>
          } />
          <Route path="/members" element={
            <Protected roles={['admin']}>
              <Members />
            </Protected>
          } />

          {/* ✅ FIX: Profile is its own dedicated route — no overlap with Projects */}
          <Route path="/profile" element={
            <Protected>
              <Profile />
            </Protected>
          } />

          {/* Client route */}
          <Route path="/client" element={
            <Protected roles={['client']}>
              <ClientDashboard />
            </Protected>
          } />

          {/* Redirect root */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function RootRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'client') return <Navigate to="/client" replace />;
  return <Navigate to="/dashboard" replace />;
}