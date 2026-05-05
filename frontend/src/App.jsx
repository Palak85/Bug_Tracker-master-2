import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page — always accessible */}
      <Route path="/" element={<Home />} />

      {/* Auth pages — redirect to dashboard if already logged in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
