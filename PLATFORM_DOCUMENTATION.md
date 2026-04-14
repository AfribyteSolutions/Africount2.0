# Africount Platform Documentation

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Module Documentation](#module-documentation)
6. [Security & Permissions](#security--permissions)
7. [Integration Guide](#integration-guide)
8. [Deployment](#deployment)

---

## Platform Overview

### What is Africount?

Africount is a comprehensive multi-tenant bookkeeping and financial management platform designed for organizations across Africa. It provides tools for:

- **Financial Tracking**: Record and manage transactions
- **Budget Management**: Plan, track, and control spending
- **Project Management**: Manage projects with budgets and teams
- **Analytics**: Visualize financial data and trends
- **Collaboration**: Team comments and discussions
- **Integration**: Webhooks and API access

### Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Tenancy** | Multiple organizations and workspaces |
| **Role-Based Access** | Admin, Manager, Agent roles with granular permissions |
| **Real-Time Collaboration** | Comments, mentions, and activity tracking |
| **Advanced Analytics** | KPIs, forecasting, variance analysis |
| **Data Import/Export** | CSV and Excel support |
| **API & Webhooks** | External system integration |
| **Mobile-Friendly** | Responsive design for all devices |
| **Audit Trail** | Complete activity logging |

---

## Architecture

### Technology Stack

```
Frontend:
  - React 19 with TypeScript
  - Tailwind CSS 4 for styling
  - tRPC for type-safe API calls
  - React Query for data management

Backend:
  - Express.js 4 with Node.js
  - tRPC for RPC endpoints
  - Drizzle ORM for database access
  - MySQL/TiDB for data storage

Infrastructure:
  - Manus OAuth for authentication
  - Manus Forge API for LLM/storage
  - S3-compatible storage for files
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pages: Dashboard, Analytics, Projects, Transactions   │ │
│  │  Components: Charts, Forms, Tables, Comments           │ │
│  │  State: tRPC queries/mutations, React Query            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    /api/trpc/* endpoints
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  tRPC Routers:                                          │ │
│  │  - analytics: KPIs, forecasts, variance reports        │ │
│  │  - webhook: Event management and delivery              │ │
│  │  - dashboard: Layout and preset management             │ │
│  │  - chartComment: Discussion and collaboration          │ │
│  │  - transaction: Financial transactions                 │ │
│  │  - project: Project management                         │ │
│  │  - procurement: Budget and approval workflows          │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Database Layer (Drizzle ORM):                          │ │
│  │  - Query builders and type safety                       │ │
│  │  - Connection pooling                                  │ │
│  │  - Migration management                                │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (MySQL/TiDB)                       │
│  - 26 phases of tables for all features                     │
│  - Indexed for performance                                  │
│  - Supports multi-tenancy                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  openId VARCHAR(255) UNIQUE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

#### Organizations Table
```sql
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255),
  timezone VARCHAR(50),
  currency VARCHAR(10),
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### Workspaces Table
```sql
CREATE TABLE workspaces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizationId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### Workspace Members Table
```sql
CREATE TABLE workspace_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  userId INT NOT NULL,
  role ENUM('admin', 'manager', 'agent') NOT NULL,
  joinedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE KEY unique_member (workspaceId, userId)
);
```

### Financial Tables

#### Transactions Table
```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  projectId INT,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  attachmentUrl VARCHAR(255),
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  INDEX (workspaceId, date),
  INDEX (type, category)
);
```

#### Balance Sheets Table
```sql
CREATE TABLE balance_sheets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  projectId INT,
  name VARCHAR(255) NOT NULL,
  period VARCHAR(50) NOT NULL,
  totalAssets DECIMAL(15, 2),
  totalLiabilities DECIMAL(15, 2),
  totalEquity DECIMAL(15, 2),
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(15, 2),
  status ENUM('active', 'completed', 'on_hold') DEFAULT 'active',
  startDate DATE,
  endDate DATE,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  INDEX (workspaceId, status)
);
```

### Analytics Tables

#### Analytics Metrics Table
```sql
CREATE TABLE analytics_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  projectId INT,
  metricType VARCHAR(100) NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  period VARCHAR(50) NOT NULL,
  periodDate DATE NOT NULL,
  metadata JSON,
  calculatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  INDEX (workspaceId, metricType, periodDate)
);
```

#### Forecasts Table
```sql
CREATE TABLE forecasts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  projectId INT,
  forecastType VARCHAR(100) NOT NULL,
  forecastPeriod VARCHAR(50) NOT NULL,
  forecastData JSON NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,
  algorithm VARCHAR(100) NOT NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### Variance Reports Table
```sql
CREATE TABLE variance_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  projectId INT,
  budgetId INT,
  reportPeriod VARCHAR(50) NOT NULL,
  periodDate DATE NOT NULL,
  budgetAmount DECIMAL(15, 2) NOT NULL,
  actualAmount DECIMAL(15, 2) NOT NULL,
  variance DECIMAL(15, 2) NOT NULL,
  variancePercent DECIMAL(8, 2) NOT NULL,
  status ENUM('favorable', 'unfavorable', 'neutral') NOT NULL,
  analysis TEXT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);
```

