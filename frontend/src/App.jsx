import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import NoticesFeed from './pages/NoticesFeed';
import CreateNotice from './pages/CreateNotice';
import Profile from './pages/Profile';
import ManageUsers from './pages/ManageUsers';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center dark:text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'faculty') return <Navigate to="/faculty" />;
    return <Navigate to="/student" />;
  }
  
  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'faculty') return <Navigate to="/faculty" />;
  return <Navigate to="/student" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<RootRedirect />} />
        
        <Route path="admin" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="faculty" element={<PrivateRoute allowedRoles={['faculty']}><FacultyDashboard /></PrivateRoute>} />
        <Route path="student" element={<PrivateRoute allowedRoles={['student']}><StudentDashboard /></PrivateRoute>} />
        
        <Route path="notices" element={<NoticesFeed />} />
        <Route path="create-notice" element={<PrivateRoute allowedRoles={['admin', 'faculty']}><CreateNotice /></PrivateRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="manage-users" element={<PrivateRoute allowedRoles={['admin']}><ManageUsers /></PrivateRoute>} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
          }} />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
