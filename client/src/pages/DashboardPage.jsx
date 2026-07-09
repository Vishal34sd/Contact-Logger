import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ContactsProvider } from '../context/ContactsContext';
import { Navbar } from '../components/layout/Navbar';
import { ContactList } from '../components/contacts/ContactList';
import { ContactDetails } from '../components/notes/ContactDetails';

export function DashboardPage() {
  const { isConnected, isLoading, lastSync, refreshStatus } = useAuth();
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  // Redirect if not connected
  useEffect(() => {
    if (!isLoading && !isConnected) {
      navigate('/', { replace: true });
    }
  }, [isConnected, isLoading, navigate]);

  // Poll status while sync is in progress
  useEffect(() => {
    if (lastSync?.status === 'in_progress') {
      pollingRef.current = setInterval(() => {
        refreshStatus();
      }, 3000); // Poll every 3 seconds
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [lastSync?.status, refreshStatus]);

  if (isLoading || !isConnected) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden">
        <ContactsProvider>
          {/* Sidebar */}
          <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 h-full overflow-hidden border-r border-border">
            <ContactList />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 h-full overflow-hidden hidden md:block bg-background">
            <ContactDetails />
          </div>
        </ContactsProvider>
      </main>
    </div>
  );
}
