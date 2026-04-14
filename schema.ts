import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
  uniqueIndex,
  index,
  date,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with workspace preferences and multi-tenancy support.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  currentWorkspaceId: int("currentWorkspaceId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Organizations table for multi-tenancy support
 */
export const organizations = mysqlTable(
  "organizations",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logo: text("logo"),
    description: text("description"),
    ownerId: int("ownerId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("owner_idx").on(table.ownerId),
  })
);

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Workspaces table for workspace management within organizations
 */
export const workspaces = mysqlTable(
  "workspaces",
  {
    id: int("id").autoincrement().primaryKey(),
    organizationId: int("organizationId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orgIdx: index("org_idx").on(table.organizationId),
  })
);

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

/**
 * Workspace members with role-based access control
 */
export const workspaceMembers = mysqlTable(
  "workspace_members",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["admin", "manager", "agent"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceUserIdx: uniqueIndex("workspace_user_idx").on(
      table.workspaceId,
      table.userId
    ),
    workspaceIdx: index("workspace_idx").on(table.workspaceId),
    userIdx: index("user_idx").on(table.userId),
  })
);

export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

/**
 * Module-level permissions for granular access control
 */
export const modulePermissions = mysqlTable(
  "module_permissions",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceMemberId: int("workspaceMemberId").notNull(),
    module: mysqlEnum("module", [
      "projects",
      "balance_sheets",
      "computing_tables",
      "agent_data",
      "transactions",
      "comparisons",
      "collaboration",
      "exports",
    ]).notNull(),
    canRead: boolean("canRead").default(true).notNull(),
    canWrite: boolean("canWrite").default(false).notNull(),
    canDelete: boolean("canDelete").default(false).notNull(),
    canManagePermissions: boolean("canManagePermissions").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    memberIdx: index("member_idx").on(table.workspaceMemberId),
  })
);

export type ModulePermission = typeof modulePermissions.$inferSelect;
export type InsertModulePermission = typeof modulePermissions.$inferInsert;

/**
 * Projects table for project management
 */
export const projects = mysqlTable(
  "projects",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["active", "archived", "completed"]).default("active").notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("workspace_idx").on(table.workspaceId),
  })
);

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project members with role-based access
 */
export const projectMembers = mysqlTable(
  "project_members",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    userId: int("userId").notNull(),
    role: mysqlEnum("role", ["owner", "editor", "viewer"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectUserIdx: uniqueIndex("project_user_idx").on(table.projectId, table.userId),
    projectIdx: index("project_idx").on(table.projectId),
  })
);

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;

/**
 * Balance sheets table
 */
export const balanceSheets = mysqlTable(
  "balance_sheets",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    period: varchar("period", { length: 50 }),
    totalAssets: decimal("totalAssets", { precision: 15, scale: 2 }).default("0"),
    totalLiabilities: decimal("totalLiabilities", { precision: 15, scale: 2 }).default("0"),
    totalEquity: decimal("totalEquity", { precision: 15, scale: 2 }).default("0"),
    netWorth: decimal("netWorth", { precision: 15, scale: 2 }).default("0"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
  })
);

export type BalanceSheet = typeof balanceSheets.$inferSelect;
export type InsertBalanceSheet = typeof balanceSheets.$inferInsert;

/**
 * Balance sheet items (assets, liabilities, equity)
 */
export const balanceSheetItems = mysqlTable(
  "balance_sheet_items",
  {
    id: int("id").autoincrement().primaryKey(),
    balanceSheetId: int("balanceSheetId").notNull(),
    section: mysqlEnum("section", ["assets", "liabilities", "equity"]).notNull(),
    category: varchar("category", { length: 255 }).notNull(),
    description: text("description"),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    sourceFile: varchar("sourceFile", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    balanceSheetIdx: index("balance_sheet_idx").on(table.balanceSheetId),
  })
);

export type BalanceSheetItem = typeof balanceSheetItems.$inferSelect;
export type InsertBalanceSheetItem = typeof balanceSheetItems.$inferInsert;

/**
 * Computing tables for custom calculations
 */
