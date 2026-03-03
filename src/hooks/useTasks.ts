import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, CreateTaskInput, UpdateTaskInput, TaskStatus } from "@/lib/api-client";
import { Task } from "@/types/mission-control";

// Query keys
const TASKS_KEY = "tasks";
const TASK_KEY = "task";
const TASK_BOARD_KEY = "taskBoard";
const TASK_STATS_KEY = "taskStats";

// List all tasks
export function useTasks(filters?: { status?: TaskStatus; assignedTo?: string }) {
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: () => tasksApi.list(filters),
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });
}

// Get a single task
export function useTask(id: string) {
  return useQuery({
    queryKey: [TASK_KEY, id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

// Get board view (grouped by status)
export function useTaskBoard() {
  return useQuery({
    queryKey: [TASK_BOARD_KEY],
    queryFn: () => tasksApi.getBoard(),
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

// Get task statistics
export function useTaskStats() {
  return useQuery({
    queryKey: [TASK_STATS_KEY],
    queryFn: () => tasksApi.getStats(),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_BOARD_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_STATS_KEY] });
    },
  });
}

// Update a task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => 
      tasksApi.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [TASK_BOARD_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_STATS_KEY] });
    },
  });
}

// Update task status (for drag-and-drop)
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => 
      tasksApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [TASK_BOARD_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_STATS_KEY] });
    },
  });
}

// Assign a task
export function useAssignTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) => 
      tasksApi.assign(id, assignedTo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [TASK_BOARD_KEY] });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_BOARD_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASK_STATS_KEY] });
    },
  });
}

// Get task activity
export function useTaskActivity(taskId: string) {
  return useQuery({
    queryKey: [TASK_KEY, taskId, "activity"],
    queryFn: () => tasksApi.getActivity(taskId),
    enabled: !!taskId,
  });
}

// Optimistic update helper for drag-and-drop
export function useOptimisticStatusUpdate() {
  const queryClient = useQueryClient();
  
  const updateOptimistically = (taskId: string, newStatus: TaskStatus) => {
    // Update the board view optimistically
    queryClient.setQueryData([TASK_BOARD_KEY], (old: TaskBoard | undefined) => {
      if (!old) return old;
      
      const newBoard = { ...old };
      let movedTask: Task | undefined;
      
      // Remove from old column
      for (const status of Object.keys(newBoard) as TaskStatus[]) {
        const index = newBoard[status].findIndex(t => t.id === taskId);
        if (index !== -1) {
          movedTask = newBoard[status][index];
          newBoard[status] = [
            ...newBoard[status].slice(0, index),
            ...newBoard[status].slice(index + 1),
          ];
          break;
        }
      }
      
      // Add to new column
      if (movedTask) {
        movedTask = { ...movedTask, status: newStatus };
        newBoard[newStatus] = [...newBoard[newStatus], movedTask];
      }
      
      return newBoard;
    });
  };
  
  return { updateOptimistically };
}

// Type for TaskBoard (to avoid import issues)
interface TaskBoard {
  backlog: Task[];
  pending: Task[];
  in_progress: Task[];
  review: Task[];
  blocked: Task[];
  completed: Task[];
}