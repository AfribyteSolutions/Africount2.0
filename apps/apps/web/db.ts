import { eq, and, or, desc, asc, like, between, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  organizations,
  workspaces,
  workspaceMembers,
  workspaceLocalizationSettings,
  modulePermissions,
  projects,
  projectMembers,
  balanceSheets,
  balanceSheetItems,
  computingTables,
  computingTableColumns,
  computingTableRows,
  transactions,
  sheetImports,
  comments,
  activityLogs,
  agentAccounts,
  agentEntries,
  budgetRequests,
  budgetLineItems,
  budgetApprovals,
  procurementAudit,
  productCategories,
  productServices,
  productAttachments,
  productPricingHistory,
  budgetImports,
  budgetImportLineItems,
  chartComments,
  commentReactions,
  commentMentions,
  dashboardLayouts,
  webhooks,
  webhookEvents,
  analyticsMetrics,
  forecasts,
  varianceReports,
  userPreferences,
  translationKeys,
  translationValues,
  supportedCurrencies,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function upsertUser(user: Partial<typeof users.$inferInsert>): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: Record<string, unknown> = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values as typeof users.$inferInsert).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ORGANIZATION OPERATIONS
// ============================================================================

export async function createOrganization(
  name: string,
  slug: string,
  ownerId: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(organizations).values({
    name,
    slug,
    ownerId,
    description,
  });

  return result;
}

export async function getOrganizationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerId, userId));
}

export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// WORKSPACE OPERATIONS
// ============================================================================

export async function createWorkspace(
  organizationId: number,
  name: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(workspaces).values({
    organizationId,
    name,
    description,
  });

  return result;
}

export async function getWorkspacesByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.organizationId, organizationId));
}

export async function getWorkspaceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// WORKSPACE MEMBER OPERATIONS
// ============================================================================

export async function addWorkspaceMember(
  workspaceId: number,
  userId: number,
  role: "admin" | "manager" | "agent"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(workspaceMembers).values({
    workspaceId,
    userId,
    role,
  });
}

export async function getWorkspaceMembers(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));
}

export async function getUserWorkspaces(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));
}

export async function getWorkspaceMemberRole(
  workspaceId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// MODULE PERMISSIONS OPERATIONS
// ============================================================================

export async function setModulePermissions(
  workspaceMemberId: number,
  module: string,
  canRead: boolean,
  canWrite: boolean,
  canDelete: boolean,
  canManagePermissions: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(modulePermissions).values({
    workspaceMemberId,
    module: module as any,
    canRead,
    canWrite,
    canDelete,
    canManagePermissions,
  });
}

export async function getModulePermissions(workspaceMemberId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(modulePermissions)
    .where(eq(modulePermissions.workspaceMemberId, workspaceMemberId));
}

// ============================================================================
// PROJECT OPERATIONS
// ============================================================================

export async function createProject(
  workspaceId: number,
  name: string,
  createdBy: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(projects).values({
    workspaceId,
    name,
    description,
    createdBy,
    status: "active",
  });
}

export async function getProjectsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}


export async function getTransactionsByProjectForAnalytics(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.projectId, projectId))
    .orderBy(desc(transactions.date));
}

export async function getBudgetsByProjectForAnalytics(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetRequests)
    .where(eq(budgetRequests.projectId, projectId));
}

export async function addProjectMember(
  projectId: number,
  userId: number,
  role: "owner" | "editor" | "viewer"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(projectMembers).values({
    projectId,
    userId,
    role,
  });
}

export async function getProjectMembers(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));
}

// ============================================================================
// BALANCE SHEET OPERATIONS
// ============================================================================


export async function updateProject(
  projectId: number,
  updates: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(projects)
    .where(eq(projects.id, projectId));
}

export async function removeProjectMember(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    );
}

export async function createBalanceSheet(
  projectId: number,
  name: string,
  createdBy: number,
  period?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(balanceSheets).values({
    projectId,
    name,
    period,
    createdBy,
  });
}

export async function getBalanceSheetsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(balanceSheets)
    .where(eq(balanceSheets.projectId, projectId))
    .orderBy(desc(balanceSheets.createdAt));
}

export async function getBalanceSheetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(balanceSheets)
    .where(eq(balanceSheets.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}export async function addBalanceSheetItem(
  balanceSheetId: number,
  section: "assets" | "liabilities" | "equity",
  category: string,
  amount: number | string,
  description?: string,
  sourceFile?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(balanceSheetItems).values({
    balanceSheetId,
    section,
    category,
    amount: String(amount),
    description,
    sourceFile,
  });
}
export async function getBalanceSheetItems(balanceSheetId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(balanceSheetItems)
    .where(eq(balanceSheetItems.balanceSheetId, balanceSheetId));
}


export async function updateBalanceSheet(
  balanceSheetId: number,
  updates: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(balanceSheets)
    .set(updates)
    .where(eq(balanceSheets.id, balanceSheetId));
}

export async function deleteBalanceSheet(balanceSheetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(balanceSheets)
    .where(eq(balanceSheets.id, balanceSheetId));
}

export async function updateBalanceSheetItem(
  itemId: number,
  updates: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(balanceSheetItems)
    .set(updates)
    .where(eq(balanceSheetItems.id, itemId));
}

export async function deleteBalanceSheetItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(balanceSheetItems)
    .where(eq(balanceSheetItems.id, itemId));
}

