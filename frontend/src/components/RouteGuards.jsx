import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Feedback';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;
  return children;
}

export function RecruiterRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;
  if (user.role !== 'recruiter' && user.role !== 'admin') {
    return <Navigate to="/tableau-de-bord" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;
  if (user.role !== 'admin') {
    return <Navigate to="/tableau-de-bord" replace />;
  }
  return children;
}
