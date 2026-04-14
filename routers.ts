import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============================================================================
// UTILITY PROCEDURES
// ============================================================================

/**
 * Check if user has permission for a module
 */
async function checkModulePermission(
  workspaceId: number,
  userId: number,
  module: string,
  action: "read" | "write" | "delete" | "manage"
): Promise<boolean> {
  const member = await db.getWorkspaceMemberRole(workspaceId, userId);
  if (!member) return false;

  // Admins have all permissions
  if (member.role === "admin") return true;

  // Get module permissions
  const permissions = await db.getModulePermissions(member.id);
  const modulePerms = permissions.find((p) => p.module === module);

  if (!modulePerms) {
    // Default permissions based on role
    if (member.role === "manager") return action !== "delete";
    if (member.role === "agent") return action === "read";
    return false;
  }

  if (action === "read") return modulePerms.canRead;
  if (action === "write") return modulePerms.canWrite;
  if (action === "delete") return modulePerms.canDelete;
  if (action === "manage") return modulePerms.canManagePermissions;

  return false;
}

// ============================================================================
// ORGANIZATION ROUTER
// ============================================================================

const organizationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.createOrganization(
        input.name,
        input.slug,
        ctx.user.id,
        input.description
      );
      return result;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getOrganizationsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOrganizationById(input.id);
    }),
});

// ============================================================================
// WORKSPACE ROUTER
// ============================================================================

const workspaceRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns the organization
      const org = await db.getOrganizationById(input.organizationId);
      if (!org || org.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const result = await db.createWorkspace(
        input.organizationId,
        input.name,
        input.description
      );

      // Add creator as admin
      const workspaceId = (result as any).insertId;
      await db.addWorkspaceMember(workspaceId, ctx.user.id, "admin");

      return result;
    }),

  list: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const org = await db.getOrganizationById(input.organizationId);
      if (!org || org.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await db.getWorkspacesByOrganization(input.organizationId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getWorkspaceById(input.id);
    }),

  getMembers: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getWorkspaceMembers(input.workspaceId);
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "manager", "agent"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const canManage = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "projects",
        "manage"
      );
      if (!canManage) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.addWorkspaceMember(input.workspaceId, input.userId, input.role);
    }),

  getLocalizationSettings: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getWorkspaceLocalizationSettings(input.workspaceId);
    }),

  setLocalizationSettings: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        defaultLanguage: z.string().optional(),
        defaultCurrency: z.string().optional(),
        dateFormat: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member || member.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { workspaceId, ...settings } = input;
      return await db.createOrUpdateWorkspaceLocalizationSettings(workspaceId, settings);
    }),
});

// ============================================================================
// PROJECT ROUTER
// ============================================================================

const projectRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const canWrite = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "projects",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const result = await db.createProject(
        input.workspaceId,
        input.name,
        ctx.user.id,
        input.description
      );

      const projectId = (result as any).insertId;
      await db.addProjectMember(projectId, ctx.user.id, "owner");

      return result;
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "projects",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const allProjects = await db.getProjectsByWorkspace(input.workspaceId);
      const isAdmin = await db.isUserWorkspaceAdmin(ctx.user.id, input.workspaceId);
      
      if (isAdmin) return allProjects;
      
      const accessibleProjects = [];
      for (const project of allProjects) {
        const isMember = await db.isUserProjectMember(ctx.user.id, project.id);
        if (isMember) accessibleProjects.push(project);
      }
      return accessibleProjects;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "projects",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const hasAccess = await db.canAccessProject(ctx.user.id, input.id, project.workspaceId);
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });

      return project;
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        userId: z.number(),
        role: z.enum(["owner", "editor", "viewer"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const hasAccess = await db.canAccessProject(ctx.user.id, input.projectId, project.workspaceId);
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });

      const canManage = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "projects",
        "manage"
      );
      if (!canManage) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.addProjectMember(input.projectId, input.userId, input.role);
    }),

  getMembers: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await db.getProjectMembers(input.projectId);
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "archived", "completed"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "projects",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.status !== undefined) updates.status = input.status;

      return await db.updateProject(input.projectId, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canDelete = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "projects",
        "delete"
      );
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteProject(input.projectId);
    }),

  removeMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canManage = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "projects",
        "manage"
      );
      if (!canManage) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.removeProjectMember(input.projectId, input.userId);
    }),
});



