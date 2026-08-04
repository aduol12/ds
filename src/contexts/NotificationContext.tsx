import { createContext, useContext, useMemo, useState } from 'react';

type NotificationContextType = {
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<string[]>([]);

  const value = useMemo(() => ({
    notifications,
    addNotification: (message: string) => setNotifications((prev) => [...prev, message]),
    clearNotifications: () => setNotifications([]),
  }), [notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
