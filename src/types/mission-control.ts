export interface Task {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "in-progress" | "completed";
  assignedTo: string;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  title: string;
  stage: "ideas" | "script-writing" | "thumbnail" | "filming" | "published";
  description: string;
  script?: string;
  assignedTo: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "scheduled" | "cron";
  agent: string;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  source: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  status: "working" | "idle" | "assigned";
  currentTask?: string;
  memoryScope: string;
}