// ============================================================================
// TRANSACTION ROUTER
// ============================================================================

const transactionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        type: z.enum(["cash_in", "cash_out", "transfer", "adjustment"]),
        date: z.date(),
        amount: z.number(),
        description: z.string().optional(),
        category: z.string().optional(),
        account: z.string().optional(),
        reference: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createTransaction(
        input.projectId,
        input.type,
        input.date,
        input.amount,
        ctx.user.id,
        input.description,
        input.category,
        input.account,
        input.reference,
        input.notes
      );
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getTransactionsByProjectForAnalytics(input.projectId);
    }),

  filter: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        type: z.string().optional(),
        category: z.string().optional(),
        account: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        searchText: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getTransactionsByFilters(input.projectId, {
        startDate: input.startDate,
        endDate: input.endDate,
        type: input.type,
        category: input.category,
        account: input.account,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        searchText: input.searchText,
      });
    }),

  getStats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      const totalCashIn = transactions
        .filter((t) => t.type === "cash_in")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalCashOut = transactions
        .filter((t) => t.type === "cash_out")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalTransfers = transactions
        .filter((t) => t.type === "transfer")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        totalTransactions: transactions.length,
        totalCashIn,
        totalCashOut,
        totalTransfers,
        netBalance: totalCashIn - totalCashOut,
      };
    }),

  getCategoryStats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      const categoryStats: Record<string, { count: number; total: number }> = {};

      transactions.forEach((t) => {
        const category = t.category || "Uncategorized";
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, total: 0 };
        }
        categoryStats[category].count++;
        categoryStats[category].total += parseFloat(t.amount);
      });

      return categoryStats;
    }),
});

// ============================================================================
// COMMENT ROUTER
// ============================================================================

const commentRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        entityType: z.enum([
          "balance_sheet",
          "transaction",
          "computing_table",
          "sheet_import",
          "general",
        ]),
        entityId: z.number(),
        content: z.string().min(1),
        parentCommentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "collaboration",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createComment(
        input.projectId,
        input.entityType,
        input.entityId,
        ctx.user.id,
        input.content,
        input.parentCommentId
      );
    }),

  getByEntity: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        entityType: z.enum([
          "balance_sheet",
          "transaction",
          "computing_table",
          "sheet_import",
          "general",
        ]),
        entityId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "collaboration",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getCommentsByEntity(
        input.projectId,
        input.entityType,
        input.entityId
      );
    }),


  createChartComment: protectedProcedure
    .input(
      z.object({
        chartId: z.string(),
        workspaceId: z.number(),
        content: z.string().min(1),
        parentCommentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const canWrite = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "collaboration",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createChartComment(
        input.chartId,
        input.workspaceId,
        ctx.user.id,
        input.content,
        input.parentCommentId
      );
    }),

  getChartComments: protectedProcedure
    .input(
      z.object({
        chartId: z.string(),
        workspaceId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "collaboration",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getChartComments(input.chartId, input.limit, input.offset);
    }),

  updateChartComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const canWrite = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "collaboration",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.updateChartComment(input.commentId, input.content);
    }),

  deleteChartComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      const canWrite = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "collaboration",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteChartComment(input.commentId);
    }),

  addReaction: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
        reactionType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.addCommentReaction(input.commentId, ctx.user.id, input.reactionType);
    }),

  removeReaction: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
        reactionType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.removeCommentReaction(input.commentId, ctx.user.id, input.reactionType);
    }),

  getReactions: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getCommentReactions(input.commentId);
    }),

  addMention: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
        mentionedUserId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.addCommentMention(input.commentId, input.mentionedUserId);
    }),

  getMentions: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        workspaceId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getCommentMentions(input.commentId);
    }),


});

