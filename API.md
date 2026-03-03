# Task API Documentation

RESTful HTTP API endpoints for Mission Control task management.

## Base URL

```
https://witty-raptor-257.convex.cloud/api
```

## Authentication

Currently no authentication required. Rate limits apply.

---

## Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "service": "mission-control-api",
  "timestamp": 1709071200000
}
```

---

### Tasks

#### List Tasks

```
GET /tasks?status=pending&assignedTo=ai&limit=10
```

**Query Parameters:**
- `status` (optional): Filter by status
- `assignedTo` (optional): Filter by assignee
- `project` (optional): Filter by project
- `limit` (optional): Max results (default: 100)

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "abc123",
      "title": "Task Title",
      "status": "pending",
      "priority": "p1_high",
      "assignedTo": "ai",
      "project": "mission_control",
      "createdAt": 1709071200000,
      "updatedAt": 1709071200000
    }
  ],
  "count": 1
}
```

---

#### Get Single Task

```
GET /tasks/:id
```

**Response:**
```json
{
  "success": true,
  "task": {
    "_id": "abc123",
    "title": "Task Title",
    "description": "Task description",
    "status": "in_progress",
    "priority": "p1_high",
    "assignedTo": "ai",
    "project": "mission_control",
    "createdAt": 1709071200000,
    "updatedAt": 1709071200000,
    "tags": ["backend", "urgent"],
    "estimatedHours": 3
  }
}
```

---

#### Create Task

```
POST /tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "What needs to be done",
  "status": "pending",
  "priority": "p2_medium",
  "assignedTo": "ai",
  "project": "mission_control",
  "dueDate": 1709746800000,
  "tags": ["frontend", "ui"],
  "estimatedHours": 4,
  "notes": "Additional context"
}
```

**Required Fields:** `title`

**Response:**
```json
{
  "success": true,
  "id": "xyz789",
  "task": { ... }
}
```

---

#### Update Task

```
PATCH /tasks/:id
```

**Request Body:** (any task fields)
```json
{
  "title": "Updated Title",
  "priority": "p0_critical",
  "estimatedHours": 6
}
```

**Response:**
```json
{
  "success": true,
  "task": { ... }
}
```

---

#### Delete Task

```
DELETE /tasks/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

#### Update Status

```
POST /tasks/:id/status
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid statuses:** `pending`, `in_progress`, `review`, `blocked`, `completed`, `cancelled`

---

#### Assign Task

```
POST /tasks/:id/assign
```

**Request Body:**
```json
{
  "assignedTo": "senior_dev"
}
```

**Valid assignees:** `user`, `ai`, `senior_dev`, `copywriter`, `external`

---

#### Get Task Activity

```
GET /tasks/activity/:id
```

**Response:**
```json
{
  "success": true,
  "activity": [
    {
      "_id": "act123",
      "taskId": "abc123",
      "type": "status_changed",
      "actor": "system",
      "oldValue": "pending",
      "newValue": "in_progress",
      "timestamp": 1709071200000
    }
  ]
}
```

---

### Board & Stats

#### Get Kanban Board

```
GET /tasks/board
```

**Response:**
```json
{
  "success": true,
  "board": {
    "pending": [{ ... }],
    "in_progress": [{ ... }],
    "review": [{ ... }],
    "blocked": [{ ... }],
    "completed": [{ ... }]
  }
}
```

---

#### Get Statistics

```
GET /tasks/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 42,
    "byStatus": {
      "pending": 10,
      "in_progress": 15,
      "review": 5,
      "blocked": 2,
      "completed": 10
    },
    "byAssignee": {
      "user": 8,
      "ai": 20,
      "senior_dev": 10,
      "copywriter": 3,
      "external": 1
    },
    "completedToday": 3
  }
}
```

---

## Enums

### Status
- `pending`
- `in_progress`
- `review`
- `blocked`
- `completed`
- `cancelled`

### Priority
- `p0_critical`
- `p1_high`
- `p2_medium`
- `p3_low`

### Assignee
- `user` (Human)
- `ai` (AI Assistant)
- `senior_dev` (Senior Developer)
- `copywriter` (Content Writer)
- `external` (External Contractor)

### Project
- `lux_haven`
- `ai_automation`
- `mission_control`
- `infrastructure`
- `general`

---

## Error Responses

All errors return:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## Testing

### Run Test Suite

```bash
# Full test suite
bun test-api.ts

# Health check only
bun test-api.ts --health

# Create a test task
bun test-api.ts --create

# List tasks
bun test-api.ts --list

# Delete a task
bun test-api.ts --delete <task-id>
```

### Using Vitest

```bash
npm test src/test/task-api.test.ts
```

---

## Client Libraries

### JavaScript/TypeScript

```typescript
import { taskApi } from "./src/lib/task-api-external";

// Create a task
const { data } = await taskApi.create({
  title: "New Feature",
  priority: "p1_high",
  assignedTo: "senior_dev"
});

// Update status
await taskApi.updateStatus(taskId, "in_progress");

// Get board
const { data } = await taskApi.getBoard();
```

### cURL Examples

```bash
# Health check
curl https://witty-raptor-257.convex.cloud/api/health

# List tasks
curl "https://witty-raptor-257.convex.cloud/api/tasks?limit=5"

# Create task
curl -X POST https://witty-raptor-257.convex.cloud/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","priority":"p1_high"}'

# Update status
curl -X POST https://witty-raptor-257.convex.cloud/api/tasks/abc123/status \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

---

## n8n Integration

Use the external API client in n8n workflows:

```javascript
const { taskApi } = require('./src/lib/task-api-external');

// Create task from webhook
const result = await taskApi.create({
  title: $input.first().json.title,
  description: $input.first().json.description,
  source: 'n8n'
});

return [{ json: result }];
```
