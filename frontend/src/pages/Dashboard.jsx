import { useAuth } from '../context/AuthContext';
import CandidateDashboard from './CandidateDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  return user.role === 'recruiter' ? <RecruiterDashboard /> : <CandidateDashboard />;
}