export const computingTables = mysqlTable(
  "computing_tables",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: mysqlEnum("type", ["cost_tracking", "revenue_tracking", "custom"]).notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
  })
);

export type ComputingTable = typeof computingTables.$inferSelect;
export type InsertComputingTable = typeof computingTables.$inferInsert;

/**
 * Computing table columns
 */
export const computingTableColumns = mysqlTable(
  "computing_table_columns",
  {
    id: int("id").autoincrement().primaryKey(),
    tableId: int("tableId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["text", "number", "date", "formula"]).notNull(),
    formula: text("formula"),
    order: int("order").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    tableIdx: index("table_idx").on(table.tableId),
  })
);

export type ComputingTableColumn = typeof computingTableColumns.$inferSelect;
export type InsertComputingTableColumn = typeof computingTableColumns.$inferInsert;

/**
 * Computing table rows with data
 */
export const computingTableRows = mysqlTable(
  "computing_table_rows",
  {
    id: int("id").autoincrement().primaryKey(),
    tableId: int("tableId").notNull(),
    rowData: json("rowData").$type<Record<string, unknown>>().notNull(),
    order: int("order").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tableIdx: index("table_idx").on(table.tableId),
  })
);

export type ComputingTableRow = typeof computingTableRows.$inferSelect;
export type InsertComputingTableRow = typeof computingTableRows.$inferInsert;

/**
 * Transactions table for comprehensive transaction tracking
 */
export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    type: mysqlEnum("type", ["cash_in", "cash_out", "transfer", "adjustment"]).notNull(),
    date: timestamp("date").notNull(),
    description: varchar("description", { length: 500 }),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    category: varchar("category", { length: 255 }),
    account: varchar("account", { length: 255 }),
    reference: varchar("reference", { length: 255 }),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
    dateIdx: index("date_idx").on(table.date),
    typeIdx: index("type_idx").on(table.type),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Sheet imports for tracking imported files
 */
export const sheetImports = mysqlTable(
  "sheet_imports",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileType: mysqlEnum("fileType", ["csv", "excel"]).notNull(),
    section: mysqlEnum("section", ["assets", "liabilities", "equity", "transactions", "general"]),
    rowCount: int("rowCount").notNull(),
    fieldMapping: json("fieldMapping").$type<Record<string, string>>().notNull(),
    importedBy: int("importedBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
  })
);

export type SheetImport = typeof sheetImports.$inferSelect;
export type InsertSheetImport = typeof sheetImports.$inferInsert;

/**
 * Sheet comparisons for tracking comparison history
 */
export const sheetComparisons = mysqlTable(
  "sheet_comparisons",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    firstSheetId: int("firstSheetId").notNull(),
    secondSheetId: int("secondSheetId").notNull(),
    comparisonData: longtext("comparisonData"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
  })
);

export type SheetComparison = typeof sheetComparisons.$inferSelect;
export type InsertSheetComparison = typeof sheetComparisons.$inferInsert;

/**
 * Comments for collaboration
 */
export const comments = mysqlTable(
  "comments",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    entityType: mysqlEnum("entityType", [
      "balance_sheet",
      "transaction",
      "computing_table",
      "sheet_import",
      "general",
    ]).notNull(),
    entityId: int("entityId").notNull(),
    userId: int("userId").notNull(),
    content: text("content").notNull(),
    parentCommentId: int("parentCommentId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
    entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  })
);

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Activity logs for audit trail
 */
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    entityType: varchar("entityType", { length: 100 }).notNull(),
    entityId: int("entityId").notNull(),
    changes: json("changes").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index("project_idx").on(table.projectId),
    userIdx: index("user_idx").on(table.userId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Agent accounts for field data entry
 */
export const agentAccounts = mysqlTable(
  "agent_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    userId: int("userId").notNull(),
    accountName: varchar("accountName", { length: 255 }).notNull(),
    accountType: mysqlEnum("accountType", ["cash", "bank", "mobile_money", "other"]).notNull(),
    customFields: json("customFields").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectUserIdx: uniqueIndex("project_user_idx").on(table.projectId, table.userId),
    projectIdx: index("project_idx").on(table.projectId),
  })
);

