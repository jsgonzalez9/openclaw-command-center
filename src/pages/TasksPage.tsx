import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, Bot, Clock, Tag, Loader2, RefreshCw, Wifi, Cloud } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/mission-control";
import { 
  useTaskBoard, 
  useCreateTask, 
  useUpdateTaskStatus,
  useAssignTask,
  useDeleteTask
} from "@/hooks/useConvexTasks";
import { useSyncState } from "@/hooks/useSync";

// Extended task type with priority
interface ExtendedTask extends Task {
  priority?: "p0" | "p1" | "p2" | "p3";
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
}

const COLUMNS = [
  { key: "pending" as const, label: "Pending", color: "bg-gray-500" },
  { key: "in_progress" as const, label: "In Progress", color: "bg-blue-500" },
  { key: "review" as const, label: "Review", color: "bg-yellow-500" },
  { key: "blocked" as const, label: "Blocked", color: "bg-red-500" },
  { key: "completed" as const, label: "Completed", color: "bg-green-500" },
];

const PRIORITIES = {
  p0: { label: "P0", color: "bg-red-500 text-white" },
  p1: { label: "P1", color: "bg-orange-500 text-white" },
  p2: { label: "P2", color: "bg-blue-500 text-white" },
  p3: { label: "P3", color: "bg-gray-500 text-white" },
  p0_critical: { label: "P0", color: "bg-red-500 text-white" },
  p1_high: { label: "P1", color: "bg-orange-500 text-white" },
  p2_medium: { label: "P2", color: "bg-blue-500 text-white" },
  p3_low: { label: "P3", color: "bg-gray-500 text-white" },
};

// Helper to convert DB task to ExtendedTask
const convertTask = (task: Task): ExtendedTask => ({
  ...task,
  priority: task.priority?.includes('_') 
    ? (task.priority.split('_')[0] as "p0" | "p1" | "p2" | "p3") 
    : (task.priority as any) || "p2",
  dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
});

const TasksPage = () => {
  const { board, loading: boardLoading, error, refetch } = useTaskBoard();
  const { mutate: createTask, loading: creating } = useCreateTask();
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateTaskStatus();
  const { mutate: assignTask } = useAssignTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { state: syncState, isSyncing, triggerSync, formatLastSync } = useSyncState();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "p2" as const,
    assignedTo: "user" as const,
    project: "general" as const,
    estimatedHours: 1,
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      await updateStatus(draggableId, destination.droppableId);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: `${newTask.priority}_medium`,
        assignedTo: newTask.assignedTo,
        project: newTask.project,
        estimatedHours: newTask.estimatedHours,
      });

      setNewTask({
        title: "",
        description: "",
        priority: "p2",
        assignedTo: "user",
        project: "general",
        estimatedHours: 1,
      });
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  if (boardLoading && !board) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Connecting to Convex...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="text-red-500">Failed to load tasks: {error}</div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Tasks Board" 
        subtitle={
          <span className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-emerald-500" />
            Real-time sync via Convex • Drag & drop to update
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerSync}
            disabled={isSyncing}
            className={isSyncing ? "animate-pulse" : ""}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4 mr-2 text-primary" />
                ClickUp
              </>
            )}
          </Button>
          {syncState && syncState.lastSyncAt && !isSyncing && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Last: {formatLastSync()}
            </span>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="card-glow">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="font-mono">Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-mono block mb-2">Title</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-mono block mb-2">Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Add details..."
                    className="bg-background border-border min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-mono block mb-2">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) => setNewTask({ ...newTask, priority: v as any })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="p0">P0 - Critical</SelectItem>
                        <SelectItem value="p1">P1 - High</SelectItem>
                        <SelectItem value="p2">P2 - Medium</SelectItem>
                        <SelectItem value="p3">P3 - Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-mono block mb-2">Assigned To</label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v as any })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="user">Human</SelectItem>
                        <SelectItem value="ai">AI</SelectItem>
                        <SelectItem value="senior_dev">Senior Dev</SelectItem>
                        <SelectItem value="copywriter">Copywriter</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {COLUMNS.map((col) => {
            const columnTasks = (board?.[col.key] || [])
              .map(convertTask)
              .sort((a, b) => {
                const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3, p0_critical: 0, p1_high: 1, p2_medium: 2, p3_low: 3 };
                const aPriority = a.priority || "p2";
                const bPriority = b.priority || "p2";
                return priorityOrder[aPriority] - priorityOrder[bPriority];
              });

            return (
              <div key={col.key} className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", col.color)} />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Task List */}
                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-3 min-h-[200px] rounded-lg transition-colors",
                        snapshot.isDraggingOver && "bg-primary/5 border border-primary/20 border-dashed"
                      )}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "group relative rounded-lg border border-border bg-card p-4 card-glow hover:border-primary/30 transition-all",
                                snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 rotate-2"
                              )}
                            >
                              {/* Delete button (visible on hover) */}
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                              >
                                ×
                              </button>

                              {/* Priority Badge */}
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={cn("text-[10px] font-mono", PRIORITIES[task.priority || "p2"].color)}>
                                  {PRIORITIES[task.priority || "p2"].label}
                                </Badge>
                              </div>

                              {/* Title */}
                              <h4 className="text-sm font-medium text-foreground leading-tight mb-2 pr-4">
                                {task.title}
                              </h4>

                              {/* Description */}
                              {task.description && (
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {task.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {task.tags.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-secondary-foreground">
                                      +{task.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Meta */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  {task.assignedTo === "user" ? (
                                    <User className="h-3 w-3" />
                                  ) : (
                                    <Bot className="h-3 w-3 text-primary" />
                                  )}
                                  <span className="capitalize">{task.assignedTo.replace('_', ' ')}</span>
                                </div>
                                {task.estimatedHours && (
                                  <div className="flex items-center gap-1 font-mono">
                                    <Clock className="h-3 w-3" />
                                    {task.estimatedHours}h
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Status indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-lg">
        <div className={cn("w-2 h-2 rounded-full", boardLoading ? "bg-yellow-500 animate-pulse" : "bg-emerald-500")} />
        {boardLoading ? "Syncing..." : "Live - Convex"}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
