# Africount - Multi-Tenant Bookkeeping Platform

A comprehensive financial management and bookkeeping platform for organizations across Africa, built with React, Express, tRPC, and MySQL.

## Overview

Africount is a feature-rich platform that enables organizations to:

- **Track Finances**: Record and manage transactions, balance sheets, and financial statements
- **Manage Projects**: Create projects with budgets and track spending
- **Analyze Performance**: View real-time analytics, KPIs, and forecasts
- **Control Budgets**: Submit budget requests and manage approvals
- **Collaborate**: Team comments, mentions, and activity tracking
- **Integrate**: Webhooks and API access for external systems

## Key Features

### 🎯 Financial Management
- Transaction tracking (income and expenses)
- Balance sheet management
- Budget planning and control
- Variance analysis and reporting
- Cash flow forecasting

### 📊 Analytics & Reporting
- Real-time KPI tracking
- Revenue and expense analysis
- Budget vs. actual comparison
- Financial forecasting with confidence levels
- Customizable dashboards
- Export to PDF and Excel

### 👥 Team Collaboration
- Chart commenting and discussions
- @mentions for team members
- Emoji reactions
- Activity tracking
- Real-time notifications

### 🔌 Integration
- Webhook support for external systems
- API access with rate limiting
- Event-driven architecture
- Signature verification for security

### 🏢 Multi-Tenancy
- Multiple organizations support
- Multiple workspaces per organization
- Role-based access control (Admin, Manager, Agent)
- Granular permission management

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **tRPC** - Type-safe API calls
- **React Query** - Data management
- **React Grid Layout** - Dashboard customization

### Backend
- **Node.js** - Runtime
- **Express.js 4** - Web framework
- **tRPC 11** - RPC framework
- **Drizzle ORM** - Database access
- **MySQL/TiDB** - Database

### Infrastructure
- **Manus OAuth** - Authentication
- **S3-compatible Storage** - File storage
- **Manus Forge API** - LLM and additional services

## Project Structure

```
africount/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Utilities and helpers
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   └── index.html            # HTML template
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database helpers
│   ├── auth.logout.test.ts   # Test examples
│   └── _core/                # Core framework
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Table definitions
│   └── migrations/           # SQL migrations
├── shared/                    # Shared types and constants
├── storage/                   # S3 storage helpers
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── vite.config.ts            # Vite config
```

## Database Schema

### Core Tables (26 Phases)

**Phase 1-5: Foundation**
- users, organizations, workspaces, workspace_members
- roles, permissions, module_access

**Phase 6-10: Financial Data**
- transactions, balance_sheets, projects, budgets
- procurement_items, approvals

**Phase 11-15: Analytics**
- analytics_metrics, forecasts, variance_reports
- kpi_definitions, kpi_calculations

**Phase 16-20: Webhooks & Integration**
- webhooks, webhook_events, webhook_deliveries
- api_keys, rate_limit_keys

**Phase 21-25: Dashboard & Customization**
- dashboard_layouts, dashboard_presets, dashboard_chart_configs
- computing_tables, computing_table_data

**Phase 26: Collaboration**
- chart_comments, comment_reactions, comment_mentions
- activity_logs

See `PLATFORM_DOCUMENTATION.md` for complete schema details.

## API Reference

### Authentication

All requests require OAuth token:
```
Authorization: Bearer <oauth_token>
```

### Base URL
```
https://api.africount.com/api/trpc
```

### Example Request
```bash
curl -X POST https://api.africount.com/api/trpc/analytics.getMetrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "workspaceId": 1,
      "metricType": "revenue",
      "startDate": "2026-01-01",
      "endDate": "2026-03-31"
    }
  }'
```