export type AgentAccount = typeof agentAccounts.$inferSelect;
export type InsertAgentAccount = typeof agentAccounts.$inferInsert;

/**
 * Agent entries for cash-in and cash-out
 */
export const agentEntries = mysqlTable(
  "agent_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    accountId: int("accountId").notNull(),
    entryType: mysqlEnum("entryType", ["cash_in", "cash_out"]).notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    description: varchar("description", { length: 500 }),
    date: timestamp("date").notNull(),
    reference: varchar("reference", { length: 255 }),
    customData: json("customData").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    accountIdx: index("account_idx").on(table.accountId),
    dateIdx: index("date_idx").on(table.date),
  })
);

export type AgentEntry = typeof agentEntries.$inferSelect;
export type InsertAgentEntry = typeof agentEntries.$inferInsert;


/**
 * Budget requests for procurement workflow
 */
export const budgetRequests = mysqlTable(
  "budget_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId"),
    workspaceId: int("workspaceId").notNull(),
    submittedBy: int("submittedBy").notNull(),
    approvedBy: int("approvedBy"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", [
      "submitted",
      "approved",
      "rejected",
      "in_progress",
      "completed",
    ])
      .default("submitted")
      .notNull(),
    totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
    approvalComments: text("approvalComments"),
    rejectionReason: text("rejectionReason"),
    balanceSheetSection: mysqlEnum("balanceSheetSection", [
      "assets",
      "liabilities",
      "equity",
      "expense",
      "revenue",
    ]),
    category: varchar("category", { length: 255 }),
    priority: mysqlEnum("priority", ["low", "medium", "high", "critical"])
      .default("medium")
      .notNull(),
    dueDate: timestamp("dueDate"),
    attachments: json("attachments").$type<Array<{ url: string; name: string }>>(),
    customFields: json("customFields").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("budget_workspace_idx").on(table.workspaceId),
    projectIdx: index("budget_project_idx").on(table.projectId),
    submittedByIdx: index("budget_submitted_by_idx").on(table.submittedBy),
    statusIdx: index("budget_status_idx").on(table.status),
  })
);

export type BudgetRequest = typeof budgetRequests.$inferSelect;
export type InsertBudgetRequest = typeof budgetRequests.$inferInsert;

/**
 * Budget line items for detailed procurement breakdown
 */
export const budgetLineItems = mysqlTable(
  "budget_line_items",
  {
    id: int("id").autoincrement().primaryKey(),
    budgetRequestId: int("budgetRequestId").notNull(),
    itemName: varchar("itemName", { length: 255 }).notNull(),
    description: text("description"),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
    totalPrice: decimal("totalPrice", { precision: 15, scale: 2 }).notNull(),
    category: varchar("category", { length: 255 }),
    vendor: varchar("vendor", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    budgetRequestIdx: index("line_item_budget_idx").on(table.budgetRequestId),
  })
);

export type BudgetLineItem = typeof budgetLineItems.$inferSelect;
export type InsertBudgetLineItem = typeof budgetLineItems.$inferInsert;

/**
 * Budget approvals workflow tracking
 */
export const budgetApprovals = mysqlTable(
  "budget_approvals",
  {
    id: int("id").autoincrement().primaryKey(),
    budgetRequestId: int("budgetRequestId").notNull(),
    approverUserId: int("approverUserId").notNull(),
    approvalStatus: mysqlEnum("approvalStatus", [
      "pending",
      "approved",
      "rejected",
      "commented",
    ])
      .default("pending")
      .notNull(),
    approvalComments: text("approvalComments"),
    approvalDate: timestamp("approvalDate"),
    linkedProjectId: int("linkedProjectId"),
    linkedBalanceSheetId: int("linkedBalanceSheetId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    budgetRequestIdx: index("approval_budget_idx").on(table.budgetRequestId),
    approverIdx: index("approval_approver_idx").on(table.approverUserId),
  })
);

export type BudgetApproval = typeof budgetApprovals.$inferSelect;
export type InsertBudgetApproval = typeof budgetApprovals.$inferInsert;

/**
 * Procurement audit trail
 */