// ============================================================================
// ACTIVITY LOG ROUTER
// ============================================================================

const activityRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "collaboration",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getActivityLogsByProject(input.projectId);
    }),
});

// ============================================================================
// AGENT ACCOUNT ROUTER
// ============================================================================

const agentAccountRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        accountName: z.string(),
        accountType: z.enum(["cash", "bank", "mobile_money", "other"]),
        customFields: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "agent_data",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createAgentAccount(
        input.projectId,
        ctx.user.id,
        input.accountName,
        input.accountType,
        input.customFields
      );
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "agent_data",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getAgentAccountsByProject(input.projectId);
    }),
});

// ============================================================================
// AGENT ENTRY ROUTER
// ============================================================================

const agentEntryRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        entryType: z.enum(["cash_in", "cash_out"]),
        amount: z.number(),
        date: z.date(),
        description: z.string().optional(),
        reference: z.string().optional(),
        customData: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const account = await db.getAgentAccountById(input.accountId);
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(account.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "agent_data",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createAgentEntry(
        input.accountId,
        input.entryType,
        input.amount,
        input.date,
        input.description,
        input.reference,
        input.customData
      );
    }),

  list: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .query(async ({ input, ctx }) => {
      const account = await db.getAgentAccountById(input.accountId);
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(account.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "agent_data",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getAgentEntriesByAccount(input.accountId);
    }),
});

// ============================================================================
// PROCUREMENT ROUTER
// ============================================================================

const procurementRouter = router({
  submitBudget: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            category: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "procurement",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      return await db.createBudgetRequest(
        input.projectId,
        ctx.user.id,
        input.title,
        totalAmount,
        input.description,
        undefined,
        undefined,
        undefined,
        input.priority
      );
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "procurement",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getBudgetRequestsByWorkspace(input.workspaceId);
    }),

  approveBudget: protectedProcedure
    .input(
      z.object({
        budgetRequestId: z.number(),
        balanceSheetId: z.number().optional(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const budget = await db.getBudgetRequestById(input.budgetRequestId);
      if (!budget) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(budget.projectId!);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canApprove = await checkModulePermission(
        project!.workspaceId,
        ctx.user.id,
        "procurement",
        "write"
      );
      if (!canApprove) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createBudgetApproval(
        input.budgetRequestId,
        ctx.user.id,
        "approved",
        input.comments,
        input.balanceSheetId ?? undefined
      );
    }),

  rejectBudget: protectedProcedure
    .input(
      z.object({
        budgetRequestId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const budget = await db.getBudgetRequestById(input.budgetRequestId);
      if (!budget) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(budget.projectId!);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canReject = await checkModulePermission(
        project!.workspaceId,
        ctx.user.id,
        "procurement",
        "write"
      );
      if (!canReject) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createBudgetApproval(
        input.budgetRequestId,
        ctx.user.id,
        "rejected",
        input.reason,
        undefined
      );
    }),

  getForApproval: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "procurement",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getBudgetRequestsForApproval(input.workspaceId, ctx.user.id);
    }),

  getRejected: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "procurement",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getRejectedBudgetRequests(input.workspaceId, ctx.user.id);
    }),
});

// ============================================================================
// PRODUCTS ROUTER
// ============================================================================

const productsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.number(),
        unit: z.string().optional(),
        sku: z.string().optional(),
        vendor: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const canWrite = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "product_bank",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createProductService(
        input.workspaceId,
        input.categoryId,
        input.name,
        input.price,
        ctx.user.id,
        input.description,
        input.sku,
        "product",
        input.unit,
        input.vendor
      );
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "product_bank",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getProductServicesByWorkspace(input.workspaceId);
    }),

  search: protectedProcedure
    .input(z.object({ workspaceId: z.number(), query: z.string() }))
    .query(async ({ input, ctx }) => {
      const canRead = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "product_bank",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.searchProductServices(input.workspaceId, input.query);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        workspaceId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        unit: z.string().optional(),
        sku: z.string().optional(),
        vendor: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const canWrite = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "product_bank",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.price !== undefined) updates.price = input.price;
      if (input.unit !== undefined) updates.unit = input.unit;
      if (input.sku !== undefined) updates.sku = input.sku;
      if (input.vendor !== undefined) updates.vendor = input.vendor;
      
      return await db.updateProductService(input.id, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number(), workspaceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const canDelete = await checkModulePermission(
        input.workspaceId,
        ctx.user.id,
        "product_bank",
        "delete"
      );
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteProductService(input.id);
    }),
});

// ============================================================================
// IMPORT ROUTER
// ============================================================================

const importRouter = router({
  parseCSV: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        csvContent: z.string(),
        dataType: z.enum(["transaction", "budget", "product", "balance_sheet"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      // Parse CSV content
      const lines = input.csvContent.trim().split("\n");
      if (lines.length < 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "CSV must have headers and data" });
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });

      return { headers, rows, count: rows.length };
    }),

  validateData: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        rows: z.array(z.record(z.string(), z.unknown())),
        dataType: z.enum(["transaction", "budget", "product", "balance_sheet"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      // Validate rows based on type
      const errors: Array<{ row: number; error: string }> = [];
      const validRows: Array<Record<string, unknown>> = [];

      input.rows.forEach((row, index) => {
        try {
          if (input.dataType === "transaction") {
            const amountStr = String(row.amount || "");
            const dateStr = String(row.date || "");
            if (!dateStr || !amountStr) {
              errors.push({ row: index + 1, error: "Missing date or amount" });
              return;
            }
            if (isNaN(parseFloat(amountStr))) {
              errors.push({ row: index + 1, error: "Invalid amount format" });
              return;
            }
            validRows.push({
              date: new Date(dateStr),
              amount: parseFloat(amountStr),
              description: String(row.description || ""),
              type: String(row.type || "cash_in"),
            });
          }
        } catch (e) {
          errors.push({ row: index + 1, error: String(e) });
        }
      });

      return { validRows, errors, validCount: validRows.length, errorCount: errors.length };
    }),

  createFromImport: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        rows: z.array(z.record(z.string(), z.unknown())),
        dataType: z.enum(["transaction", "budget", "product", "balance_sheet"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      let createdCount = 0;

      if (input.dataType === "transaction") {
        for (const row of input.rows) {
          try {
            const type = (row.type as string) || "cash_in";
            const date = new Date(row.date as string);
            const amount = parseFloat(row.amount as string);
            const description = (row.description as string) || "";
            const category = (row.category as string) || "";
            const account = (row.account as string) || "";
            const reference = (row.reference as string) || "";
            
            if (type === "cash_in" || type === "cash_out" || type === "transfer" || type === "adjustment") {
              await db.createTransaction(
                input.projectId,
                type as "cash_in" | "cash_out" | "transfer" | "adjustment",
                date,
                amount,
                ctx.user.id,
                description,
                category,
                account,
                reference
              );
              createdCount++;
            }
          } catch (e) {
            console.error("Error creating transaction:", e);
          }
        }
      }

      return { createdCount, totalRows: input.rows.length };
    }),
});


// ============================================================================
// EXPORT ROUTER
// ============================================================================

