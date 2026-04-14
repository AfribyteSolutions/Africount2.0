# Africount - Enterprise Financial Management Platform

**Africount** is a sophisticated, multi-tenant bookkeeping and financial management platform designed for teams that demand precision, collaboration, and beautiful design. Built with Next.js, React, and a comprehensive backend architecture, Africount provides enterprise-grade financial management with an elegant user interface.

## 🎯 Core Features

### 1. **Multi-Tenant Architecture**
- Complete organizational and workspace isolation
- Support for multiple organizations and workspaces per user
- Workspace switching and management
- Tenant-aware data persistence and access control

### 2. **Project Management**
- Create and manage multiple projects
- Assign team members to projects
- Project-level settings and access control
- Activity tracking and project history

### 3. **Balance Sheet Management**
- Create and manage balance sheets
- Separate sections for Assets, Liabilities, and Equity
- Automatic calculation of totals and net worth
- File import capabilities for each section
- Balance sheet versioning and history tracking

### 4. **Custom Computing Tables**
- Create custom tables with configurable rows and columns
- Formula-based auto-calculations
- Cost and revenue tracking
- Table templates and data visualization
- Table history and versioning

### 5. **Agent Field Data Entry**
- Individual cash-in and cash-out tracking
- Customizable sheet structures
- Personal account management
- Data validation and error handling
- Bulk entry operations

### 6. **CSV & Excel Import System**
- File upload interface with drag-and-drop
- CSV and Excel parsing
- Field mapping interface
- Data validation and preview
- Import history tracking
- Duplicate detection

### 7. **Transaction Management**
- Comprehensive transaction list with filtering
- Filter by date, name, amount, and category
- Advanced search functionality
- Transaction detail views
- Transaction editing and deletion with audit trail
- Bulk operations support

### 8. **Sheet Comparison Module**
- Side-by-side sheet display
- Diff highlighting algorithm
- Comparison statistics and analysis
- Comparison export functionality
- Comparison history and filtering

### 9. **Collaboration Features**
- Inline commenting system
- Comment threads and notifications
- Activity feed with real-time updates
- Complete audit trail logging
- Change history interface
- User mention functionality

### 10. **Role-Based Access Control (RBAC)**
- Three-tier role system: Admin, Manager, Agent
- Module-level permission assignment
- Granular access control
- Permission management interface
- Workspace-level access control

### 11. **User Management**
- Team member invitation system
- Role assignment and management
- Member status tracking
- Activity monitoring
- Permission updates

### 12. **Workspace Management**
- Multiple workspace support
- Workspace creation and switching
- Workspace settings and configuration
- Member management per workspace

### 13. **Audit Logging**
- Comprehensive activity tracking
- Filtering by user, action, and date
- Export audit logs as CSV
- Activity statistics
- Compliance tracking

### 14. **Notifications**
- System alerts and updates
- Notification management
- Unread notification tracking
- Notification preferences
- Email and in-app notifications

### 15. **Data Export**
- CSV export for all modules
- Excel export functionality
- Export templates
- Scheduled export feature
- Multi-format export support

## 🎨 Design & Branding