export async function getBalanceSheetItemsBySection(
  balanceSheetId: number,
  section: "assets" | "liabilities" | "equity"
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(balanceSheetItems)
    .where(
      and(
        eq(balanceSheetItems.balanceSheetId, balanceSheetId),
        eq(balanceSheetItems.section, section)
      )
    );
}

// ============================================================================
// COMPUTING TABLE OPERATIONS
// ============================================================================

export async function createComputingTable(
  projectId: number,
  name: string,
  type: "cost_tracking" | "revenue_tracking" | "custom",
  createdBy: number,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(computingTables).values({
    projectId,
    name,
    type,
    description,
    createdBy,
  });
}

export async function getComputingTablesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(computingTables)
    .where(eq(computingTables.projectId, projectId));
}


export async function updateComputingTable(
  tableId: number,
  updates: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(computingTables)
    .set(updates)
    .where(eq(computingTables.id, tableId));
}

export async function deleteComputingTable(tableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(computingTables)
    .where(eq(computingTables.id, tableId));
}

export async function addComputingTableRow(
  tableId: number,
  rowData: Record<string, unknown>,
  order: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(computingTableRows).values({
    tableId,
    rowData,
    order,
  });
}

export async function updateComputingTableRow(
  rowId: number,
  updates: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(computingTableRows)
    .set(updates)
    .where(eq(computingTableRows.id, rowId));
}

export async function deleteComputingTableRow(rowId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(computingTableRows)
    .where(eq(computingTableRows.id, rowId));
}

