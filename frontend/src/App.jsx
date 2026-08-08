import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, RecruiterRoute, AdminRoute } from './components/RouteGuards';

import Home from './pages/Home';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import CompaniesList from './pages/CompaniesList';
import CompanyDetail from './pages/CompanyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import MyApplications from './pages/MyApplications';
import MyCompanies from './pages/MyCompanies';
import CompanyForm from './pages/CompanyForm';
import PostJob from './pages/PostJob';
import EditJob from './pages/EditJob';
import JobApplications from './pages/JobApplications';
import CandidatePublicProfile from './pages/CandidatePublicProfile';
import Messaging from './pages/Messaging';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/offres" element={<JobsList />} />
          <Route path="/offres/:slug" element={<JobDetail />} />
          <Route path="/entreprises" element={<CompaniesList />} />
          <Route path="/entreprises/:slug" element={<CompanyDetail />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
          <Route path="/candidats/:id" element={<CandidatePublicProfile />} />

          {/* Authentifié */}
          <Route path="/tableau-de-bord" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/favoris" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/mes-candidatures" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/messagerie" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
          <Route path="/messagerie/:convId" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />

          {/* Admin uniquement */}
          <Route path="/admin/utilisateurs" element={<AdminRoute><AdminUsers /></AdminRoute>} />

          {/* Recruteur */}
          <Route path="/recruteur/entreprises" element={<RecruiterRoute><MyCompanies /></RecruiterRoute>} />
          <Route path="/recruteur/entreprises/nouvelle" element={<RecruiterRoute><CompanyForm /></RecruiterRoute>} />
          <Route path="/recruteur/entreprises/:slug/modifier" element={<RecruiterRoute><CompanyForm /></RecruiterRoute>} />
          <Route path="/recruteur/offres/nouvelle" element={<RecruiterRoute><PostJob /></RecruiterRoute>} />
          <Route path="/recruteur/offres/:jobId/modifier" element={<RecruiterRoute><EditJob /></RecruiterRoute>} />
          <Route path="/recruteur/offres/:jobId/candidatures" element={<RecruiterRoute><JobApplications /></RecruiterRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
