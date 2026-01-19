import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SystemSettingsProvider } from './contexts/SystemSettingsContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientForm from './pages/PatientForm';
import PatientDetails from './pages/PatientDetails';
import VitalsForm from './pages/VitalsForm';
import VitalsHistory from './pages/VitalsHistory';
import VisitForm from './pages/VisitForm';
import VisitsHistory from './pages/VisitsHistory';
import LaboratoryForm from './pages/LaboratoryForm';
import LaboratoryHistory from './pages/LaboratoryHistory';
import PatientDocuments from './pages/PatientDocuments';
import MedicalReport from './pages/MedicalReport';
import ActivityLog from './pages/ActivityLog';
import UsersManagement from './pages/UsersManagement';
import LaboratoryTestsManagement from './pages/LaboratoryTestsManagement';
import SystemSettings from './pages/SystemSettings';
import Layout from './components/Layout/Layout';
import TrialLock from './components/TrialLock/TrialLock';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const [trialLocked, setTrialLocked] = React.useState(false);
  const [trialLoading, setTrialLoading] = React.useState(true);

  React.useEffect(() => {
    // Check trial status
    if (user) {
      api.get('/auth/verify')
        .then(response => {
          if (response.data.trial?.locked) {
            setTrialLocked(true);
          }
        })
        .catch(error => {
          if (error.response?.status === 403 && error.response?.data?.locked) {
            setTrialLocked(true);
          }
        })
        .finally(() => setTrialLoading(false));
    } else {
      setTrialLoading(false);
    }
  }, [user]);
  
  if (loading || trialLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (trialLocked) {
    return <TrialLock />;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/new" element={<PatientForm />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        <Route path="patients/:id/edit" element={<PatientForm />} />
        <Route path="patients/:id/vitals" element={<VitalsForm />} />
        <Route path="patients/:id/vitals/history" element={<VitalsHistory />} />
        <Route path="patients/:id/visits" element={<VisitForm />} />
        <Route path="patients/:id/visits/history" element={<VisitsHistory />} />
        <Route path="patients/:id/laboratory" element={<LaboratoryForm />} />
        <Route path="patients/:id/laboratory/history" element={<LaboratoryHistory />} />
        <Route path="patients/:id/documents" element={<PatientDocuments />} />
        <Route path="patients/:id/report" element={<MedicalReport />} />
        <Route path="activity-log" element={<ActivityLog />} />
        <Route path="admin/users" element={<UsersManagement />} />
        <Route path="admin/laboratory-tests" element={<LaboratoryTestsManagement />} />
        <Route path="admin/settings" element={<SystemSettings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SystemSettingsProvider>
    </AuthProvider>
  );
}

export default App;