export const procurementAudit = mysqlTable(
  "procurement_audit",
  {
    id: int("id").autoincrement().primaryKey(),
    budgetRequestId: int("budgetRequestId").notNull(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    details: json("details").$type<Record<string, unknown>>(),
    previousStatus: varchar("previousStatus", { length: 100 }),
    newStatus: varchar("newStatus", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    budgetRequestIdx: index("audit_budget_idx").on(table.budgetRequestId),
    userIdx: index("audit_user_idx").on(table.userId),
    createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
  })
);

export type ProcurementAudit = typeof procurementAudit.$inferSelect;
export type InsertProcurementAudit = typeof procurementAudit.$inferInsert;


/**
 * Product categories for organizing products and services
 */
export const productCategories = mysqlTable(
  "product_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 100 }),
    color: varchar("color", { length: 50 }),
    order: int("order").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("category_workspace_idx").on(table.workspaceId),
  })
);

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

/**
 * Products and services bank for reusable procurement items
 */
export const productServices = mysqlTable(
  "product_services",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    categoryId: int("categoryId"),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    sku: varchar("sku", { length: 100 }).unique(),
    type: mysqlEnum("type", ["product", "service"]).default("product").notNull(),
    unitOfMeasure: varchar("unitOfMeasure", { length: 50 }).default("unit"),
    basePrice: decimal("basePrice", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    vendor: varchar("vendor", { length: 255 }),
    vendorSku: varchar("vendorSku", { length: 100 }),
    specifications: json("specifications").$type<Record<string, unknown>>(),
    tags: json("tags").$type<string[]>(),
    isActive: boolean("isActive").default(true),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("product_workspace_idx").on(table.workspaceId),
    categoryIdx: index("product_category_idx").on(table.categoryId),
    skuIdx: uniqueIndex("product_sku_idx").on(table.sku),
    activeIdx: index("product_active_idx").on(table.isActive),
  })
);

export type ProductService = typeof productServices.$inferSelect;
export type InsertProductService = typeof productServices.$inferInsert;

/**
 * Product attachments for images and documents
 */
export const productAttachments = mysqlTable(
  "product_attachments",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileUrl: text("fileUrl").notNull(),
    fileType: varchar("fileType", { length: 50 }),
    fileSize: int("fileSize"),
    attachmentType: mysqlEnum("attachmentType", ["image", "document", "specification", "other"])
      .default("document")
      .notNull(),
    order: int("order").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("attachment_product_idx").on(table.productId),
  })
);

export type ProductAttachment = typeof productAttachments.$inferSelect;
export type InsertProductAttachment = typeof productAttachments.$inferInsert;

/**
 * Product pricing history for tracking price changes
 */
export const productPricingHistory = mysqlTable(
  "product_pricing_history",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    price: decimal("price", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    vendor: varchar("vendor", { length: 255 }),
    effectiveDate: timestamp("effectiveDate").notNull(),
    expiryDate: timestamp("expiryDate"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("pricing_product_idx").on(table.productId),
    effectiveDateIdx: index("pricing_effective_date_idx").on(table.effectiveDate),
  })
);

export type ProductPricingHistory = typeof productPricingHistory.$inferSelect;
export type InsertProductPricingHistory = typeof productPricingHistory.$inferInsert;

/**
 * Budget imports tracking for CSV/Excel imports
 */
export const budgetImports = mysqlTable(
  "budget_imports",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    importedBy: int("importedBy").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileType: mysqlEnum("fileType", ["csv", "excel"]).notNull(),
    totalRows: int("totalRows").notNull(),
    successfulRows: int("successfulRows").default(0),
    failedRows: int("failedRows").default(0),
    fieldMapping: json("fieldMapping").$type<Record<string, string>>(),
    importStatus: mysqlEnum("importStatus", ["pending", "processing", "completed", "failed"])
      .default("pending")
      .notNull(),
    errorLog: json("errorLog").$type<Array<{ row: number; error: string }>>(),
    linkedBudgetRequestId: int("linkedBudgetRequestId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("import_workspace_idx").on(table.workspaceId),
    importedByIdx: index("import_imported_by_idx").on(table.importedBy),
    statusIdx: index("import_status_idx").on(table.importStatus),
  })
);

