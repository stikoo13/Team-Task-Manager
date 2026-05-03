import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login           from './pages/Login';
import Signup          from './pages/Signup';
import Dashboard       from './pages/Dashboard';
import Projects        from './pages/Projects';
import Tasks           from './pages/Tasks';
import Profile         from './pages/Profile';
import Members         from './pages/Members';
import ClientDashboard from './pages/ClientDashboard';

// Redirect to appropriate home based on role
const RoleRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'client' ? '/client' : '/dashboard'} replace />;
  }
  return children;
};

// Any authenticated user (used for profile)
const PrivateRoute = ({ children }) =>
  localStorage.getItem('token') ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Navigate to="/login" replace />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/signup"    element={<Signup />} />

          <Route path="/dashboard" element={<RoleRoute roles={['admin','member']}><Dashboard /></RoleRoute>} />
          <Route path="/projects"  element={<RoleRoute roles={['admin','member']}><Projects /></RoleRoute>} />
          <Route path="/tasks"     element={<RoleRoute roles={['admin','member']}><Tasks /></RoleRoute>} />
          <Route path="/members"   element={<RoleRoute roles={['admin']}><Members /></RoleRoute>} />
          <Route path="/client"    element={<RoleRoute roles={['client']}><ClientDashboard /></RoleRoute>} />
          <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;