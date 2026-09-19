import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import HomeFeed from './pages/HomeFeed';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';

// 1. Create an inner component to handle the routing and layout
function AppContent() {
  const location = useLocation(); // This will trigger a re-render on route change
  const isAuthenticated = () => !!localStorage.getItem('access_token');

  // 2. Hide Navbar on Login AND Register pages
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/home" element={<HomeFeed />} />
        <Route path="/me" element={<MyProfile />} />
        <Route path="/profile/:id" element={<UserProfile />} />

        {/* Route d l-Bdaya '/' */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />}
        />

        {/* Guest Routes */}
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

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all wildcard */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}

// 3. Keep App as the Router provider
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}