export type BudgetImport = typeof budgetImports.$inferSelect;
export type InsertBudgetImport = typeof budgetImports.$inferInsert;

/**
 * Budget import line items tracking
 */
export const budgetImportLineItems = mysqlTable(
  "budget_import_line_items",
  {
    id: int("id").autoincrement().primaryKey(),
    budgetImportId: int("budgetImportId").notNull(),
    rowNumber: int("rowNumber").notNull(),
    itemName: varchar("itemName", { length: 255 }).notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
    totalPrice: decimal("totalPrice", { precision: 15, scale: 2 }).notNull(),
    category: varchar("category", { length: 255 }),
    vendor: varchar("vendor", { length: 255 }),
    notes: text("notes"),
    linkedProductId: int("linkedProductId"),
    importStatus: mysqlEnum("importStatus", ["pending", "imported", "skipped", "error"])
      .default("pending")
      .notNull(),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    budgetImportIdx: index("import_line_budget_import_idx").on(table.budgetImportId),
    statusIdx: index("import_line_status_idx").on(table.importStatus),
  })
);

export type BudgetImportLineItem = typeof budgetImportLineItems.$inferSelect;
export type InsertBudgetImportLineItem = typeof budgetImportLineItems.$inferInsert;


/**
 * Webhooks table for external integrations
 */
export const webhooks = mysqlTable(
  "webhooks",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),
    events: json("events").$type<string[]>().notNull(), // e.g., ["transaction.created", "budget.approved"]
    secret: varchar("secret", { length: 255 }).notNull(), // For HMAC signature verification
    active: boolean("active").default(true).notNull(),
    retryPolicy: json("retryPolicy").$type<{ maxRetries: number; backoffMultiplier: number }>().default({ maxRetries: 5, backoffMultiplier: 2 }),
    headers: json("headers").$type<Record<string, string>>(), // Custom headers to send with webhook
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("webhook_workspace_idx").on(table.workspaceId),
    activeIdx: index("webhook_active_idx").on(table.active),
  })
);

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Webhook events table for tracking events to be delivered
 */
export const webhookEvents = mysqlTable(
  "webhook_events",
  {
    id: int("id").autoincrement().primaryKey(),
    webhookId: int("webhookId").notNull(),
    eventType: varchar("eventType", { length: 255 }).notNull(), // e.g., "transaction.created"
    payload: json("payload").$type<Record<string, unknown>>().notNull(),
    status: mysqlEnum("status", ["pending", "delivered", "failed", "skipped"])
      .default("pending")
      .notNull(),
    retryCount: int("retryCount").default(0).notNull(),
    nextRetryAt: timestamp("nextRetryAt"),
    failureReason: text("failureReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    deliveredAt: timestamp("deliveredAt"),
  },
  (table) => ({
    webhookIdx: index("event_webhook_idx").on(table.webhookId),
    statusIdx: index("event_status_idx").on(table.status),
    nextRetryIdx: index("event_next_retry_idx").on(table.nextRetryAt),
  })
);

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

/**
 * Webhook deliveries table for tracking delivery attempts
 */
export const webhookDeliveries = mysqlTable(
  "webhook_deliveries",
  {
    id: int("id").autoincrement().primaryKey(),
    webhookEventId: int("webhookEventId").notNull(),
    attemptNumber: int("attemptNumber").notNull(),
    statusCode: int("statusCode"),
    responseBody: text("responseBody"),
    responseTime: int("responseTime"), // in milliseconds
    success: boolean("success").notNull(),
    error: text("error"),
    deliveredAt: timestamp("deliveredAt").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("delivery_event_idx").on(table.webhookEventId),
    successIdx: index("delivery_success_idx").on(table.success),
  })
);

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = typeof webhookDeliveries.$inferInsert;

/**
 * API Keys table for external API access
 */
