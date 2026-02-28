import { Task, ContentItem, CalendarEvent, Memory, Agent } from "@/types/mission-control";

export const mockTasks: Task[] = [
  { id: "1", title: "Refactor authentication module", description: "Update auth flow to support OAuth2", status: "backlog", assignedTo: "Developer Agent", timestamp: "2026-02-28T08:00:00Z" },
  { id: "2", title: "Design new landing page", description: "Create wireframes and mockups for v2 launch", status: "backlog", assignedTo: "Designer Agent", timestamp: "2026-02-28T08:30:00Z" },
  { id: "3", title: "Write API documentation", description: "Document all REST endpoints", status: "in-progress", assignedTo: "Writer Agent", timestamp: "2026-02-28T09:00:00Z" },
  { id: "4", title: "Deploy staging environment", description: "Set up CI/CD pipeline for staging", status: "in-progress", assignedTo: "Developer Agent", timestamp: "2026-02-28T09:30:00Z" },
  { id: "5", title: "Content strategy for Q2", description: "Plan blog posts and social media content", status: "in-progress", assignedTo: "Human", timestamp: "2026-02-28T10:00:00Z" },
  { id: "6", title: "Database optimization", description: "Index frequently queried tables", status: "completed", assignedTo: "Developer Agent", timestamp: "2026-02-27T14:00:00Z" },
  { id: "7", title: "Brand guidelines document", description: "Compile brand assets and usage rules", status: "completed", assignedTo: "Designer Agent", timestamp: "2026-02-27T11:00:00Z" },
];

export const mockContent: ContentItem[] = [
  { id: "1", title: "How AI Agents Think", stage: "ideas", description: "Explore reasoning patterns in LLMs", assignedTo: "Writer Agent" },
  { id: "2", title: "Building Autonomous Systems", stage: "script-writing", description: "Deep dive into self-managing AI", script: "In this video, we explore how autonomous AI systems coordinate work...", assignedTo: "Writer Agent" },
  { id: "3", title: "Mission Control Demo", stage: "thumbnail", description: "Showcase the OpenClaw dashboard", assignedTo: "Designer Agent" },
  { id: "4", title: "Agent Collaboration 101", stage: "filming", description: "Tutorial on multi-agent workflows", assignedTo: "Human" },
  { id: "5", title: "The Future of AI Teams", stage: "published", description: "Published overview of AI org structures", assignedTo: "Writer Agent" },
];

export const mockEvents: CalendarEvent[] = [
  { id: "1", title: "Memory consolidation", date: "2026-02-28", time: "00:00", type: "cron", agent: "System" },
  { id: "2", title: "Content pipeline review", date: "2026-02-28", time: "09:00", type: "scheduled", agent: "Writer Agent" },
  { id: "3", title: "Deploy v2.1 to staging", date: "2026-02-28", time: "14:00", type: "scheduled", agent: "Developer Agent" },
  { id: "4", title: "Daily task sweep", date: "2026-02-28", time: "23:00", type: "cron", agent: "System" },
  { id: "5", title: "Team sync", date: "2026-03-01", time: "10:00", type: "scheduled", agent: "Human" },
  { id: "6", title: "Backup memory store", date: "2026-03-01", time: "02:00", type: "cron", agent: "System" },
  { id: "7", title: "Design review", date: "2026-03-02", time: "15:00", type: "scheduled", agent: "Designer Agent" },
];

export const mockMemories: Memory[] = [
  { id: "1", title: "User prefers dark mode interfaces", content: "During initial setup, the human operator expressed a strong preference for dark-themed interfaces with minimal visual clutter. All future UI work should follow this guideline.", tags: ["preference", "ui"], timestamp: "2026-02-27T08:00:00Z", source: "System" },
  { id: "2", title: "API rate limits discovered", content: "The external content API has a rate limit of 100 requests per minute. Implemented exponential backoff to handle 429 responses gracefully.", tags: ["technical", "api"], timestamp: "2026-02-27T12:00:00Z", source: "Developer Agent" },
  { id: "3", title: "Content strategy: focus on tutorials", content: "Analysis of engagement metrics shows tutorial content outperforms opinion pieces by 3x. Adjusting content pipeline priorities accordingly.", tags: ["strategy", "content"], timestamp: "2026-02-28T06:00:00Z", source: "Writer Agent" },
  { id: "4", title: "Brand color palette finalized", content: "Primary: Cyan (#00d4ff), Background: Deep Navy (#0a0e1a). These should be used consistently across all generated materials.", tags: ["design", "brand"], timestamp: "2026-02-28T09:00:00Z", source: "Designer Agent" },
  { id: "5", title: "Deployment process optimized", content: "Reduced deployment time from 12 minutes to 3 minutes by parallelizing build steps and caching dependencies.", tags: ["technical", "devops"], timestamp: "2026-02-28T10:00:00Z", source: "Developer Agent" },
];

export const mockAgents: Agent[] = [
  { id: "1", name: "Atlas", role: "Developer", responsibilities: ["Code architecture", "API development", "DevOps", "Testing"], status: "working", currentTask: "Deploy staging environment", memoryScope: "Technical systems, code patterns, infrastructure" },
  { id: "2", name: "Quill", role: "Writer", responsibilities: ["Content creation", "Documentation", "Script writing", "Copy editing"], status: "working", currentTask: "Write API documentation", memoryScope: "Content strategy, brand voice, audience insights" },
  { id: "3", name: "Pixel", role: "Designer", responsibilities: ["UI/UX design", "Brand assets", "Thumbnails", "Visual identity"], status: "idle", memoryScope: "Design system, brand guidelines, visual trends" },
  { id: "4", name: "Sentinel", role: "System", responsibilities: ["Task scheduling", "Memory consolidation", "Health monitoring", "Backup"], status: "working", currentTask: "Memory consolidation", memoryScope: "All system operations, scheduling, health metrics" },
];