See `PLATFORM_DOCUMENTATION.md` for complete API reference.

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+ or TiDB
- pnpm (package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/africount.git
   cd africount
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
# Build frontend
pnpm build

# Start production server
pnpm start
```

## Development

### Project Structure Guidelines

- **Pages**: One component per page in `client/src/pages/`
- **Components**: Reusable UI components in `client/src/components/`
- **Hooks**: Custom React hooks in `client/src/hooks/`
- **Utilities**: Helper functions in `client/src/lib/`
- **Backend**: tRPC procedures in `server/routers.ts`
- **Database**: Query helpers in `server/db.ts`

### Adding a New Feature

1. **Update database schema** in `drizzle/schema.ts`
2. **Generate migration**: `pnpm drizzle-kit generate`
3. **Add query helpers** in `server/db.ts`
4. **Create tRPC procedures** in `server/routers.ts`
5. **Build UI components** in `client/src/components/`
6. **Create page** in `client/src/pages/`
7. **Add route** in `client/src/App.tsx`
8. **Write tests** in `server/*.test.ts`
9. **Run tests**: `pnpm test`

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test
pnpm test -- filename.test.ts
```

## Module Documentation

### Available Modules

1. **Analytics** - Financial metrics and KPIs
2. **Projects** - Project management and budgeting
3. **Balance Sheets** - Financial position tracking
4. **Transactions** - Income and expense tracking
5. **Computing Tables** - Custom calculations
6. **Procurement** - Budget requests and approvals
7. **Product Bank** - Product catalog
8. **Agent Data** - Field data collection
9. **Sheet Comparison** - Compare financial statements
10. **Custom Analytics** - Personalized dashboards
11. **Collaboration** - Team discussions

See `MODULE_GUIDE.md` for detailed documentation on each module.

## User Documentation

### For End Users
- **USER_MANUAL.md** - Complete user guide with step-by-step instructions
- **QUICK_START.md** - 15-minute quick start guide
- **MODULE_GUIDE.md** - Detailed guide for each module

### For Developers
- **PLATFORM_DOCUMENTATION.md** - Architecture, API reference, and integration guide
- **README.md** - This file

## Deployment

### Docker

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

# API
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://api.manus.im

# Owner
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id
```

## Security

### Authentication
- OAuth 2.0 integration with Manus Auth
- JWT-based session management
- Secure cookie handling

### Authorization
- Role-based access control (RBAC)
- Workspace-level isolation
- Module-level permissions
- Action-level permissions (read, write, delete)

### Data Protection
- HTTPS only
- SQL injection prevention (Drizzle ORM)
- XSS protection (React)
- CSRF protection
- Rate limiting
- Webhook signature verification (HMAC-SHA256)

## Performance

### Optimization Strategies
- Database indexing on frequently queried columns
- Query result caching
- Lazy loading of components
- Code splitting
- CDN for static assets
- API rate limiting

### Monitoring
- Error tracking and logging
- Performance metrics
- User activity tracking
- API usage monitoring

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

[Your License Here]

## Support

- **Documentation**: https://docs.africount.com
- **Email**: support@africount.com
- **GitHub Issues**: https://github.com/your-org/africount/issues
- **Community Forum**: https://forum.africount.com

## Roadmap

### Q2 2026
- [ ] Mobile app (React Native)
- [ ] Advanced reporting engine
- [ ] Multi-currency support
- [ ] Automated reconciliation

### Q3 2026
- [ ] AI-powered expense categorization
- [ ] Real-time collaboration (WebSocket)
- [ ] Advanced forecasting models
- [ ] Integration marketplace

### Q4 2026
- [ ] Blockchain audit trail
- [ ] Advanced security features
- [ ] Enterprise features
- [ ] Global expansion

## Changelog

### Version 1.0 (April 2026)
- ✅ Multi-tenant architecture
- ✅ Financial tracking (transactions, balance sheets)
- ✅ Project management
- ✅ Analytics and reporting
- ✅ Team collaboration
- ✅ Webhook integration
- ✅ API access
- ✅ Role-based access control
- ✅ Dashboard customization
- ✅ Budget management

## Team

- **Product**: [Your Name]
- **Engineering**: [Your Name]
- **Design**: [Your Name]

## Acknowledgments

Built with:
- React 19
- Express.js
- tRPC
- Drizzle ORM
- Tailwind CSS
- And many other open-source projects

---

**Last Updated**: April 2026
**Version**: 1.0
**Status**: Production Ready ✅

For more information, see the documentation files included in this repository.
