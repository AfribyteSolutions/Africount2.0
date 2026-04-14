# Africount User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Core Modules](#core-modules)
4. [Advanced Features](#advanced-features)
5. [Collaboration & Commenting](#collaboration--commenting)
6. [Analytics & Reporting](#analytics--reporting)
7. [Settings & Administration](#settings--administration)
8. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Getting Started

### Logging In

1. Navigate to the Africount login page
2. Click "Sign in with Manus"
3. Enter your credentials
4. You'll be directed to your workspace dashboard

### First-Time Setup

**Step 1: Create Your Organization**
- Click "Settings" in the left sidebar
- Select "Organization"
- Enter your organization name and upload a logo
- Configure your organization's timezone and currency

**Step 2: Set Up Your Workspace**
- From the dashboard, click "Create Workspace"
- Name your workspace (e.g., "Finance Department", "Project Alpha")
- Invite team members by email
- Assign roles (Admin, Manager, Agent)

**Step 3: Configure Modules**
- Visit "Settings" → "Modules"
- Enable the modules your team needs:
  - Analytics
  - Projects
  - Balance Sheets
  - Computing Tables
  - Transactions
  - Procurement
  - Product Bank

---

## Dashboard Overview

### Main Navigation

The left sidebar contains quick access to all modules:

| Icon | Module | Purpose |
|------|--------|---------|
| 📊 | Overview | Dashboard home with key metrics |
| 📈 | Analytics | View financial metrics and trends |
| ⚙️ | Custom Analytics | Create personalized dashboards |
| 📁 | Projects | Manage projects and budgets |
| 📋 | Balance Sheets | Track assets, liabilities, equity |
| 🧮 | Computing Tables | Custom calculations and formulas |
| 💰 | Transactions | Record and manage transactions |
| 🛒 | Procurement | Budget requests and approvals |
| 📦 | Product Bank | Manage products and services |
| 👥 | Agent Data | Field data entry and collection |
| 📊 | Sheet Comparison | Compare financial statements |
| 💬 | Collaboration | Team comments and discussions |

### Key Metrics Widget

The Overview page displays:
- **Total Revenue**: Sum of all income transactions
- **Total Expenses**: Sum of all expense transactions
- **Net Profit/Loss**: Revenue minus expenses
- **Cash Flow**: Current cash position
- **Budget Status**: Approved vs. spent budgets

---

## Core Modules

### 1. Projects Module

**Purpose**: Manage projects, assign team members, track budgets

**Key Features**:
- Create new projects with descriptions
- Assign team members to projects
- Set project budgets and timelines
- Track project expenses
- Link projects to balance sheets

**How to Create a Project**:
1. Click "Projects" in the sidebar
2. Click "New Project"
3. Enter project name, description, and budget
4. Select team members to assign
5. Set start and end dates
6. Click "Create Project"

**Viewing Project Details**:
- Click on any project to see:
  - Team members assigned
  - Budget allocation
  - Expenses to date
  - Project timeline
  - Associated balance sheets

---

### 2. Balance Sheets Module

**Purpose**: Track financial position (assets, liabilities, equity)

**Key Features**:
- Create balance sheets for specific periods
- Add assets (cash, receivables, inventory, etc.)
- Add liabilities (payables, loans, etc.)
- Calculate equity automatically
- Compare balance sheets over time
- Export to PDF/Excel

**Creating a Balance Sheet**:
1. Click "Balance Sheets" in the sidebar
2. Click "New Balance Sheet"
3. Enter the period (e.g., "Q1 2026")
4. Add assets:
   - Click "Add Asset"
   - Enter name and amount
   - Categorize (Current/Fixed)
5. Add liabilities:
   - Click "Add Liability"
   - Enter name and amount
   - Categorize (Current/Long-term)
6. Equity is calculated automatically
7. Click "Save"

**Understanding the Balance Sheet**:
- **Assets**: What your organization owns
- **Liabilities**: What your organization owes
- **Equity**: Assets minus Liabilities (owner's stake)
- **Balance Sheet Equation**: Assets = Liabilities + Equity

---

### 3. Transactions Module

**Purpose**: Record and manage all financial transactions

**Key Features**:
- Create income and expense transactions
- Categorize transactions
- Filter by date, amount, category
- Attach receipts and documents
- Bulk import from CSV/Excel
- Export transaction history

**Recording a Transaction**:
1. Click "Transactions" in the sidebar
2. Click "New Transaction"
3. Select transaction type (Income/Expense)
4. Enter amount and date
5. Select category (e.g., "Salary", "Office Supplies")
6. Add description
7. Attach receipt (optional)
8. Click "Save"

**Transaction Categories**:
- **Income**: Sales, Services, Interest, Grants
- **Expenses**: Salary, Rent, Utilities, Equipment, Travel
- **Other**: Transfers, Adjustments

**Filtering Transactions**:
- Use the filter panel to search by:
  - Date range
  - Transaction type
  - Amount range
  - Category
  - Description

---

### 4. Computing Tables Module

**Purpose**: Create custom calculations and data tables

**Key Features**:
- Design custom table structures
- Add formulas for automatic calculations
- Track costs and revenues
- Version history
- Export results

**Creating a Computing Table**:
1. Click "Computing Tables" in the sidebar
2. Click "New Table"
3. Enter table name and description
4. Define columns:
   - Click "Add Column"
   - Enter column name and type (Text, Number, Date, Formula)
5. Define rows (e.g., "Q1", "Q2", "Q3", "Q4")
6. Add data and formulas
7. Click "Save"

**Using Formulas**:
- **SUM**: `=SUM(B2:B5)` - Add values
- **AVERAGE**: `=AVERAGE(B2:B5)` - Calculate average
- **IF**: `=IF(B2>1000, "High", "Low")` - Conditional logic
- **MULTIPLY**: `=B2*C2` - Multiply values

---

### 5. Procurement Module

**Purpose**: Manage budget requests, approvals, and purchasing

**Key Features**:
- Submit budget requests with line items
- Route requests for approval
- Track approval status
- Manage procurement audit trail
- Link to projects
- Track budget vs. actual spending

**Submitting a Budget Request**:
1. Click "Procurement" in the sidebar
2. Click "Submit Budget Request"
3. Select project (or create new)
4. Add line items:
   - Click "Add Item"
   - Select product or enter custom item
   - Enter quantity and unit price
   - Total calculates automatically
5. Add justification/notes
6. Click "Submit for Approval"

**Approval Workflow**:
- **Submitted**: Waiting for review
- **Approved**: Ready for purchase
- **Rejected**: Returned for revision
- **In Progress**: Purchase order created
- **Completed**: Goods received

**As an Approver**:
1. Click "Procurement" → "For Approval"
2. Review budget requests
3. Click "Approve" or "Reject"
4. Add comments if rejecting
5. Approved budgets appear in "Approved Budgets"

---

### 6. Product Bank Module

**Purpose**: Maintain a catalog of products and services

**Key Features**:
- Create product catalog
- Organize by categories
- Set pricing and discounts
- Track pricing history
- Use products in procurement

**Adding a Product**:
1. Click "Product Bank" in the sidebar
2. Click "New Product"
3. Enter product name and description
4. Select category or create new
5. Set base price
6. Add pricing tiers (optional)
7. Upload product image
8. Click "Save"

**Using Products in Procurement**:
- When creating a budget request, search for products
- Products auto-populate price and details
- Saves time and ensures consistency

---

### 7. Agent Data Module

**Purpose**: Collect field data from agents

**Key Features**:
- Mobile-friendly data entry forms
- Cash-in and cash-out tracking
- Personal account management
- Bulk data import
- Data validation

**Submitting Agent Data**:
1. Click "Agent Data" in the sidebar
2. Click "New Entry"
3. Select entry type (Cash In/Cash Out)
4. Enter amount and date
5. Select category
6. Add notes
7. Click "Submit"

**Viewing Agent Data**:
- See all entries submitted by your account
- Filter by date and type
- Export data for reporting

---

### 8. Sheet Comparison Module

**Purpose**: Compare financial statements across periods

**Key Features**:
- Side-by-side comparison
- Highlight differences
- Calculate variance
- Generate comparison reports
- Analyze trends

**Creating a Comparison**:
1. Click "Sheet Comparison" in the sidebar
2. Click "New Comparison"
3. Select two balance sheets to compare
4. System highlights differences
5. View variance analysis
6. Export report

---

## Advanced Features

### Custom Analytics Dashboard

**Purpose**: Create personalized dashboards with charts and metrics

**Creating a Custom Dashboard**:
1. Click "Custom Analytics" in the sidebar
2. Click "Create Dashboard"
3. Enter dashboard name
4. Click "Add Chart"
5. Select chart type:
   - Line Chart (trends over time)
   - Bar Chart (comparisons)
   - Pie Chart (proportions)
   - KPI Card (key metrics)
6. Configure chart:
   - Select metric to display
   - Set date range
   - Apply filters
7. Drag to resize and reposition
8. Click "Save Layout"

**Chart Types**:
- **Revenue vs Expenses**: Compare income and spending
- **Budget vs Actual**: Track budget performance
- **Cash Flow**: Monitor cash position over time
- **Project Performance**: Track project spending
- **Category Breakdown**: See expense distribution

**Saving Layouts**:
- Click "Save Layout"
- Enter layout name
- Mark as default (optional)
- Share with team (optional)

**Loading Saved Layouts**:
- Click "Load Layout"
- Select from saved layouts
- Layouts load with all charts and settings

---

### Data Import

**Purpose**: Bulk import data from CSV/Excel files

**Supported Formats**:
- CSV (.csv)
- Excel (.xlsx, .xls)

**Import Process**:
1. Click the module (Transactions, Balance Sheets, etc.)
2. Click "Import Data"
3. Select file from your computer
4. Map columns to fields
5. Review preview
6. Click "Import"

**Column Mapping**:
- Match your file columns to Africount fields
- System suggests matches automatically
- Manually adjust if needed

**Data Validation**:
- System checks for required fields
- Validates data types
- Shows errors before import
- Fix errors and retry

---

### Data Export

**Purpose**: Export data for external use

**Export Options**:
- **CSV**: Comma-separated values (Excel compatible)
- **Excel**: Full Excel workbook with formatting
- **PDF**: Formatted report for printing

**Exporting Data**:
1. Click the module
2. Click "Export"
3. Select format (CSV/Excel/PDF)
4. Choose date range (if applicable)
5. Click "Export"
6. File downloads to your computer

---

## Collaboration & Commenting

### Chart Comments

**Purpose**: Discuss charts and metrics with your team

**Adding a Comment**:
1. Click on any chart in Custom Analytics
2. Click the "💬 Comments" button
3. Type your comment
4. Click "Post"

**Mentioning Team Members**:
- Type `@` followed by their name
- Select from the dropdown
- They'll receive a notification

**Reacting to Comments**:
- Hover over a comment
- Click emoji reaction button
- Choose: 👍 ❤️ 😂 😮 😢 🔥

**Editing Comments**:
- Click the comment
- Click "Edit"
- Make changes
- Click "Save"

**Deleting Comments**:
- Click the comment
- Click "Delete"
- Confirm deletion

---

### Activity Feed

**Purpose**: Track all changes and activities

**Viewing Activity**:
1. Click "Collaboration" in the sidebar
2. See all recent activities:
   - New transactions created
   - Budget requests submitted
   - Comments posted
   - Data imported
   - Settings changed

**Filtering Activity**:
- Filter by type (Transactions, Comments, etc.)
- Filter by date
- Filter by user

---

## Analytics & Reporting

### Analytics Dashboard

**Purpose**: View financial metrics and trends

**Key Metrics**:
- **Revenue**: Total income
- **Expenses**: Total spending
- **Profit Margin**: (Revenue - Expenses) / Revenue × 100%
- **Cash Flow**: Money in minus money out
- **Budget Variance**: Budgeted vs. Actual spending

**Viewing Analytics**:
1. Click "Analytics" in the sidebar
2. Select date range
3. View charts and metrics
4. Drill down into specific categories
5. Export reports

**Date Range Filtering**:
- Last 7 days
- Last 30 days
- Last 90 days
- Last year
- Custom range

---

### Forecasting

**Purpose**: Predict future financial performance

**Available Forecasts**:
- **Cash Flow Forecast**: Predict cash position
- **Revenue Forecast**: Project income
- **Expense Forecast**: Project spending

**Using Forecasts**:
1. Click "Analytics" → "Forecasts"
2. Select forecast type
3. View prediction chart
4. See confidence level
5. Export forecast data

---

### Variance Reports

**Purpose**: Analyze budget vs. actual performance

**Understanding Variance**:
- **Favorable**: Actual spending less than budget (good)
- **Unfavorable**: Actual spending more than budget (bad)
- **Neutral**: Actual equals budget

**Viewing Variance Reports**:
1. Click "Analytics" → "Variance Reports"
2. Select period
3. View variance by category
4. See variance percentage
5. Read analysis and recommendations

---

## Settings & Administration

### Organization Settings

**Accessing Settings**:
1. Click your profile icon (top right)
2. Click "Settings"
3. Select "Organization"

**Organization Configuration**:
- **Name**: Your organization's name
- **Logo**: Upload company logo
- **Timezone**: Set default timezone
- **Currency**: Set default currency
- **Fiscal Year**: Define fiscal year start/end

---

### Workspace Management

**Creating a Workspace**:
1. Click "Settings" → "Workspaces"
2. Click "New Workspace"
3. Enter workspace name
4. Select modules to enable
5. Click "Create"

**Managing Workspace Members**:
1. Click "Settings" → "Team Members"
2. Click "Invite Member"
3. Enter email address
4. Select role:
   - **Admin**: Full access, can manage settings
   - **Manager**: Can view and edit data
   - **Agent**: Limited access, can enter data
5. Click "Send Invite"

**Member Roles**:

| Role | Permissions |
|------|-------------|
| Admin | Create/edit/delete all data, manage team, configure settings |
| Manager | Create/edit/delete data, view reports, manage projects |
| Agent | Create transactions, submit data, view own entries |

---

### Module Permissions

**Configuring Module Access**:
1. Click "Settings" → "Module Permissions"
2. Select module
3. For each role, choose permissions:
   - **Read**: View data
   - **Write**: Create and edit data
   - **Delete**: Delete data
4. Click "Save"

---

### API Keys & Webhooks

**Creating API Keys**:
1. Click "Settings" → "API Keys"
2. Click "Generate Key"
3. Enter key name
4. Select permissions
5. Set rate limit
6. Click "Generate"
7. Copy key (shown only once)

**Using API Keys**:
- Include in API requests: `Authorization: Bearer YOUR_API_KEY`
- Use for integrations with external systems

**Setting Up Webhooks**:
1. Click "Settings" → "Webhooks"
2. Click "New Webhook"
3. Enter webhook URL
4. Select event types to subscribe to
5. Configure retry policy
6. Click "Create"

**Webhook Events**:
- `transaction.created`: New transaction recorded
- `budget.approved`: Budget request approved
- `project.updated`: Project information changed
- `comment.created`: New comment posted

---

## FAQ & Troubleshooting

### Common Questions

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login page, enter your email, and follow the reset link.

**Q: Can I have multiple workspaces?**
A: Yes! Create multiple workspaces for different departments, projects, or clients.

**Q: How do I export all my data?**
A: Use the Export function in each module to download data as CSV or Excel.

**Q: Can I undo a deleted transaction?**
A: Deleted transactions cannot be recovered. Always review before deleting.

**Q: How do I invite team members?**
A: Go to Settings → Team Members → Invite Member. Enter their email and select a role.

**Q: What's the difference between Admin and Manager roles?**
A: Admins can manage settings and team members. Managers can only work with data.

**Q: Can I customize the dashboard?**
A: Yes! Use Custom Analytics to create personalized dashboards with your choice of charts.

**Q: How do I import data from my old system?**
A: Use the Import Data feature. Prepare a CSV or Excel file matching the required format.

---

### Troubleshooting

**Problem: I can't see a module**
- **Solution**: Check if the module is enabled in Settings → Modules. Ask your admin to enable it.

**Problem: I'm getting a permission error**
- **Solution**: You may not have access to that action. Ask your admin to adjust your permissions.

**Problem: My import failed**
- **Solution**: Check the error message. Common issues: missing required fields, wrong data type. Fix and retry.

**Problem: Charts aren't loading**
- **Solution**: Try refreshing the page. If it persists, contact support.

**Problem: I forgot my password**
- **Solution**: Click "Forgot Password" on the login page and follow the email instructions.

---

### Getting Help

**Need more help?**
- Check the in-app help tooltips (hover over ?)
- Contact your workspace admin
- Email support@africount.com
- Visit our knowledge base at docs.africount.com

---

## Best Practices

### Data Entry

1. **Be Consistent**: Use the same categories and naming conventions
2. **Be Timely**: Enter transactions as they occur, not in bulk later
3. **Be Accurate**: Double-check amounts and dates
4. **Add Context**: Include descriptions for clarity

### Financial Management

1. **Regular Reviews**: Check analytics weekly or monthly
2. **Monitor Budgets**: Track spending against budgets
3. **Reconcile**: Compare your records with bank statements
4. **Archive**: Export and backup data regularly

### Team Collaboration

1. **Use Comments**: Discuss transactions and decisions
2. **Assign Clearly**: Make sure everyone knows their responsibilities
3. **Document Changes**: Add notes when making significant changes
4. **Review Together**: Use comparisons to discuss financial performance

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New entry in current module |
| `Ctrl + S` | Save |
| `Ctrl + E` | Export |
| `Ctrl + I` | Import |
| `/` | Search |
| `?` | Help |

---

**Last Updated**: April 2026
**Version**: 1.0
**For support, contact**: support@africount.com