const exportRouter = router({
  exportTransactions: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        format: z.enum(["csv", "excel"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "transactions",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      const filtered = transactions.filter((t) => {
        if (input.startDate && t.date < input.startDate) return false;
        if (input.endDate && t.date > input.endDate) return false;
        return true;
      });

      return {
        data: filtered,
        format: input.format,
        fileName: `transactions_${new Date().toISOString().split("T")[0]}.${input.format === "csv" ? "csv" : "xlsx"}`,
      };
    }),

  exportBalanceSheet: protectedProcedure
    .input(
      z.object({
        balanceSheetId: z.number(),
        format: z.enum(["csv", "excel"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const items = await db.getBalanceSheetItems(input.balanceSheetId);

      return {
        data: { sheet, items },
        format: input.format,
        fileName: `balance_sheet_${new Date().toISOString().split("T")[0]}.${input.format === "csv" ? "csv" : "xlsx"}`,
      };
    }),
});

// ============================================================================
// BALANCE SHEET ROUTER
// ============================================================================

const balanceSheetRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string(),
        period: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createBalanceSheet(input.projectId, input.name, ctx.user.id, input.period);
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getBalanceSheetsByProject(input.projectId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.id);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return sheet;
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        balanceSheetId: z.number(),
        section: z.enum(["assets", "liabilities", "equity"]),
        category: z.string(),
        amount: z.number(),
        description: z.string().optional(),
        sourceFile: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.addBalanceSheetItem(
        input.balanceSheetId,
        input.section,
        input.category,
        input.amount,
        input.description,
        input.sourceFile
      );
    }),

  getItems: protectedProcedure
    .input(z.object({ balanceSheetId: z.number() }))
    .query(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getBalanceSheetItems(input.balanceSheetId);
    }),

  update: protectedProcedure
    .input(
      z.object({
        balanceSheetId: z.number(),
        name: z.string().optional(),
        period: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.period !== undefined) updates.period = input.period;
      if (input.notes !== undefined) updates.notes = input.notes;

      return await db.updateBalanceSheet(input.balanceSheetId, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ balanceSheetId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canDelete = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "delete"
      );
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteBalanceSheet(input.balanceSheetId);
    }),

  updateItem: protectedProcedure
    .input(
      z.object({
        itemId: z.number(),
        balanceSheetId: z.number(),
        section: z.enum(["assets", "liabilities", "equity"]).optional(),
        category: z.string().optional(),
        amount: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = {};
      if (input.section !== undefined) updates.section = input.section;
      if (input.category !== undefined) updates.category = input.category;
      if (input.amount !== undefined) updates.amount = input.amount;
      if (input.description !== undefined) updates.description = input.description;

      return await db.updateBalanceSheetItem(input.itemId, updates);
    }),

  deleteItem: protectedProcedure
    .input(z.object({ balanceSheetId: z.number(), itemId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const sheet = await db.getBalanceSheetById(input.balanceSheetId);
      if (!sheet) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(sheet.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canDelete = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "balance_sheets",
        "delete"
      );
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteBalanceSheetItem(input.itemId);
    }),
});

// ============================================================================
// COMPUTING TABLE ROUTER
// ============================================================================

const computingTableRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string(),
        type: z.enum(["cost_tracking", "revenue_tracking", "custom"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.createComputingTable(
        input.projectId,
        input.name,
        input.type,
        ctx.user.id,
        input.description
      );
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.getComputingTablesByProject(input.projectId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const table = await db.getComputingTableById(input.id);
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(table.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      return table;
    }),

  update: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["cost_tracking", "revenue_tracking", "custom"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const table = await db.getComputingTableById(input.tableId);
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(table.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.type !== undefined) updates.type = input.type;

      return await db.updateComputingTable(input.tableId, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ tableId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const table = await db.getComputingTableById(input.tableId);
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(table.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canDelete = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "delete"
      );
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteComputingTable(input.tableId);
    }),

  addRow: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        rowData: z.record(z.string(), z.unknown()),
        order: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const table = await db.getComputingTableById(input.tableId);
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(table.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.addComputingTableRow(input.tableId, input.rowData, input.order);
    }),

  updateRow: protectedProcedure
    .input(
      z.object({
        tableId: z.number(),
        rowId: z.number(),
        rowData: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const table = await db.getComputingTableById(input.tableId);
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(table.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canWrite = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "write"
      );
      if (!canWrite) throw new TRPCError({ code: "FORBIDDEN" });

      const updates: Record<string, unknown> = {};
      if (input.rowData !== undefined) updates.rowData = input.rowData;

      return await db.updateComputingTableRow(input.rowId, updates);
    }),

  deleteRow: protectedProcedure
    .input(z.object({ tableId: z.number(), rowId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const table = await db.getComputingTableById(input.tableId);
      if (!table) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.getProjectById(table.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canDelete = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "computing_tables",
        "delete"
      );
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.deleteComputingTableRow(input.rowId);
    }),
});


// ============================================================================
// WEBHOOK ROUTER
// ============================================================================

const webhookRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        name: z.string().min(1),
        url: z.string().url(),
        events: z.array(z.string()),
        retryPolicy: z.object({ maxRetries: z.number(), backoffMultiplier: z.number() }).optional(),
        headers: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member || member.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const secret = require("crypto").randomBytes(32).toString("hex");
      return await db.createWebhook(
        input.workspaceId,
        input.name,
        input.url,
        input.events,
        secret,
        input.retryPolicy,
        input.headers
      );
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.listWebhooks(input.workspaceId);
    }),

  get: protectedProcedure
    .input(z.object({ webhookId: z.number(), workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      const webhook = await db.getWebhook(input.webhookId);
      if (!webhook || webhook.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (webhook[0].workspaceId !== input.workspaceId) throw new TRPCError({ code: "FORBIDDEN" });
      return webhook[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        webhookId: z.number(),
        workspaceId: z.number(),
        name: z.string().optional(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        active: z.boolean().optional(),
        retryPolicy: z.object({ maxRetries: z.number(), backoffMultiplier: z.number() }).optional(),
        headers: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member || member.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const webhook = await db.getWebhook(input.webhookId);
      if (!webhook || webhook.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (webhook[0].workspaceId !== input.workspaceId) throw new TRPCError({ code: "FORBIDDEN" });
      const { webhookId, workspaceId, ...updates } = input;
      return await db.updateWebhook(input.webhookId, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ webhookId: z.number(), workspaceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member || member.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const webhook = await db.getWebhook(input.webhookId);
      if (!webhook || webhook.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (webhook[0].workspaceId !== input.workspaceId) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.deleteWebhook(input.webhookId);
    }),

  toggle: protectedProcedure
    .input(z.object({ webhookId: z.number(), workspaceId: z.number(), active: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member || member.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await db.toggleWebhookActive(input.webhookId, input.active);
    }),

  getEvents: protectedProcedure
    .input(z.object({ webhookId: z.number(), workspaceId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      const webhook = await db.getWebhook(input.webhookId);
      if (!webhook || webhook.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (webhook[0].workspaceId !== input.workspaceId) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.getWebhookEvents(input.webhookId, input.limit, input.offset);
    }),

  test: protectedProcedure
    .input(z.object({ webhookId: z.number(), workspaceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member || member.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const webhook = await db.getWebhook(input.webhookId);
      if (!webhook || webhook.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (webhook[0].workspaceId !== input.workspaceId) throw new TRPCError({ code: "FORBIDDEN" });

      const testPayload = {
        event: "webhook.test",
        timestamp: new Date().toISOString(),
        data: { message: "This is a test webhook delivery" },
      };

      await db.createWebhookEvent(input.webhookId, "webhook.test", testPayload);
      return { success: true, message: "Test webhook event created" };
    }),
});

// ============================================================================
// DASHBOARD ROUTER
// ============================================================================

const dashboardRouter = router({
  saveLayout: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        name: z.string().min(1),
        layoutConfig: z.any(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });

      return await db.saveDashboardLayout(
        ctx.user.id,
        input.workspaceId,
        input.name,
        input.layoutConfig,
        input.isDefault
      );
    }),

  listLayouts: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.listDashboardLayouts(ctx.user.id, input.workspaceId);
    }),

  getDefaultLayout: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      const layout = await db.getDefaultDashboardLayout(ctx.user.id, input.workspaceId);
      return layout && layout.length > 0 ? layout[0] : null;
    }),
});

// ============================================================================
// ANALYTICS ROUTER
// ============================================================================

const analyticsRouter = router({
  getProjectMetrics: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "analytics",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      // Get transactions for the project
      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      
      // Calculate KPIs
      const totalIncome = transactions
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      
      const totalExpense = transactions
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      return {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        transactionCount: transactions.length,
        averageTransaction: transactions.length > 0 
          ? (totalIncome + totalExpense) / transactions.length 
          : 0,
      };
    }),

  getRevenueExpenseTrend: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        months: z.number().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "analytics",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      
      // Group by month
      const monthlyData: Record<string, { income: number; expense: number }> = {};
      
      transactions.forEach((t: any) => {
        if (!t.date) return;
        const date = new Date(t.date);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (t.type === "income") {
          monthlyData[monthKey].income += t.amount || 0;
        } else {
          monthlyData[monthKey].expense += t.amount || 0;
        }
      });

      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-input.months)
        .map(([month, data]) => ({
          month,
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense,
        }));
    }),

  getBudgetVariance: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "analytics",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const budgets = await db.getBudgetsByProjectForAnalytics(input.projectId);
      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);

      return budgets.map((budget: any) => {
        const spent = transactions
          .filter((t: any) => t.category === budget.category)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const variance = (budget.amount || 0) - spent;
        const variancePercent = (budget.amount || 0) > 0 
          ? (variance / (budget.amount || 0)) * 100 
          : 0;

        return {
          category: budget.category,
          budgeted: budget.amount,
          spent,
          variance,
          variancePercent,
          status: variance >= 0 ? "under" : "over",
        };
      });
    }),

  getCashFlowForecast: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        forecastMonths: z.number().default(6),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "analytics",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      
      // Calculate average monthly cash flow
      const monthlyFlows: Record<string, number> = {};
      transactions.forEach((t: any) => {
        if (!t.date) return;
        const date = new Date(t.date);
        const monthKey = date.toISOString().substring(0, 7);
        
        if (!monthlyFlows[monthKey]) {
          monthlyFlows[monthKey] = 0;
        }
        
        monthlyFlows[monthKey] += (t.type === "income" ? 1 : -1) * (t.amount || 0);
      });

      const flows = Object.values(monthlyFlows);
      const avgMonthlyFlow = flows.length > 0 
        ? flows.reduce((a, b) => a + b, 0) / flows.length 
        : 0;

      // Generate forecast
      const forecast = [];
      const now = new Date();
      let currentBalance = flows.length > 0 ? flows[flows.length - 1] : 0;

      for (let i = 1; i <= input.forecastMonths; i++) {
        const forecastDate = new Date(now);
        forecastDate.setMonth(forecastDate.getMonth() + i);
        currentBalance += avgMonthlyFlow;

        forecast.push({
          month: forecastDate.toISOString().substring(0, 7),
          forecastedBalance: currentBalance,
          trend: avgMonthlyFlow > 0 ? "positive" : "negative",
        });
      }

      return forecast;
    }),

  getTopCategories: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const canRead = await checkModulePermission(
        project.workspaceId,
        ctx.user.id,
        "analytics",
        "read"
      );
      if (!canRead) throw new TRPCError({ code: "FORBIDDEN" });

      const transactions = await db.getTransactionsByProjectForAnalytics(input.projectId);
      
      const categoryTotals: Record<string, number> = {};
      transactions.forEach((t: any) => {
        const category = t.category || "Uncategorized";
        categoryTotals[category] = (categoryTotals[category] || 0) + (t.amount || 0);
      });

      return Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, input.limit)
        .map(([category, total]) => ({
          category,
          total,
          percentage: (total / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100,
        }));
    }),

  getMetrics: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        metricType: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        projectId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.getMetricsForPeriod(
        input.workspaceId,
        input.metricType,
        input.startDate,
        input.endDate,
        input.projectId
      );
    }),

  aggregateMetrics: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        metricType: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        projectId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.aggregateMetrics(
        input.workspaceId,
        input.metricType,
        input.startDate,
        input.endDate,
        input.projectId
      );
    }),

  getForecasts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        forecastType: z.string().optional(),
        projectId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.listForecasts(input.workspaceId, input.forecastType, input.projectId);
    }),

  getVarianceReports: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        projectId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const member = await db.getWorkspaceMemberRole(input.workspaceId, ctx.user.id);
      if (!member) throw new TRPCError({ code: "FORBIDDEN" });
      return await db.getVarianceReports(
        input.workspaceId,
        input.startDate,
        input.endDate,
        input.projectId
      );
    }),
});

