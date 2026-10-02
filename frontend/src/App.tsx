import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';
import { AppLayout } from './layouts/AppLayout';
import { ResidentPage } from './pages/ResidentPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';

export const MainContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getInitialView = (): 'resident' | 'admin' => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return user?.role === 'admin' ? 'admin' : 'resident';
    }
    return 'resident';
  };

  const [currentView, setCurrentView] = useState<'resident' | 'admin'>(getInitialView);

  const handleViewChange = (view: 'resident' | 'admin') => {
    // Strict Route Guard: Residents can NEVER switch to admin view
    if (view === 'admin' && user?.role !== 'admin') {
      setCurrentView('resident');
      if (typeof window !== 'undefined') {
        window.location.hash = 'resident';
      }
      return;
    }

    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
    }
  };

  // Listen to hash changes and guard
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        if (user?.role === 'admin') {
          setCurrentView('admin');
        } else {
          // Deny and force back to resident
          setCurrentView('resident');
          window.location.hash = 'resident';
        }
      } else if (window.location.hash === '#resident') {
        setCurrentView('resident');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user?.role]);

  // Synchronize initial login role
  useEffect(() => {
    if (user?.role === 'admin') {
      // Default admin to admin dashboard
      setCurrentView('admin');
      if (typeof window !== 'undefined') {
        window.location.hash = 'admin';
      }
    } else {
      // Residents always start on resident portal
      setCurrentView('resident');
      if (typeof window !== 'undefined') {
        window.location.hash = 'resident';
      }
    }
  }, [user?.role]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout currentView={currentView} onViewChange={handleViewChange}>
      {currentView === 'resident' ? (
        <ResidentPage />
      ) : user?.role === 'admin' ? (
        <AdminDashboardPage onNavigateToResident={() => handleViewChange('resident')} />
      ) : (
        <ResidentPage />
      )}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </AuthProvider>
  );
}