### Collaboration Tables

#### Chart Comments Table
```sql
CREATE TABLE chart_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chartId VARCHAR(255) NOT NULL,
  workspaceId INT NOT NULL,
  userId INT NOT NULL,
  content TEXT NOT NULL,
  parentCommentId INT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX (chartId, workspaceId)
);
```

#### Comment Reactions Table
```sql
CREATE TABLE comment_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  commentId INT NOT NULL,
  userId INT NOT NULL,
  reactionType VARCHAR(50) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (commentId) REFERENCES chart_comments(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE KEY unique_reaction (commentId, userId, reactionType)
);
```

### Webhook Tables

#### Webhooks Table
```sql
CREATE TABLE webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  events JSON NOT NULL,
  secret VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  maxRetries INT DEFAULT 3,
  backoffMultiplier DECIMAL(3, 2) DEFAULT 1.5,
  customHeaders JSON,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### Webhook Events Table
```sql
CREATE TABLE webhook_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  webhookId INT NOT NULL,
  eventType VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'delivered', 'failed', 'skipped') DEFAULT 'pending',
  retryCount INT DEFAULT 0,
  nextRetryAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (webhookId) REFERENCES webhooks(id),
  INDEX (webhookId, status, nextRetryAt)
);
```

---

## API Reference

### Authentication

All API requests require authentication via OAuth token in the `Authorization` header:

```
Authorization: Bearer <oauth_token>
```

### Base URL

```
https://api.africount.com/api/trpc
```

### Request Format

All requests use tRPC format:

```
POST /api/trpc/[router].[procedure]
Content-Type: application/json

