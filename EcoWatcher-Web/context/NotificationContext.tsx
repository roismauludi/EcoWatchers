import React, { createContext, useContext, useState, useEffect } from "react";

interface NotificationData {
  unverifiedUsers: number;
  unverifiedPoints: number;
}

interface NotificationContextType {
  notifications: NotificationData;
  refreshNotifications: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData>({
    unverifiedUsers: 0,
    unverifiedPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch unverified users count
      const usersResponse = await fetch("/api/pengguna/getuser");
      const usersData = await usersResponse.json();

      let unverifiedUsers = 0;
      if (usersData.success) {
        unverifiedUsers = usersData.data.filter(
          (user: any) =>
            user.level === "penyumbang" && user.status === "Non-Aktif"
        ).length;
      }

      // Fetch unverified points count (penukaran point yang belum diverifikasi)
      let unverifiedPoints = 0;
      try {
        const pointsResponse = await fetch("/api/point/getunverified");
        const pointsData = await pointsResponse.json();

        if (pointsData.success) {
          unverifiedPoints = pointsData.count || 0;
        }
      } catch (pointsError) {
        console.error("Error fetching unverified points:", pointsError);
        // Jika API point belum ada, set ke 0
        unverifiedPoints = 0;
      }

      setNotifications({
        unverifiedUsers,
        unverifiedPoints,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Set default values on error
      setNotifications({
        unverifiedUsers: 0,
        unverifiedPoints: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, refreshNotifications, loading }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