export async function getComputingTableById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(computingTables)
    .where(eq(computingTables.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function addComputingTableColumn(
  tableId: number,
  name: string,
  type: "text" | "number" | "date" | "formula",
  order: number,
  formula?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(computingTableColumns).values({
    tableId,
    name,
    type,
    order,
    formula,
  });
}

export async function getComputingTableColumns(tableId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(computingTableColumns)
    .where(eq(computingTableColumns.tableId, tableId))
    .orderBy(asc(computingTableColumns.order));
}


export async function getComputingTableRows(tableId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(computingTableRows)
    .where(eq(computingTableRows.tableId, tableId))
    .orderBy(asc(computingTableRows.order));
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

export async function createTransaction(
  projectId: number,
  type: "cash_in" | "cash_out" | "transfer" | "adjustment",
  date: Date,
  amount: number | string,
  createdBy: number,
  description?: string,
  category?: string,
  account?: string,
  reference?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(transactions).values({
    projectId,
    type,
    date,
    amount: String(amount),
    description,
    category,
    account,
    reference,
    notes,
    createdBy,
  });
}


export async function getTransactionsByFilters(
  projectId: number,
  filters: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    category?: string;
    account?: string;
    minAmount?: number;
    maxAmount?: number;
    searchText?: string;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(transactions.projectId, projectId)];

  if (filters.startDate && filters.endDate) {
    conditions.push(between(transactions.date, filters.startDate, filters.endDate));
  }

  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type as any));
  }

  if (filters.category) {
    conditions.push(eq(transactions.category, filters.category));
  }

  if (filters.account) {
    conditions.push(eq(transactions.account, filters.account));
  }

  if (filters.searchText) {
    const searchCondition = or(
      like(transactions.description, `%${filters.searchText}%`),
      like(transactions.reference, `%${filters.searchText}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.date));
}

// ============================================================================
// SHEET IMPORT OPERATIONS
// ============================================================================

export async function createSheetImport(
  projectId: number,
  fileName: string,
  fileType: "csv" | "excel",
  rowCount: number,
  fieldMapping: Record<string, string>,
  importedBy: number,
  section?: "assets" | "liabilities" | "equity" | "transactions" | "general"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(sheetImports).values({
    projectId,
    fileName,
    fileType,
    section,
    rowCount,
    fieldMapping,
    importedBy,
  });
}

export async function getSheetImportsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sheetImports)
    .where(eq(sheetImports.projectId, projectId))
    .orderBy(desc(sheetImports.createdAt));
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

export async function createComment(
  projectId: number,
  entityType: "balance_sheet" | "transaction" | "computing_table" | "sheet_import" | "general",
  entityId: number,
  userId: number,
  content: string,
  parentCommentId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(comments).values({
    projectId,
    entityType,
    entityId,
    userId,
    content,
    parentCommentId,
  });
}

export async function getCommentsByEntity(
  projectId: number,
  entityType: "balance_sheet" | "transaction" | "computing_table" | "sheet_import" | "general",
  entityId: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.projectId, projectId),
        eq(comments.entityType, entityType),
        eq(comments.entityId, entityId)
      )
    )
    .orderBy(desc(comments.createdAt));
}

// ============================================================================
// ACTIVITY LOG OPERATIONS
// ============================================================================







export async function logActivity(
  projectId: number,
  userId: number,
  action: string,
  entityType: string,
  entityId: number,
  changes?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(activityLogs).values({
    projectId,
    userId,
    action,
    entityType,
    entityId,
    changes,
  });
}

export async function getActivityLogsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.projectId, projectId))
    .orderBy(desc(activityLogs.createdAt));
}

// ============================================================================
// AGENT ACCOUNT OPERATIONS
// ============================================================================

export async function createAgentAccount(
  projectId: number,
  userId: number,
  accountName: string,
  accountType: "cash" | "bank" | "mobile_money" | "other",
  customFields?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(agentAccounts).values({
    projectId,
    userId,
    accountName,
    accountType,
    customFields,
  });
}

export async function getAgentAccountsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(agentAccounts)
    .where(eq(agentAccounts.projectId, projectId));
}

export async function getAgentAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(agentAccounts)
    .where(eq(agentAccounts.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// AGENT ENTRY OPERATIONS
// ============================================================================

export async function createAgentEntry(
  accountId: number,
  entryType: "cash_in" | "cash_out",
  amount: number | string,
  date: Date,
  description?: string,
  reference?: string,
  customData?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(agentEntries).values({
    accountId,
    entryType,
    amount: String(amount),
    date,
    description,
    reference,
    customData,
  });
}

export async function getAgentEntriesByAccount(accountId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(agentEntries)
    .where(eq(agentEntries.accountId, accountId))
    .orderBy(desc(agentEntries.date));
}

export async function getAgentEntriesByDateRange(
  accountId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(agentEntries)
    .where(
      and(
        eq(agentEntries.accountId, accountId),
        between(agentEntries.date, startDate, endDate)
      )
    )
    .orderBy(desc(agentEntries.date));
}


// ============================================================================
// PROCUREMENT OPERATIONS
// ============================================================================

export async function createBudgetRequest(
  workspaceId: number,
  submittedBy: number,
  title: string,
  totalAmount: number | string,
  description?: string,
  projectId?: number,
  balanceSheetSection?: "assets" | "liabilities" | "equity" | "expense" | "revenue",
  category?: string,
  priority?: "low" | "medium" | "high" | "critical",
  dueDate?: Date,
  attachments?: Array<{ url: string; name: string }>,
  customFields?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(budgetRequests).values({
    workspaceId,
    submittedBy,
    title,
    description,
    totalAmount: String(totalAmount),
    projectId,
    balanceSheetSection,
    category,
    priority: priority || "medium",
    dueDate,
    attachments,
    customFields,
    status: "submitted",
  });
}

export async function getBudgetRequestsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetRequests)
    .where(eq(budgetRequests.workspaceId, workspaceId))
    .orderBy(desc(budgetRequests.createdAt));
}

export async function getBudgetRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(budgetRequests)
    .where(eq(budgetRequests.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBudgetRequestsByStatus(workspaceId: number, status: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetRequests)
    .where(
      and(
        eq(budgetRequests.workspaceId, workspaceId),
        eq(budgetRequests.status, status as any)
      )
    )
    .orderBy(desc(budgetRequests.createdAt));
}

export async function addBudgetLineItem(
  budgetRequestId: number,
  itemName: string,
  quantity: number | string,
  unitPrice: number | string,
  totalPrice: number | string,
  category?: string,
  vendor?: string,
  description?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(budgetLineItems).values({
    budgetRequestId,
    itemName,
    quantity: String(quantity),
    unitPrice: String(unitPrice),
    totalPrice: String(totalPrice),
    category,
    vendor,
    description,
    notes,
  });
}

export async function getBudgetLineItems(budgetRequestId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetLineItems)
    .where(eq(budgetLineItems.budgetRequestId, budgetRequestId));
}

export async function createBudgetApproval(
  budgetRequestId: number,
  approverUserId: number,
  approvalStatus: "pending" | "approved" | "rejected" | "commented" = "pending",
  approvalComments?: string,
  linkedProjectId?: number,
  linkedBalanceSheetId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(budgetApprovals).values({
    budgetRequestId,
    approverUserId,
    approvalStatus,
    approvalComments,
    linkedProjectId,
    linkedBalanceSheetId,
  });
}

export async function getBudgetApprovalsByRequest(budgetRequestId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetApprovals)
    .where(eq(budgetApprovals.budgetRequestId, budgetRequestId));
}

export async function updateBudgetApproval(
  id: number,
  updates: {
    approvalStatus?: "pending" | "approved" | "rejected" | "commented";
    approvalComments?: string;
    approvalDate?: Date;
    linkedProjectId?: number;
    linkedBalanceSheetId?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(budgetApprovals)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(budgetApprovals.id, id));
}

export async function updateBudgetRequestStatus(
  id: number,
  status: "submitted" | "approved" | "rejected" | "in_progress" | "completed",
  updates?: {
    approvedBy?: number;
    approvalComments?: string;
    rejectionReason?: string;
    projectId?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(budgetRequests)
    .set({
      status,
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(budgetRequests.id, id));
}

export async function logProcurementAudit(
  budgetRequestId: number,
  userId: number,
  action: string,
  previousStatus?: string,
  newStatus?: string,
  details?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(procurementAudit).values({
    budgetRequestId,
    userId,
    action,
    previousStatus,
    newStatus,
    details,
  });
}

export async function getProcurementAuditTrail(budgetRequestId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(procurementAudit)
    .where(eq(procurementAudit.budgetRequestId, budgetRequestId))
    .orderBy(desc(procurementAudit.createdAt));
}

export async function getBudgetRequestsForApproval(workspaceId: number, approverUserId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetRequests)
    .where(
      and(
        eq(budgetRequests.workspaceId, workspaceId),
        eq(budgetRequests.status, "submitted")
      )
    )
    .orderBy(desc(budgetRequests.createdAt));
}

export async function getRejectedBudgetRequests(workspaceId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetRequests)
    .where(
      and(
        eq(budgetRequests.workspaceId, workspaceId),
        eq(budgetRequests.submittedBy, userId),
        eq(budgetRequests.status, "rejected")
      )
    )
    .orderBy(desc(budgetRequests.createdAt));
}


// ============================================================================
// PRODUCT & SERVICE BANK OPERATIONS
// ============================================================================

export async function createProductCategory(
  workspaceId: number,
  name: string,
  description?: string,
  icon?: string,
  color?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(productCategories).values({
    workspaceId,
    name,
    description,
    icon,
    color,
  });
}

export async function getProductCategories(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.workspaceId, workspaceId))
    .orderBy(asc(productCategories.order));
}

export async function createProductService(
  workspaceId: number,
  categoryId: number | undefined,
  name: string,
  basePrice: number | string,
  createdBy: number,
  description?: string,
  sku?: string,
  type?: "product" | "service",
  unitOfMeasure?: string,
  vendor?: string,
  vendorSku?: string,
  specifications?: Record<string, unknown>,
  tags?: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(productServices).values({
    workspaceId,
    categoryId,
    name,
    description,
    sku,
    type: type || "product",
    unitOfMeasure: unitOfMeasure || "unit",
    basePrice: String(basePrice),
    vendor,
    vendorSku,
    specifications,
    tags,
    createdBy,
  });
}

export async function getProductServicesByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productServices)
    .where(
      and(
        eq(productServices.workspaceId, workspaceId),
        eq(productServices.isActive, true)
      )
    )
    .orderBy(desc(productServices.createdAt));
}

export async function getProductServicesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productServices)
    .where(
      and(
        eq(productServices.categoryId, categoryId),
        eq(productServices.isActive, true)
      )
    );
}

export async function getProductServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(productServices)
    .where(eq(productServices.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchProductServices(
  workspaceId: number,
  searchText: string,
  categoryId?: number
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(productServices.workspaceId, workspaceId),
    eq(productServices.isActive, true),
    or(
      like(productServices.name, `%${searchText}%`),
      like(productServices.sku, `%${searchText}%`),
      like(productServices.description, `%${searchText}%`)
    ),
  ];

  if (categoryId) {
    conditions.push(eq(productServices.categoryId, categoryId));
  }

  return await db
    .select()
    .from(productServices)
    .where(and(...conditions));
}

export async function addProductAttachment(
  productId: number,
  fileName: string,
  fileUrl: string,
  fileType?: string,
  fileSize?: number,
  attachmentType?: "image" | "document" | "specification" | "other"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(productAttachments).values({
    productId,
    fileName,
    fileUrl,
    fileType,
    fileSize,
    attachmentType: attachmentType || "document",
  });
}

export async function getProductAttachments(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productAttachments)
    .where(eq(productAttachments.productId, productId))
    .orderBy(asc(productAttachments.order));
}

export async function addPricingHistory(
  productId: number,
  price: number | string,
  vendor?: string,
  effectiveDate?: Date,
  expiryDate?: Date,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(productPricingHistory).values({
    productId,
    price: String(price),
    vendor,
    effectiveDate: effectiveDate || new Date(),
    expiryDate,
    notes,
  });
}

export async function getPricingHistory(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productPricingHistory)
    .where(eq(productPricingHistory.productId, productId))
    .orderBy(desc(productPricingHistory.effectiveDate));
}

// ============================================================================
// BUDGET IMPORT OPERATIONS
// ============================================================================

export async function createBudgetImport(
  workspaceId: number,
  importedBy: number,
  fileName: string,
  fileType: "csv" | "excel",
  totalRows: number,
  fieldMapping: Record<string, string>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(budgetImports).values({
    workspaceId,
    importedBy,
    fileName,
    fileType,
    totalRows,
    fieldMapping,
    importStatus: "pending",
  });
}

export async function getBudgetImportsByWorkspace(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetImports)
    .where(eq(budgetImports.workspaceId, workspaceId))
    .orderBy(desc(budgetImports.createdAt));
}

export async function getBudgetImportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(budgetImports)
    .where(eq(budgetImports.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function addBudgetImportLineItem(
  budgetImportId: number,
  rowNumber: number,
  itemName: string,
  quantity: number | string,
  unitPrice: number | string,
  totalPrice: number | string,
  category?: string,
  vendor?: string,
  notes?: string,
  linkedProductId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(budgetImportLineItems).values({
    budgetImportId,
    rowNumber,
    itemName,
    quantity: String(quantity),
    unitPrice: String(unitPrice),
    totalPrice: String(totalPrice),
    category,
    vendor,
    notes,
    linkedProductId,
    importStatus: "pending",
  });
}

export async function getBudgetImportLineItems(budgetImportId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgetImportLineItems)
    .where(eq(budgetImportLineItems.budgetImportId, budgetImportId));
}

export async function updateBudgetImportStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  successfulRows?: number,
  failedRows?: number,
  errorLog?: Array<{ row: number; error: string }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(budgetImports)
    .set({
      importStatus: status,
      successfulRows,
      failedRows,
      errorLog,
      updatedAt: new Date(),
    })
    .where(eq(budgetImports.id, id));
}

export async function updateBudgetImportLineItemStatus(
  id: number,
  status: "pending" | "imported" | "skipped" | "error",
  errorMessage?: string,
  linkedProductId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(budgetImportLineItems)
    .set({
      importStatus: status,
      errorMessage,
      linkedProductId,
    })
    .where(eq(budgetImportLineItems.id, id));
}


// ============================================================================
// PROJECT ACCESS CONTROL HELPERS
// ============================================================================

export async function isUserProjectMember(userId: number, projectId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(projectMembers)
    .where(and(
      eq(projectMembers.userId, userId),
      eq(projectMembers.projectId, projectId)
    ))
    .limit(1);

  return result.length > 0;
}

export async function isUserWorkspaceAdmin(userId: number, workspaceId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(workspaceMembers)
    .where(and(
      eq(workspaceMembers.userId, userId),
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.role, "admin")
    ))
    .limit(1);

  return result.length > 0;
}

export async function canAccessProject(userId: number, projectId: number, workspaceId: number): Promise<boolean> {
  // Check if user is project member
  const isMember = await isUserProjectMember(userId, projectId);
  if (isMember) return true;

  // Check if user is workspace admin
  const isAdmin = await isUserWorkspaceAdmin(userId, workspaceId);
  return isAdmin;
}


export async function updateProductService(
  productId: number,
  updates: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(productServices)
    .set(updates)
    .where(eq(productServices.id, productId));
}

export async function deleteProductService(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete by marking as inactive
  return await db
    .update(productServices)
    .set({ isActive: false })
    .where(eq(productServices.id, productId));
}


// ============================================================================
// CHART COMMENTS
// ============================================================================

export async function createChartComment(
  chartId: string,
  workspaceId: number,
  userId: number,
  content: string,
  parentCommentId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chartComments).values({
    chartId,
    workspaceId,
    userId,
    content,
    parentCommentId,
  });

  return result;
}

export async function getChartComments(chartId: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(chartComments)
    .where(and(eq(chartComments.chartId, chartId), eq(chartComments.deletedAt, null as any)))
    .orderBy(desc(chartComments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateChartComment(commentId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(chartComments)
    .set({ content, updatedAt: new Date() })
    .where(eq(chartComments.id, commentId));
}

export async function deleteChartComment(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete
  return await db
    .update(chartComments)
    .set({ deletedAt: new Date() })
    .where(eq(chartComments.id, commentId));
}

export async function addCommentReaction(commentId: number, userId: number, reactionType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(commentReactions).values({
    commentId,
    userId,
    reactionType,
  });
}

export async function removeCommentReaction(commentId: number, userId: number, reactionType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(commentReactions)
    .where(
      and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.userId, userId),
        eq(commentReactions.reactionType, reactionType)
      )
    );
}

export async function getCommentReactions(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(commentReactions)
    .where(eq(commentReactions.commentId, commentId));
}

export async function addCommentMention(commentId: number, mentionedUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(commentMentions).values({
    commentId,
    mentionedUserId,
  });
}

export async function getCommentMentions(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(commentMentions)
    .where(eq(commentMentions.commentId, commentId));
}


// ============================================================================
// DASHBOARD LAYOUTS
// ============================================================================

export async function saveDashboardLayout(
  userId: number,
  workspaceId: number,
  name: string,
  layoutConfig: any,
  isDefault: boolean = false
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If setting as default, unset other defaults for this user
  if (isDefault) {
    await db
      .update(dashboardLayouts)
      .set({ isDefault: false })
      .where(
        and(
          eq(dashboardLayouts.userId, userId),
          eq(dashboardLayouts.workspaceId, workspaceId)
        )
      );
  }

  return await db.insert(dashboardLayouts).values({
    userId,
    workspaceId,
    name,
    layoutConfig,
    isDefault,
  });
}

export async function getDashboardLayout(layoutId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(dashboardLayouts)
    .where(eq(dashboardLayouts.id, layoutId))
    .limit(1);
}

export async function listDashboardLayouts(userId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(dashboardLayouts)
    .where(
      and(
        eq(dashboardLayouts.userId, userId),
        eq(dashboardLayouts.workspaceId, workspaceId)
      )
    )
    .orderBy(desc(dashboardLayouts.createdAt));
}

export async function getDefaultDashboardLayout(userId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(dashboardLayouts)
    .where(
      and(
        eq(dashboardLayouts.userId, userId),
        eq(dashboardLayouts.workspaceId, workspaceId),
        eq(dashboardLayouts.isDefault, true)
      )
    )
    .limit(1);
}

export async function updateDashboardLayout(
  layoutId: number,
  name?: string,
  layoutConfig?: any,
  isDefault?: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (layoutConfig !== undefined) updates.layoutConfig = layoutConfig;
  if (isDefault !== undefined) updates.isDefault = isDefault;

  return await db
    .update(dashboardLayouts)
    .set(updates)
    .where(eq(dashboardLayouts.id, layoutId));
}

export async function deleteDashboardLayout(layoutId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(dashboardLayouts)
    .where(eq(dashboardLayouts.id, layoutId));
}


// ============================================================================
// WEBHOOKS
// ============================================================================

export async function createWebhook(
  workspaceId: number,
  name: string,
  url: string,
  events: string[],
  secret: string,
  retryPolicy?: { maxRetries: number; backoffMultiplier: number },
  headers?: Record<string, string>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(webhooks).values({
    workspaceId,
    name,
    url,
    events,
    secret,
    retryPolicy: retryPolicy || { maxRetries: 5, backoffMultiplier: 2 },
    headers,
    active: true,
  });
}

export async function getWebhook(webhookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.id, webhookId))
    .limit(1);
}

export async function listWebhooks(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.workspaceId, workspaceId))
    .orderBy(desc(webhooks.createdAt));
}

export async function updateWebhook(
  webhookId: number,
  updates: {
    name?: string;
    url?: string;
    events?: string[];
    active?: boolean;
    retryPolicy?: { maxRetries: number; backoffMultiplier: number };
    headers?: Record<string, string>;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: any = { updatedAt: new Date() };
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.url !== undefined) data.url = updates.url;
  if (updates.events !== undefined) data.events = updates.events;
  if (updates.active !== undefined) data.active = updates.active;
  if (updates.retryPolicy !== undefined) data.retryPolicy = updates.retryPolicy;
  if (updates.headers !== undefined) data.headers = updates.headers;

  return await db
    .update(webhooks)
    .set(data)
    .where(eq(webhooks.id, webhookId));
}

export async function deleteWebhook(webhookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(webhooks)
    .where(eq(webhooks.id, webhookId));
}

export async function toggleWebhookActive(webhookId: number, active: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(webhooks)
    .set({ active, updatedAt: new Date() })
    .where(eq(webhooks.id, webhookId));
}

export async function getWebhookEvents(webhookId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.webhookId, webhookId))
    .orderBy(desc(webhookEvents.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createWebhookEvent(
  webhookId: number,
  eventType: string,
  payload: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(webhookEvents).values({
    webhookId,
    eventType,
    payload,
    status: "pending",
  });
}

export async function updateWebhookEventStatus(
  eventId: number,
  status: "pending" | "delivered" | "failed" | "skipped",
  failureReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: any = { status, updatedAt: new Date() };
  if (status === "delivered") data.deliveredAt = new Date();
  if (failureReason) data.failureReason = failureReason;

  return await db
    .update(webhookEvents)
    .set(data)
    .where(eq(webhookEvents.id, eventId));
}

export async function incrementWebhookEventRetry(eventId: number, nextRetryAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(webhookEvents)
    .set({
      retryCount: sql`${webhookEvents.retryCount} + 1`,
      nextRetryAt,
    })
    .where(eq(webhookEvents.id, eventId));
}


// ============================================================================
// ANALYTICS METRICS
// ============================================================================

export async function createAnalyticsMetric(
  workspaceId: number,
  metricType: string,
  value: number,
  period: string,
  periodDate: Date,
  projectId?: number,
  metadata?: Record<string, unknown>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(analyticsMetrics).values({
    workspaceId,
    projectId,
    metricType,
    value: value.toString(),
    period,
    periodDate,
    metadata,
  });
}

export async function getMetricsForPeriod(
  workspaceId: number,
  metricType: string,
  startDate: Date,
  endDate: Date,
  projectId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [
    eq(analyticsMetrics.workspaceId, workspaceId),
    eq(analyticsMetrics.metricType, metricType),
    between(analyticsMetrics.periodDate, startDate, endDate),
  ];

  if (projectId) {
    conditions.push(eq(analyticsMetrics.projectId, projectId));
  }

  return await db
    .select()
    .from(analyticsMetrics)
    .where(and(...conditions))
    .orderBy(asc(analyticsMetrics.periodDate));
}

export async function aggregateMetrics(
  workspaceId: number,
  metricType: string,
  startDate: Date,
  endDate: Date,
  projectId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await getMetricsForPeriod(workspaceId, metricType, startDate, endDate, projectId);
  if (metrics.length === 0) return { total: 0, average: 0, min: 0, max: 0 };

  const values = metrics.map((m) => parseFloat(m.value));
  const total = values.reduce((a, b) => a + b, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { total, average, min, max };
}

// ============================================================================
// FORECASTS
// ============================================================================

export async function createForecast(
  workspaceId: number,
  forecastType: string,
  forecastPeriod: string,
  forecastData: Array<{ date: string; value: number; confidence: number }>,
  confidence: number,
  algorithm: string,
  createdBy: number,
  projectId?: number,
  baselineMetric?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(forecasts).values({
    workspaceId,
    projectId,
    forecastType,
    forecastPeriod,
    forecastData,
    confidence: confidence.toString(),
    algorithm,
    createdBy,
    baselineMetric,
  });
}

export async function listForecasts(workspaceId: number, forecastType?: string, projectId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [eq(forecasts.workspaceId, workspaceId)];

  if (forecastType) {
    conditions.push(eq(forecasts.forecastType, forecastType));
  }

  if (projectId) {
    conditions.push(eq(forecasts.projectId, projectId));
  }

  return await db
    .select()
    .from(forecasts)
    .where(and(...conditions))
    .orderBy(desc(forecasts.createdAt));
}

// ============================================================================
// VARIANCE REPORTS
// ============================================================================

export async function createVarianceReport(
  workspaceId: number,
  reportPeriod: string,
  periodDate: Date,
  budgetAmount: number,
  actualAmount: number,
  createdBy: number,
  projectId?: number,
  budgetId?: number,
  analysis?: string,
  recommendations?: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const variance = actualAmount - budgetAmount;
  const variancePercent = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : 0;
  const status = variance < 0 ? "favorable" : variance > 0 ? "unfavorable" : "neutral";

  return await db.insert(varianceReports).values({
    workspaceId,
    projectId,
    budgetId,
    reportPeriod,
    periodDate,
    budgetAmount: budgetAmount.toString(),
    actualAmount: actualAmount.toString(),
    variance: variance.toString(),
    variancePercent: variancePercent.toString(),
    status,
    analysis,
    recommendations,
    createdBy,
  });
}

export async function getVarianceReports(
  workspaceId: number,
  startDate: Date,
  endDate: Date,
  projectId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [
    eq(varianceReports.workspaceId, workspaceId),
    between(varianceReports.periodDate, startDate, endDate),
  ];

  if (projectId) {
    conditions.push(eq(varianceReports.projectId, projectId));
  }

  return await db
    .select()
    .from(varianceReports)
    .where(and(...conditions))
    .orderBy(desc(varianceReports.periodDate));
}

export async function getVarianceByStatus(workspaceId: number, status: "favorable" | "unfavorable" | "neutral") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(varianceReports)
    .where(and(eq(varianceReports.workspaceId, workspaceId), eq(varianceReports.status, status)))
    .orderBy(desc(varianceReports.periodDate));
}


// ============================================================================
// USER PREFERENCES (Language, Currency, Localization)
// ============================================================================
export async function getUserPreferences(userId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(userPreferences)
    .where(and(eq(userPreferences.userId, userId), eq(userPreferences.workspaceId, workspaceId)))
    .limit(1)
    .then((rows) => rows[0] || null);
}

export async function setUserLanguage(userId: number, workspaceId: number, language: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserPreferences(userId, workspaceId);
  if (existing) {
    return await db
      .update(userPreferences)
      .set({ language, updatedAt: new Date() })
      .where(and(eq(userPreferences.userId, userId), eq(userPreferences.workspaceId, workspaceId)));
  } else {
    return await db.insert(userPreferences).values({
      userId,
      workspaceId,
      language,
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      timezone: "UTC",
      theme: "light" as const,
    });
  }
}

export async function setUserCurrency(userId: number, workspaceId: number, currency: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserPreferences(userId, workspaceId);
  if (existing) {
    return await db
      .update(userPreferences)
      .set({ currency, updatedAt: new Date() })
      .where(and(eq(userPreferences.userId, userId), eq(userPreferences.workspaceId, workspaceId)));
  } else {
    return await db.insert(userPreferences).values({
      userId,
      workspaceId,
      language: "en",
      currency,
      dateFormat: "MM/DD/YYYY",
      timezone: "UTC",
      theme: "light",
    });
  }
}

export async function updateUserPreferences(
  userId: number,
  workspaceId: number,
  updates: {
    language?: string;
    currency?: string;
    dateFormat?: string;
    timezone?: string;
    theme?: "light" | "dark";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserPreferences(userId, workspaceId);
  if (existing) {
    return await db
      .update(userPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(userPreferences.userId, userId), eq(userPreferences.workspaceId, workspaceId)));
  } else {
    return await db.insert(userPreferences).values({
      userId,
      workspaceId,
      language: updates.language || "en",
      currency: updates.currency || "USD",
      dateFormat: updates.dateFormat || "MM/DD/YYYY",
      timezone: updates.timezone || "UTC",
      theme: updates.theme || "light",
    });
  }
}

// ============================================================================
// TRANSLATIONS
// ============================================================================
export async function getTranslationsByLanguage(language: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select({
      key: translationKeys.key,
      module: translationKeys.module,
      value: translationValues.value,
    })
    .from(translationValues)
    .innerJoin(translationKeys, eq(translationValues.translationKeyId, translationKeys.id))
    .where(and(eq(translationValues.language, language), eq(translationValues.isApproved, true)));
}

export async function getTranslation(keyId: number, language: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(translationValues)
    .where(and(eq(translationValues.translationKeyId, keyId), eq(translationValues.language, language)))
    .limit(1)
    .then((rows) => rows[0] || null);
}

export async function createTranslationKey(key: string, module: string, description?: string, context?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(translationKeys).values({
    key,
    module,
    description,
    context,
  });
}

export async function setTranslation(translationKeyId: number, language: string, value: string, isApproved: boolean = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getTranslation(translationKeyId, language);
  if (existing) {
    return await db
      .update(translationValues)
      .set({ value, isApproved, updatedAt: new Date() })
      .where(and(eq(translationValues.translationKeyId, translationKeyId), eq(translationValues.language, language)));
  } else {
    return await db.insert(translationValues).values({
      translationKeyId,
      language,
      value,
      isApproved,
    });
  }
}

export async function getTranslationsByModule(module: string, language: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select({
      key: translationKeys.key,
      value: translationValues.value,
    })
    .from(translationValues)
    .innerJoin(translationKeys, eq(translationValues.translationKeyId, translationKeys.id))
    .where(
      and(
        eq(translationKeys.module, module),
        eq(translationValues.language, language),
        eq(translationValues.isApproved, true)
      )
    );
}

// ============================================================================
// CURRENCIES
// ============================================================================
export async function listSupportedCurrencies() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(supportedCurrencies)
    .where(eq(supportedCurrencies.isActive, true))
    .orderBy(asc(supportedCurrencies.code));
}

export async function getCurrency(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .select()
    .from(supportedCurrencies)
    .where(eq(supportedCurrencies.code, code))
    .limit(1)
    .then((rows) => rows[0] || null);
}

export async function createCurrency(
  code: string,
  symbol: string,
  name: string,
  exchangeRate: number,
  decimalPlaces: number = 2
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(supportedCurrencies).values({
    code,
    symbol,
    name,
    exchangeRate: String(exchangeRate),
    decimalPlaces,
    isActive: true,
  });
}

export async function updateCurrencyExchangeRate(code: string, exchangeRate: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(supportedCurrencies)
    .set({ exchangeRate: String(exchangeRate), updatedAt: new Date() })
    .where(eq(supportedCurrencies.code, code));
}

export async function convertCurrency(amount: number, fromCode: string, toCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const fromCurrency = await getCurrency(fromCode);
  const toCurrency = await getCurrency(toCode);
  if (!fromCurrency || !toCurrency) {
    throw new Error(`Currency not found: ${fromCode} or ${toCode}`);
  }
  // Convert to base currency (USD) first, then to target currency
  const fromRate = parseFloat(fromCurrency.exchangeRate as any);
  const toRate = parseFloat(toCurrency.exchangeRate as any);
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}


// ============================================================================
// WORKSPACE LOCALIZATION SETTINGS
// ============================================================================

export async function getWorkspaceLocalizationSettings(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(workspaceLocalizationSettings)
    .where(eq(workspaceLocalizationSettings.workspaceId, workspaceId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateWorkspaceLocalizationSettings(
  workspaceId: number,
  settings: {
    defaultLanguage?: string;
    defaultCurrency?: string;
    dateFormat?: string;
    timezone?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getWorkspaceLocalizationSettings(workspaceId);

  if (existing) {
    return await db
      .update(workspaceLocalizationSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(workspaceLocalizationSettings.workspaceId, workspaceId));
  } else {
    return await db.insert(workspaceLocalizationSettings).values({
      workspaceId,
      defaultLanguage: settings.defaultLanguage || "en",
      defaultCurrency: settings.defaultCurrency || "USD",
      dateFormat: settings.dateFormat || "MM/DD/YYYY",
      timezone: settings.timezone || "UTC",
    });
  }
}

export async function updateUserPreferencesFromWorkspaceDefaults(
  userId: number,
  workspaceId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const workspaceSettings = await getWorkspaceLocalizationSettings(workspaceId);
  if (!workspaceSettings) return;

  const existingPrefs = await db
    .select()
    .from(userPreferences)
    .where(
      and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (existingPrefs.length > 0) {
    await db
      .update(userPreferences)
      .set({
        language: workspaceSettings.defaultLanguage,
        currency: workspaceSettings.defaultCurrency,
        dateFormat: workspaceSettings.dateFormat,
        timezone: workspaceSettings.timezone,
      })
      .where(
        and(
          eq(userPreferences.userId, userId),
          eq(userPreferences.workspaceId, workspaceId)
        )
      );
  } else {
    await db.insert(userPreferences).values({
      userId,
      workspaceId,
      language: workspaceSettings.defaultLanguage,
      currency: workspaceSettings.defaultCurrency,
      dateFormat: workspaceSettings.dateFormat,
      timezone: workspaceSettings.timezone,
    });
  }
}
