import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import HomeFeed from './pages/HomeFeed';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Navbar from './components/Navbar';


export default function App() {
  const isAuthenticated = () => !!localStorage.getItem('access_token');
  // Hide Navbar on Login page
  const hideNavbar = location.pathname === '/login';

  return (
    <Router>
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

        {/* Guest Routes (Accessible ghir ila knti MA-connectich) */}
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

        {/* Protected Routes (Accessible ghir ila knti M-connecti) */}
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
    </Router>
  );
}