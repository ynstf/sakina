import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import HomeFeed from './pages/HomeFeed';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';

// 1. Layout for authenticated routes (Navbar + Protected wrapper in one place)
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Outlet /> {/* This renders whatever nested route is active */}
    </ProtectedRoute>
  );
}

function AppContent() {
  const isAuthenticated = () => !!localStorage.getItem('access_token');

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated() ? "/home" : "/login"} replace />}
      />

      {/* Guest / Public Routes (No Navbar) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* All Protected Routes wrapped together with Navbar */}
      <Route element={<ProtectedLayout />}>
        <Route path="/home" element={<HomeFeed />} />
        <Route path="/me" element={<MyProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch-all wildcard redirect */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated() ? "/home" : "/login"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}