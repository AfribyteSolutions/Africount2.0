import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";

interface AuditLogsModuleProps {
  workspaceId: number;
}

interface AuditLog {
  id: number;
  user: string;
  action: string;
  resource: string;
  resourceType: string;
  timestamp: Date;
  ipAddress: string;
  changes?: Record<string, { old: string; new: string }>;
  status: "success" | "failed";
}

export default function AuditLogsModule({
  workspaceId,
}: AuditLogsModuleProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      user: "John Doe",
      action: "created",
      resource: "Balance Sheet Q1 2026",
      resourceType: "balance_sheet",
      timestamp: new Date(Date.now() - 86400000),
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "updated",
      resource: "Assets Section",
      resourceType: "balance_sheet_item",
      timestamp: new Date(Date.now() - 43200000),
      ipAddress: "192.168.1.101",
      changes: {
        amount: { old: "10000", new: "12000" },
      },
      status: "success",
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "deleted",
      resource: "Transaction #1234",
      resourceType: "transaction",
      timestamp: new Date(Date.now() - 21600000),
      ipAddress: "192.168.1.102",
      status: "success",
    },
    {
      id: 4,
      user: "Alice Brown",
      action: "exported",
      resource: "Balance Sheet Q1 2026",
      resourceType: "balance_sheet",
      timestamp: new Date(Date.now() - 10800000),
      ipAddress: "192.168.1.103",
      status: "success",
    },
    {
      id: 5,
      user: "John Doe",
      action: "accessed",
      resource: "Transactions Report",
      resourceType: "report",
      timestamp: new Date(Date.now() - 3600000),
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: 6,
      user: "Jane Smith",
      action: "failed_login",
      resource: "User Login",
      resourceType: "auth",
      timestamp: new Date(Date.now() - 1800000),
      ipAddress: "192.168.1.104",
      status: "failed",
    },
  ]);

  const handleExportLogs = () => {
    const csvContent = [
      ["ID", "User", "Action", "Resource", "Timestamp", "IP Address", "Status"],
      ...auditLogs.map((log) => [
        log.id,
        log.user,
        log.action,
        log.resource,
        log.timestamp.toISOString(),
        log.ipAddress,
        log.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Audit logs exported successfully");
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-success/10 text-success";
      case "updated":
        return "bg-primary/10 text-primary";
      case "deleted":
        return "bg-destructive/10 text-destructive";
      case "exported":
        return "bg-info/10 text-info";
      case "failed_login":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "success"
      ? "bg-success/10 text-success"
      : "bg-destructive/10 text-destructive";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Audit Logs</h2>
          <p className="text-muted-foreground mt-1">
            Complete activity history and compliance tracking
          </p>
        </div>
        <Button onClick={handleExportLogs} className="gap-2">
          <Download className="w-4 h-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="africount-label">From Date</label>
            <input
              type="date"
              className="africount-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="africount-label">To Date</label>
            <input
              type="date"
              className="africount-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <label className="africount-label">User</label>
            <select
              className="africount-input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Users</option>
              <option value="john">John Doe</option>
              <option value="jane">Jane Smith</option>
              <option value="bob">Bob Johnson</option>
              <option value="alice">Alice Brown</option>
            </select>
          </div>
          <div>
            <label className="africount-label">Action</label>
            <select
              className="africount-input"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="exported">Exported</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action.charAt(0).toUpperCase() +
                        log.action.slice(1).replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status.charAt(0).toUpperCase() +
                        log.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">Total Events</div>
          <div className="text-2xl font-bold text-foreground">
            {auditLogs.length}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">
            Successful
          </div>
          <div className="text-2xl font-bold text-success">
            {auditLogs.filter((l) => l.status === "success").length}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">Failed</div>
          <div className="text-2xl font-bold text-destructive">
            {auditLogs.filter((l) => l.status === "failed").length}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">
            Unique Users
          </div>
          <div className="text-2xl font-bold text-primary">
            {new Set(auditLogs.map((l) => l.user)).size}
          </div>
        </div>
      </div>
    </div>
  );
}
