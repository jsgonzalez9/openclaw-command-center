"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationsApi, Notification, NotificationCount } from "@/lib/api-client";

interface UseNotificationsOptions {
  userId?: string;
  pollInterval?: number; // ms, default 3000
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { userId = "user", pollInterval = 3000 } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<NotificationCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevCountRef = useRef(0);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationsApi.list(userId, { unreadOnly: false, limit: 50 }),
        notificationsApi.getUnreadCount(userId),
      ]);
      
      // Check if we have new notifications
      if (count.total > prevCountRef.current && prevCountRef.current > 0) {
        const newOnes = notifs.filter(n => !n.read).slice(0, count.total - prevCountRef.current);
        if (newOnes.length > 0) {
          setNewNotification(newOnes[0]);
          // Clear after 5 seconds
          setTimeout(() => setNewNotification(null), 5000);
        }
      }
      
      prevCountRef.current = count.total;
      setNotifications(notifs);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Poll for updates (WebSocket-style via polling)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  // Mark single notification as read
  const markRead = useCallback(async (id: string) => {
    try {
      const success = await notificationsApi.markRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, read: true, readAt: Date.now() } : n)
        );
        await fetchNotifications(); // Refresh counts
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
      return false;
    }
  }, [fetchNotifications]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    try {
      const count = await notificationsApi.markAllRead(userId);
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: Date.now() }))
      );
      await fetchNotifications();
      return count;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read");
      return 0;
    }
  }, [userId, fetchNotifications]);

  // Dismiss the toast notification
  const dismissToast = useCallback(() => {
    setNewNotification(null);
  }, []);

  return {
    notifications,
    unreadCount: unreadCount?.total ?? 0,
    unreadByType: unreadCount?.byType ?? {},
    loading,
    error,
    newNotification,
    dismissToast,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
    unreadNotifications: notifications.filter(n => !n.read),
    readNotifications: notifications.filter(n => n.read),
  };
}

// Hook specifically for unread count (lightweight badge)
export function useUnreadCount(userId: string = "user") {
  const [count, setCount] = useState(0);
  const [byType, setByType] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await notificationsApi.getUnreadCount(userId);
        setCount(result.total);
        setByType(result.byType);
      } catch {
        // Silently fail for badge
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return { count, byType };
}

export default useNotifications;