export const apiKeys = mysqlTable(
  "api_keys",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    keyHash: varchar("keyHash", { length: 255 }).notNull().unique(), // Hashed API key
    permissions: json("permissions").$type<string[]>().notNull(), // e.g., ["read:transactions", "write:projects"]
    rateLimit: int("rateLimit").default(1000).notNull(), // requests per hour
    active: boolean("active").default(true).notNull(),
    lastUsedAt: timestamp("lastUsedAt"),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("apikey_workspace_idx").on(table.workspaceId),
    activeIdx: index("apikey_active_idx").on(table.active),
  })
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Rate limit tracking table
 */
export const rateLimitKeys = mysqlTable(
  "rate_limit_keys",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(), // API key or IP address
    limit: int("limit").notNull(), // requests allowed
    window: int("window").notNull(), // time window in seconds
    count: int("count").default(0).notNull(), // current count
    resetAt: timestamp("resetAt").notNull(),
  },
  (table) => ({
    keyIdx: index("ratelimit_key_idx").on(table.key),
    resetIdx: index("ratelimit_reset_idx").on(table.resetAt),
  })
);

export type RateLimitKey = typeof rateLimitKeys.$inferSelect;
export type InsertRateLimitKey = typeof rateLimitKeys.$inferInsert;


/**
 * Dashboard layouts table for storing user-customized dashboard configurations
 */
export const dashboardLayouts = mysqlTable(
  "dashboard_layouts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    workspaceId: int("workspaceId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    layoutConfig: json("layoutConfig").$type<{
      charts: Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        size: { w: number; h: number };
        filters?: Record<string, unknown>;
      }>;
    }>().notNull(),
    isDefault: boolean("isDefault").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userWorkspaceIdx: index("dashboard_user_workspace_idx").on(table.userId, table.workspaceId),
    defaultIdx: index("dashboard_default_idx").on(table.isDefault),
  })
);

export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type InsertDashboardLayout = typeof dashboardLayouts.$inferInsert;

/**
 * Dashboard presets table for sharing common dashboard configurations
 */
export const dashboardPresets = mysqlTable(
  "dashboard_presets",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    layoutConfig: json("layoutConfig").$type<{
      charts: Array<{
        id: string;
        type: string;
        position: { x: number; y: number };
        size: { w: number; h: number };
        filters?: Record<string, unknown>;
      }>;
    }>().notNull(),
    createdBy: int("createdBy").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("preset_workspace_idx").on(table.workspaceId),
    publicIdx: index("preset_public_idx").on(table.isPublic),
  })
);

export type DashboardPreset = typeof dashboardPresets.$inferSelect;
export type InsertDashboardPreset = typeof dashboardPresets.$inferInsert;


/**
 * Chart comments table for team collaboration on dashboard charts
 */
export const chartComments = mysqlTable(
  "chart_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    chartId: varchar("chartId", { length: 255 }).notNull(), // Reference to chart (dashboard_layouts.charts[].id)
    workspaceId: int("workspaceId").notNull(),
    userId: int("userId").notNull(),
    content: text("content").notNull(),
    parentCommentId: int("parentCommentId"), // For threaded replies
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    chartIdx: index("comment_chart_idx").on(table.chartId),
    workspaceIdx: index("comment_workspace_idx").on(table.workspaceId),
    userIdx: index("comment_user_idx").on(table.userId),
    parentIdx: index("comment_parent_idx").on(table.parentCommentId),
  })
);

export type ChartComment = typeof chartComments.$inferSelect;
export type InsertChartComment = typeof chartComments.$inferInsert;

/**
 * Comment reactions table for emoji reactions
 */
export const commentReactions = mysqlTable(
  "comment_reactions",
  {
    id: int("id").autoincrement().primaryKey(),
    commentId: int("commentId").notNull(),
    userId: int("userId").notNull(),
    reactionType: varchar("reactionType", { length: 50 }).notNull(), // emoji or reaction name
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    commentIdx: index("reaction_comment_idx").on(table.commentId),
    userIdx: index("reaction_user_idx").on(table.userId),
    uniqueReaction: index("reaction_unique_idx").on(table.commentId, table.userId, table.reactionType),
  })
);

export type CommentReaction = typeof commentReactions.$inferSelect;
export type InsertCommentReaction = typeof commentReactions.$inferInsert;

/**
 * Comment mentions table for @mentions
 */
