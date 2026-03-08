import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Pipeline } from './pages/Pipeline';
import { Analytics } from './pages/Analytics';
import { Accounts } from './pages/Accounts';
import { DealDetail } from './pages/DealDetail';
import { LeadDetail } from './pages/LeadDetail';
import { Auth } from './pages/Auth';
import { ToastContainer } from './components/ui/Toast';
import { useAppStore } from './stores/app-store';
import { useAuthStore } from './stores/auth-store';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentPage } = useAppStore();
  const { user, isDemo, initialized, loading, initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    if (path === 'deals') {
      setCurrentPage('deal-detail');
    } else if (path === 'lead') {
      setCurrentPage('lead-detail');
    } else {
      setCurrentPage(path as any);
    }
  }, [location.pathname, setCurrentPage]);

  // Show loading spinner while initializing
  if (!initialized || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-textSecondary text-sm">Loading Lumina...</p>
        </div>
      </div>
    );
  }

  // Not authenticated and not in demo mode
  if (!user && !isDemo) {
    return (
      <>
        <Auth />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Layout navigate={navigate}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/deals/:dealId" element={<DealDetail />} />
          <Route path="/lead/:leadId" element={<LeadDetail />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
