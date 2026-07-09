import { createContext, useContext, useState, useCallback } from 'react';
import { contactsApi } from '../api/contacts';
import { useAuth } from './AuthContext';

const ContactsContext = createContext();

export function ContactsProvider({ children }) {
  const { isConnected } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeContactId, setActiveContactId] = useState(null);
  const [activeContact, setActiveContact] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchContacts = useCallback(async (params = { page: 1, limit: 20 }) => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await contactsApi.getContacts(params);
      setContacts(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchContactDetails = useCallback(async (id) => {
    if (!id) return;

    setIsLoadingDetails(true);
    setActiveContactId(id);

    try {
      const response = await contactsApi.getContactById(id);
      setActiveContact(response.data);
    } catch (err) {

      setActiveContact(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const selectContact = (id) => {
    if (id === activeContactId) return;
    fetchContactDetails(id);
  };

  const clearSelection = () => {
    setActiveContactId(null);
    setActiveContact(null);
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        meta,
        isLoading,
        error,
        activeContactId,
        activeContact,
        isLoadingDetails,
        fetchContacts,
        selectContact,
        clearSelection
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