// ============================================================================
// TRANSLATION & LOCALIZATION ROUTERS
// ============================================================================

const translationRouter = router({
  getByLanguage: protectedProcedure
    .input(z.object({ language: z.string() }))
    .query(async ({ input }) => {
      return await db.getTranslationsByLanguage(input.language);
    }),
  getByModule: protectedProcedure
    .input(z.object({ module: z.string(), language: z.string() }))
    .query(async ({ input }) => {
      return await db.getTranslationsByModule(input.module, input.language);
    }),
  set: protectedProcedure
    .input(z.object({ translationKeyId: z.number(), language: z.string(), value: z.string(), isApproved: z.boolean().optional() }))
    .mutation(async ({ input }: any) => {
      return await db.setTranslation(input.translationKeyId, input.language, input.value, input.isApproved || false);
    }),
});

const currencyRouter = router({
  list: publicProcedure.query(async () => {
    return await db.listSupportedCurrencies();
  }),
  get: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return await db.getCurrency(input.code);
    }),
  convert: publicProcedure
    .input(z.object({ amount: z.number(), fromCode: z.string(), toCode: z.string() }))
    .query(async ({ input }) => {
      return await db.convertCurrency(input.amount, input.fromCode, input.toCode);
    }),
  updateExchangeRate: protectedProcedure
    .input(z.object({ code: z.string(), exchangeRate: z.number() }))
    .mutation(async ({ input }: any) => {
      return await db.updateCurrencyExchangeRate(input.code, input.exchangeRate);
    }),
});

