"use client";

import { useState, useEffect, useCallback } from "react";
import { tasksApi, Task, TaskStats, TaskBoard } from "@/lib/api-client";

// Hook for fetching tasks list
export function useTaskList(filters?: { status?: string; assignedTo?: string; project?: string }) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await tasksApi.list(filters);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.assignedTo, filters?.project]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { tasks, loading, error, refetch: fetch };
}

// Hook for fetching task board
export function useTaskBoard() {
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await tasksApi.getBoard();
      setBoard(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { board, loading, error, refetch: fetch };
}

// Hook for fetching task stats
export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await tasksApi.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}

// Mutations
export function useCreateTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (task: Parameters<typeof tasksApi.create>[0]) => {
    setLoading(true);
    try {
      const id = await tasksApi.create(task);
      setError(null);
      return id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create task";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateTaskStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, status: string) => {
    setLoading(true);
    try {
      await tasksApi.updateStatus(id, status);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useAssignTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, assignedTo: string) => {
    setLoading(true);
    try {
      await tasksApi.assign(id, assignedTo);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign task";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useDeleteTask() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await tasksApi.remove(id);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete task";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