{
  "json": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Response Format

```json
{
  "result": {
    "data": { /* response data */ }
  }
}
```

### Error Handling

Errors return with HTTP status and error details:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `FORBIDDEN` | User lacks permission |
| `NOT_FOUND` | Resource does not exist |
| `BAD_REQUEST` | Invalid input parameters |
| `UNAUTHORIZED` | Authentication required |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## Module Documentation

### Analytics Module

**Purpose**: Calculate and display financial metrics

**Key Procedures**:

#### `analytics.getMetrics`
Get metrics for a specific period

```typescript
input: {
  workspaceId: number;
  metricType: string; // "revenue", "expense", "profit", "cash_flow"
  startDate: Date;
  endDate: Date;
  projectId?: number;
}

output: Array<{
  id: number;
  value: number;
  period: string;
  periodDate: Date;
}>
```

#### `analytics.aggregateMetrics`
Get aggregated metrics (sum, average, min, max)

```typescript
input: {
  workspaceId: number;
  metricType: string;
  startDate: Date;
  endDate: Date;
  projectId?: number;
}

output: {
  total: number;
  average: number;
  min: number;
  max: number;
}
```

#### `analytics.getForecasts`
Get financial forecasts

```typescript
input: {
  workspaceId: number;
  forecastType?: string; // "cash_flow", "revenue", "expense"
  projectId?: number;
}

output: Array<{
  id: number;
  forecastType: string;
  forecastData: Array<{ date: string; value: number; confidence: number }>;
  confidence: number;
}>
```

#### `analytics.getVarianceReports`
Get budget variance reports

```typescript
input: {
  workspaceId: number;
  startDate: Date;
  endDate: Date;
  projectId?: number;
}

output: Array<{
  id: number;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: "favorable" | "unfavorable" | "neutral";
}>
```

---

### Webhook Module

**Purpose**: Send events to external systems

**Key Procedures**:

#### `webhook.create`
Create a new webhook

```typescript
input: {
  workspaceId: number;
  url: string;
  events: string[]; // ["transaction.created", "budget.approved"]
  secret?: string;
  maxRetries?: number;
  customHeaders?: Record<string, string>;
}

output: {
  id: number;
  url: string;
  active: boolean;
}
```

#### `webhook.list`
List all webhooks

```typescript
input: {
  workspaceId: number;
}

output: Array<{
  id: number;
  url: string;
  events: string[];
  active: boolean;
}>
```

#### `webhook.test`
Send a test webhook

```typescript
input: {
  webhookId: number;
  workspaceId: number;
}

output: {
  success: boolean;
  message: string;
}
```

#### `webhook.getEvents`
Get webhook event history

```typescript
input: {
  webhookId: number;
  limit?: number;
  offset?: number;
}

output: Array<{
  id: number;
  eventType: string;
  status: "pending" | "delivered" | "failed";
  retryCount: number;
  createdAt: Date;
}>
```

---

### Dashboard Module

**Purpose**: Manage dashboard layouts and presets

**Key Procedures**:

#### `dashboard.saveLayout`
Save a dashboard layout

```typescript
input: {
  workspaceId: number;
  name: string;
  layoutConfig: {
    charts: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      size: { w: number; h: number };
      filters?: Record<string, unknown>;
    }>;
  };
  isDefault?: boolean;
}

output: {
  id: number;
  name: string;
}
```

#### `dashboard.getLayout`
Get a saved layout

```typescript
input: {
  layoutId: number;
}

output: {
  id: number;
  name: string;
  layoutConfig: { /* config */ };
}
```

#### `dashboard.listLayouts`
List all layouts for a workspace

```typescript
input: {
  workspaceId: number;
}

output: Array<{
  id: number;
  name: string;
  isDefault: boolean;
}>
```

---

### Chart Comment Module

**Purpose**: Enable team discussion on charts

**Key Procedures**:

#### `chartComment.create`
Create a comment

```typescript
input: {
  chartId: string;
  workspaceId: number;
  content: string;
  parentCommentId?: number; // For replies
}

output: {
  id: number;
  content: string;
  createdAt: Date;
}
```

#### `chartComment.list`
Get comments for a chart

```typescript
input: {
  chartId: string;
  workspaceId: number;
  limit?: number;
  offset?: number;
}

output: Array<{
  id: number;
  content: string;
  userId: number;
  createdAt: Date;
  reactions: Array<{ type: string; count: number }>;
}>
```

#### `chartComment.addReaction`
Add emoji reaction

```typescript
input: {
  commentId: number;
  reactionType: string; // "👍", "❤️", "😂", etc.
}

output: {
  success: boolean;
}
```

---

## Security & Permissions

### Permission Model

Africount uses a hierarchical permission model:

```
Organization
  └─ Workspace
      └─ Module
          └─ Action (read, write, delete)
```

### Role-Based Access Control

#### Admin Role
- Full access to all modules
- Can manage team members
- Can configure settings
- Can approve budgets

#### Manager Role
- Can create and edit data
- Can view reports
- Can manage projects
- Cannot manage team members

#### Agent Role
- Can create transactions
- Can submit data
- Can view own entries
- Limited to assigned modules

### Permission Checking

All procedures check permissions:

```typescript
const member = await db.getWorkspaceMemberRole(workspaceId, userId);
if (!member) throw new TRPCError({ code: "FORBIDDEN" });

const canRead = await checkModulePermission(
  workspaceId,
  userId,
  "analytics",
  "read"
);
if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });
```

### Data Isolation

- Users can only access workspaces they're members of
- Data is isolated by workspace
- Transactions are filtered by workspace
- Reports only show workspace data

---

## Integration Guide

### Webhook Integration

**Step 1: Create a Webhook**

```bash
curl -X POST https://api.africount.com/api/trpc/webhook.create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "workspaceId": 1,
      "url": "https://your-system.com/webhooks/africount",
      "events": ["transaction.created", "budget.approved"],
      "secret": "your-secret-key"
    }
  }'
```

**Step 2: Verify Webhook Signature**

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}
```

**Step 3: Handle Webhook Events**

```typescript
app.post('/webhooks/africount', (req, res) => {
  const signature = req.headers['x-africount-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, 'your-secret-key')) {
    return res.status(401).send('Unauthorized');
  }
  
  const event = req.body;
  
  switch (event.type) {
    case 'transaction.created':
      handleTransactionCreated(event.data);
      break;
    case 'budget.approved':
      handleBudgetApproved(event.data);
      break;
  }
  
  res.send('OK');
});
```

### API Integration

**Example: Fetch Transactions**

```typescript
const response = await fetch(
  'https://api.africount.com/api/trpc/transaction.list',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      json: {
        workspaceId: 1,
        limit: 10,
        offset: 0
      }
    })
  }
);

const data = await response.json();
console.log(data.result.data);
```

---

## Deployment

### Prerequisites

- Node.js 18+
- MySQL 8.0+ or TiDB
- Redis (optional, for caching)

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/africount

# OAuth
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# JWT
JWT_SECRET=your-jwt-secret

# API Keys
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.manus.im

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id
```

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/africount.git
cd africount

# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Build frontend
pnpm build

# Start server
pnpm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Database Migrations

```bash
# Generate new migration
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Verify migrations
pnpm drizzle-kit push
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check server status
curl https://your-domain.com/health

# Check database connection
curl https://your-domain.com/api/health/db
```

### Logging

Logs are written to:
- `.manus-logs/devserver.log` - Server startup and errors
- `.manus-logs/browserConsole.log` - Client-side errors
- `.manus-logs/networkRequests.log` - API requests

### Performance Optimization

1. **Database Indexing**: Ensure all foreign keys and frequently queried columns are indexed
2. **Query Caching**: Use Redis for analytics metrics caching
3. **API Rate Limiting**: Implement rate limiting per API key
4. **CDN**: Serve static assets from CDN

---

## Support & Resources

- **Documentation**: https://docs.africount.com
- **API Reference**: https://api.africount.com/docs
- **GitHub**: https://github.com/your-org/africount
- **Support Email**: support@africount.com
- **Community Forum**: https://forum.africount.com

---

**Last Updated**: April 2026
**Version**: 1.0
**Maintained by**: Africount Team
