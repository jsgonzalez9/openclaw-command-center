"use client";

import { useState, useEffect, useCallback } from "react";
import { syncApi, SyncState } from "@/lib/api-client";

// Hook for managing ClickUp sync state
export function useSyncState() {
  const [state, setState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await syncApi.getState();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sync state");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  const triggerSync = useCallback(async () => {
    try {
      await syncApi.trigger();
      await fetch(); // Refresh state
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger sync");
      return false;
    }
  }, [fetch]);

  const formatLastSync = useCallback(() => {
    if (!state?.lastSyncAt) return "Never synced";
    const date = new Date(state.lastSyncAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
 if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }, [state?.lastSyncAt]);

  return {
    state,
    loading,
    error,
    triggerSync,
    refetch: fetch,
    formatLastSync,
    isSyncing: state?.status === "syncing",
    hasError: state?.status === "error",
  };
}

export default useSyncState;