### Africount Brand Identity
- **Primary Color**: Deep Blue (#1e40af)
- **Accent Color**: Vibrant Orange (#ff6b35)
- **Typography**: Professional sans-serif with clear hierarchy
- **Design Philosophy**: Elegant, refined, and trustworthy

### UI Components
- Responsive design for mobile, tablet, and desktop
- Consistent component library using shadcn/ui
- Tailwind CSS for utility-first styling
- Smooth animations and transitions
- Accessible focus states and keyboard navigation

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: React Query + tRPC
- **Routing**: Wouter

### Backend Stack
- **Runtime**: Node.js with Express
- **API**: tRPC for type-safe API
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **File Storage**: S3

### Database Schema
- **users**: Core user table with OAuth integration
- **organizations**: Organization management
- **workspaces**: Multi-workspace support
- **workspace_members**: Role-based access
- **module_permissions**: Granular permission control
- **projects**: Project management
- **project_members**: Project team assignment
- **balance_sheets**: Balance sheet tracking
- **balance_sheet_items**: Assets, liabilities, equity items
- **computing_tables**: Custom table definitions
- **computing_table_rows**: Row data
- **computing_table_columns**: Column definitions
- **transactions**: Transaction records
- **sheet_imports**: Import history
- **sheet_comparisons**: Comparison records
- **comments**: Collaboration comments
- **activity_logs**: Audit trail

## 🚀 Getting Started

### Installation
```bash
cd /home/ubuntu/africount
pnpm install
```

### Development
```bash
# Start development server
pnpm dev

# Run TypeScript check
pnpm check

# Run tests
pnpm test
```

### Database
```bash
# Generate migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate
```

### Build & Deploy
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📋 Module Navigation

Access all modules from the Dashboard sidebar:

- **Overview**: Dashboard home with overview widgets
- **Projects**: Project creation and management
- **Balance Sheets**: Balance sheet management
- **Computing Tables**: Custom table creation
- **Transactions**: Transaction management
- **Agent Data**: Field data entry
- **Sheet Comparison**: Compare two sheets
- **Import Data**: CSV/Excel import
- **Collaboration**: Comments and activity
- **Export Data**: Data export
- **Organizations**: Organization settings
- **Access Control**: RBAC management
- **User Management**: Team member management
- **Workspaces**: Workspace management
- **Audit Logs**: Activity tracking
- **Notifications**: System notifications

## 🔐 Security Features

- **Multi-tenant isolation**: Complete data separation between organizations
- **Role-based access control**: Granular permission management
- **Audit logging**: Complete activity tracking
- **Session management**: Secure OAuth-based authentication
- **Data validation**: Input validation on all forms
- **Error handling**: Comprehensive error handling with user feedback

## 📊 Data Management

### Import Capabilities
- CSV file import with field mapping
- Excel file import with validation
- Batch transaction import
- Balance sheet section import
- Duplicate detection and handling

### Export Capabilities
- CSV export for all modules
- Excel export with formatting
- Scheduled exports
- Custom export templates
- Multi-format support

### Calculations
- Automatic balance sheet calculations
- Formula-based table calculations
- Cost and revenue tracking
- Net worth calculation
- Comparison statistics

## 🎯 User Roles

### Admin
- Full system access
- Organization management
- User and permission management
- Workspace management
- Audit log access

### Manager
- Project management
- Team member assignment
- Balance sheet management
- Data import and export
- Collaboration features

### Agent
- Data entry (cash-in/cash-out)
- Transaction viewing
- Personal account management
- Collaboration features
- Limited access to other modules

## 📱 Responsive Design

Africount is fully responsive and works seamlessly on:
- **Desktop**: Full feature set with optimized layout
- **Tablet**: Adapted interface with touch-friendly controls
- **Mobile**: Streamlined interface with essential features

## 🔄 Real-Time Features

- Activity feed updates
- Notification system
- Collaboration comments
- Audit trail logging
- Change history tracking

## 📈 Performance Optimizations

- Lazy loading of modules
- Optimistic updates for better UX
- Efficient data querying with tRPC
- Caching strategies
- Code splitting and bundling

## 🛠️ Development Guidelines

### Adding New Features
1. Update database schema in `drizzle/schema.ts`
2. Generate migrations with `pnpm drizzle-kit generate`
3. Add database helpers in `server/db.ts`
4. Create tRPC procedures in `server/routers.ts`
5. Build UI components in `client/src/pages/`
6. Write tests in `server/*.test.ts`

### Code Structure
```
africount/
├── client/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   └── public/              # Static assets
├── server/
│   ├── db.ts                # Database helpers
│   ├── routers.ts           # tRPC procedures
│   ├── _core/               # Framework code
│   └── *.test.ts            # Tests
├── drizzle/
│   ├── schema.ts            # Database schema
│   └── migrations/          # SQL migrations
├── storage/                 # S3 helpers
└── shared/                  # Shared constants
```

## 🧪 Testing

Run tests with:
```bash
pnpm test
```

Tests are located in `server/*.test.ts` files and cover:
- Authentication flows
- Database operations
- tRPC procedures
- Permission checking
- Data validation

## 📝 License

Africount is proprietary software. All rights reserved.

## 🤝 Support

For support, documentation, or feature requests, please contact the development team.

---

**Africount**: Enterprise Financial Management Made Elegant