export const commentMentions = mysqlTable(
  "comment_mentions",
  {
    id: int("id").autoincrement().primaryKey(),
    commentId: int("commentId").notNull(),
    mentionedUserId: int("mentionedUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    commentIdx: index("mention_comment_idx").on(table.commentId),
    userIdx: index("mention_user_idx").on(table.mentionedUserId),
  })
);

export type CommentMention = typeof commentMentions.$inferSelect;
export type InsertCommentMention = typeof commentMentions.$inferInsert;


/**
 * Analytics metrics table for storing calculated KPIs and metrics
 */
export const analyticsMetrics = mysqlTable(
  "analytics_metrics",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    projectId: int("projectId"),
    metricType: varchar("metricType", { length: 100 }).notNull(), // e.g., "revenue", "expense", "profit", "cash_flow"
    value: decimal("value", { precision: 15, scale: 2 }).notNull(),
    period: varchar("period", { length: 50 }).notNull(), // "daily", "weekly", "monthly", "quarterly", "yearly"
    periodDate: date("periodDate", { mode: "date" }).notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(), // Additional context
    calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("metric_workspace_idx").on(table.workspaceId),
    projectIdx: index("metric_project_idx").on(table.projectId),
    metricTypeIdx: index("metric_type_idx").on(table.metricType),
    periodIdx: index("metric_period_idx").on(table.periodDate),
  })
);

export type AnalyticsMetric = typeof analyticsMetrics.$inferSelect;
export type InsertAnalyticsMetric = typeof analyticsMetrics.$inferInsert;

/**
 * Forecasts table for storing predicted financial data
 */
export const forecasts = mysqlTable(
  "forecasts",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    projectId: int("projectId"),
    forecastType: varchar("forecastType", { length: 100 }).notNull(), // e.g., "cash_flow", "revenue", "expense"
    forecastPeriod: varchar("forecastPeriod", { length: 50 }).notNull(), // "1_month", "3_months", "6_months", "1_year"
    forecastData: json("forecastData").$type<Array<{ date: string; value: number; confidence: number }>>().notNull(),
    confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
    baselineMetric: varchar("baselineMetric", { length: 100 }),
    algorithm: varchar("algorithm", { length: 100 }).notNull(), // e.g., "linear_regression", "exponential_smoothing"
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("forecast_workspace_idx").on(table.workspaceId),
    projectIdx: index("forecast_project_idx").on(table.projectId),
    typeIdx: index("forecast_type_idx").on(table.forecastType),
  })
);

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = typeof forecasts.$inferInsert;

/**
 * Variance reports table for budget vs actual analysis
 */
export const varianceReports = mysqlTable(
  "variance_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    projectId: int("projectId"),
    budgetId: int("budgetId"),
    reportPeriod: varchar("reportPeriod", { length: 50 }).notNull(), // "monthly", "quarterly", "yearly"
    periodDate: date("periodDate", { mode: "date" }).notNull(),
    budgetAmount: decimal("budgetAmount", { precision: 15, scale: 2 }).notNull(),
    actualAmount: decimal("actualAmount", { precision: 15, scale: 2 }).notNull(),
    variance: decimal("variance", { precision: 15, scale: 2 }).notNull(), // actual - budget
    variancePercent: decimal("variancePercent", { precision: 8, scale: 2 }).notNull(), // (variance / budget) * 100
    status: mysqlEnum("status", ["favorable", "unfavorable", "neutral"]).notNull(),
    analysis: text("analysis"), // Narrative analysis of variance
    recommendations: json("recommendations").$type<string[]>(), // Suggested actions
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("variance_workspace_idx").on(table.workspaceId),
    projectIdx: index("variance_project_idx").on(table.projectId),
    budgetIdx: index("variance_budget_idx").on(table.budgetId),
    periodIdx: index("variance_period_idx").on(table.periodDate),
  })
);

export type VarianceReport = typeof varianceReports.$inferSelect;
export type InsertVarianceReport = typeof varianceReports.$inferInsert;


/**
 * User preferences table for language, currency, and localization settings
 */
