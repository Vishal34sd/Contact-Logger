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

  useEffect(() => {
    if (!isLoading && !isConnected) {
      navigate('/', { replace: true });
    }
  }, [isConnected, isLoading, navigate]);

  useEffect(() => {
    if (lastSync?.status === 'in_progress') {
      pollingRef.current = setInterval(() => {
        refreshStatus();
      }, 3000); 
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
    return null; 
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden">
        <ContactsProvider>
          {}
          <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 h-full overflow-hidden border-r border-border">
            <ContactList />
          </div>

          {}
          <div className="flex-1 h-full overflow-hidden hidden md:block bg-background">
            <ContactDetails />
          </div>
        </ContactsProvider>
      </main>
    </div>
  );
}
