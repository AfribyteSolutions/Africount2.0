import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Calculator,
  Users,
  FileUp,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Download,
  Upload,
  Shield,
  Briefcase,
  Activity,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectsModule from "./modules/ProjectsModule";
import BalanceSheetModule from "./modules/BalanceSheetModule";
import TransactionsModule from "./modules/TransactionsModule";
import AgentDataModule from "./modules/AgentDataModule";
import ComparisonModule from "./modules/ComparisonModule";
import ImportModule from "./modules/ImportModule";
import CollaborationModule from "./modules/CollaborationModule";
import ExportModule from "./modules/ExportModule";
import OrganizationModule from "./modules/OrganizationModule";
import RBACModule from "./modules/RBACModule";
import ComputingTablesModule from "./modules/ComputingTablesModule";
import UserManagementModule from "./modules/UserManagementModule";
import WorkspaceModule from "./modules/WorkspaceModule";
import AuditLogsModule from "./modules/AuditLogsModule";
import NotificationsModule from "./modules/NotificationsModule";
import ProcurementModule from "./modules/ProcurementModule";
import ProductBankModule from "./modules/ProductBankModule";
import BudgetImportModule from "./modules/BudgetImportModule";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import CustomizableAnalyticsDashboard from "./CustomizableAnalyticsDashboard";
import { useState } from "react";

const navigationItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "customizable-analytics", label: "Custom Analytics", icon: Settings },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "balance-sheets", label: "Balance Sheets", icon: BarChart3 },
  { id: "computing-tables", label: "Computing Tables", icon: Calculator },
  { id: "transactions", label: "Transactions", icon: TrendingUp },
  { id: "procurement", label: "Procurement", icon: Briefcase },
  { id: "product-bank", label: "Product Bank", icon: Users },
  { id: "budget-import", label: "Budget Import", icon: FileUp },
  { id: "agent-data", label: "Agent Data", icon: Users },
  { id: "comparisons", label: "Sheet Comparison", icon: FileUp },
  { id: "import", label: "Import Data", icon: FileUp },
  { id: "collaboration", label: "Collaboration", icon: MessageSquare },
  { id: "export", label: "Export Data", icon: FileUp },
  { id: "organizations", label: "Organizations", icon: Users },
  { id: "rbac", label: "Access Control", icon: Users },
  { id: "users", label: "User Management", icon: Users },
  { id: "workspaces", label: "Workspaces", icon: Users },
  { id: "audit", label: "Audit Logs", icon: Activity },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkspaceId] = useState(1);
  const [activeProjectId] = useState(1);

  const currentSection = location.split("/").filter(Boolean)[1] || "overview";

  const handleLogout = async () => {
    await logout();
  };

  const renderModuleContent = () => {
    switch (currentSection) {
        case "analytics":
          return <AnalyticsDashboard />;
        case "customizable-analytics":
          return <CustomizableAnalyticsDashboard />;
      case "projects":
        return <ProjectsModule workspaceId={activeWorkspaceId} />;
      case "balance-sheets":
        return <BalanceSheetModule projectId={activeProjectId} />;
      case "transactions":
        return <TransactionsModule projectId={activeProjectId} />;
      case "procurement":
        return <ProcurementModule />;
      case "agent-data":
        return <AgentDataModule projectId={activeProjectId} />;
      case "comparisons":
        return <ComparisonModule projectId={activeProjectId} />;
      case "import":
        return <ImportModule projectId={activeProjectId} />;
      case "export":
        return <ExportModule projectId={activeProjectId} />;
      case "organizations":
        return <OrganizationModule workspaceId={activeWorkspaceId} />;
      case "rbac":
        return <RBACModule workspaceId={activeWorkspaceId} />;
      case "computing-tables":
        return <ComputingTablesModule projectId={activeProjectId} />;
      case "users":
        return <UserManagementModule workspaceId={activeWorkspaceId} />;
      case "workspaces":
        return <WorkspaceModule currentWorkspaceId={activeWorkspaceId} />;
      case "audit":
        return <AuditLogsModule workspaceId={activeWorkspaceId} />;
      case "notifications":
        return <NotificationsModule workspaceId={activeWorkspaceId} />;
      case "collaboration":
        return <CollaborationModule projectId={activeProjectId} />;
      case "product-bank":
        return <ProductBankModule />;
      case "budget-import":
        return <BudgetImportModule />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Welcome to Africount</h2>
            <p className="text-muted-foreground">
              Select a module from the sidebar to get started.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-card border-r border-border transition-all duration-300 overflow-hidden`}
        >
          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Africount</h1>
              <p className="text-sm text-muted-foreground">Financial Suite</p>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/dashboard/${item.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    currentSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Module Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderModuleContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