export const userPreferences = mysqlTable(
  "user_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    workspaceId: int("workspaceId").notNull(),
    language: varchar("language", { length: 10 }).default("en").notNull(), // ISO 639-1 code: en, fr, es, sw, ar
    currency: varchar("currency", { length: 3 }).default("USD").notNull(), // ISO 4217 code
    dateFormat: varchar("dateFormat", { length: 20 }).default("MM/DD/YYYY").notNull(),
    timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
    theme: mysqlEnum("theme", ["light", "dark"]).default("light").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("pref_user_idx").on(table.userId),
    workspaceIdx: index("pref_workspace_idx").on(table.workspaceId),
    uniqueUserWorkspace: uniqueIndex("pref_user_workspace_idx").on(table.userId, table.workspaceId),
  })
);
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Translation keys table for managing translatable strings
 */
export const translationKeys = mysqlTable(
  "translation_keys",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(), // e.g., "dashboard.welcome", "button.save"
    module: varchar("module", { length: 100 }).notNull(), // e.g., "dashboard", "transactions", "common"
    description: text("description"), // Context for translators
    context: varchar("context", { length: 255 }), // Additional context
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    keyIdx: index("trans_key_idx").on(table.key),
    moduleIdx: index("trans_module_idx").on(table.module),
  })
);
export type TranslationKey = typeof translationKeys.$inferSelect;
export type InsertTranslationKey = typeof translationKeys.$inferInsert;

/**
 * Translation values table for storing translated strings
 */
export const translationValues = mysqlTable(
  "translation_values",
  {
    id: int("id").autoincrement().primaryKey(),
    translationKeyId: int("translationKeyId").notNull(),
    language: varchar("language", { length: 10 }).notNull(), // ISO 639-1 code
    value: text("value").notNull(), // The translated string
    isApproved: boolean("isApproved").default(false).notNull(),
    approvedBy: int("approvedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    keyIdx: index("transval_key_idx").on(table.translationKeyId),
    languageIdx: index("transval_language_idx").on(table.language),
    uniqueKeyLanguage: uniqueIndex("transval_key_language_idx").on(table.translationKeyId, table.language),
  })
);
export type TranslationValue = typeof translationValues.$inferSelect;
export type InsertTranslationValue = typeof translationValues.$inferInsert;

/**
 * Supported currencies table with exchange rates
 */
export const supportedCurrencies = mysqlTable(
  "supported_currencies",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 3 }).notNull().unique(), // ISO 4217 code: USD, EUR, GBP, KES, ZAR, NGN, EGP
    symbol: varchar("symbol", { length: 5 }).notNull(), // $, €, £, Ksh, R, ₦, £
    name: varchar("name", { length: 100 }).notNull(), // United States Dollar, Euro, etc.
    exchangeRate: decimal("exchangeRate", { precision: 15, scale: 6 }).notNull(), // Relative to base currency (USD)
    isActive: boolean("isActive").default(true).notNull(),
    decimalPlaces: int("decimalPlaces").default(2).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: index("curr_code_idx").on(table.code),
    activeIdx: index("curr_active_idx").on(table.isActive),
  })
);
export type SupportedCurrency = typeof supportedCurrencies.$inferSelect;
export type InsertSupportedCurrency = typeof supportedCurrencies.$inferInsert;


/**
 * Workspace localization settings table for tenant-level language and currency defaults
 */
export const workspaceLocalizationSettings = mysqlTable(
  "workspace_localization_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull(),
    defaultLanguage: varchar("defaultLanguage", { length: 10 }).default("en").notNull(), // ISO 639-1 code
    defaultCurrency: varchar("defaultCurrency", { length: 3 }).default("USD").notNull(), // ISO 4217 code
    dateFormat: varchar("dateFormat", { length: 20 }).default("MM/DD/YYYY").notNull(),
    timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceIdx: uniqueIndex("workspace_localization_workspace_idx").on(table.workspaceId),
  })
);

export type WorkspaceLocalizationSettings = typeof workspaceLocalizationSettings.$inferSelect;
export type InsertWorkspaceLocalizationSettings = typeof workspaceLocalizationSettings.$inferInsert;
