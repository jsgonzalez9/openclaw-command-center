import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { clickUpClient } from "@/lib/clickup-client";
import { toast } from "sonner";

interface ExtendedTask {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'in-progress' | 'completed';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  assignedTo?: string;
  tags: string[];
  estimatedHours?: number;
}

interface ClickUpSyncButtonProps {
  tasks: ExtendedTask[];
  listId?: string;
}

export const ClickUpSyncButton = ({ tasks, listId = 'YOUR_CLICKUP_LIST_ID' }: ClickUpSyncButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{ created: number; updated: number } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const result = await clickUpClient.syncTasksToClickUp(listId, tasks);
      
      setLastSync({ created: result.created, updated: result.updated });
      
      toast.success(`Sync complete! Created: ${result.created}, Updated: ${result.updated}`);
      
      if (result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
        toast.warning(`${result.errors.length} tasks failed to sync`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync with ClickUp');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {lastSync && (
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-muted-foreground">
            Last sync: +{lastSync.created}, ~{lastSync.updated}
          </span>
        </div>
      )}
      
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Sync to ClickUp
          </>
        )}
      </Button>
    </div>
  );
};