const userRouter = router({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const workspaceId = ctx.user.currentWorkspaceId || 0;
    return await db.getUserPreferences(ctx.user.id, workspaceId);
  }),
  setLanguage: protectedProcedure
    .input(z.object({ language: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const workspaceId = ctx.user.currentWorkspaceId || 0;
      return await db.setUserLanguage(ctx.user.id, workspaceId, input.language);
    }),
  setCurrency: protectedProcedure
    .input(z.object({ currency: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const workspaceId = ctx.user.currentWorkspaceId || 0;
      return await db.setUserCurrency(ctx.user.id, workspaceId, input.currency);
    }),
  updatePreferences: protectedProcedure
    .input(z.object({
      language: z.string().optional(),
      currency: z.string().optional(),
      dateFormat: z.string().optional(),
      timezone: z.string().optional(),
      theme: z.enum(["light", "dark"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const workspaceId = ctx.user.currentWorkspaceId || 0;
      return await db.updateUserPreferences(ctx.user.id, workspaceId, input);
    }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================

export const appRouter = router({
  webhook: webhookRouter,
  dashboard: dashboardRouter,
  analytics: analyticsRouter,
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  organization: organizationRouter,
  workspace: workspaceRouter,
  project: projectRouter,
  balanceSheet: balanceSheetRouter,
  computingTable: computingTableRouter,
  transaction: transactionRouter,
  comment: commentRouter,
  activity: activityRouter,
  agentAccount: agentAccountRouter,
  agentEntry: agentEntryRouter,
  procurement: procurementRouter,
  products: productsRouter,
  export: exportRouter,
  translation: translationRouter,
  currency: currencyRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
