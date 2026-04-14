import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";
import { toast } from "sonner";

interface NotificationsModuleProps {
  workspaceId: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsModule({
  workspaceId,
}: NotificationsModuleProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Balance Sheet Created",
      message: "Q1 2026 Balance Sheet has been successfully created",
      type: "success",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      actionUrl: "/balance-sheets/1",
    },
    {
      id: 2,
      title: "Import Completed",
      message: "Your CSV import of 150 transactions has been processed",
      type: "success",
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      actionUrl: "/transactions",
    },
    {
      id: 3,
      title: "New Team Member",
      message: "Jane Smith has joined your workspace",
      type: "info",
      timestamp: new Date(Date.now() - 10800000),
      read: true,
      actionUrl: "/users",
    },
    {
      id: 4,
      title: "Data Export Ready",
      message: "Your requested data export is ready for download",
      type: "info",
      timestamp: new Date(Date.now() - 21600000),
      read: true,
      actionUrl: "/export",
    },
    {
      id: 5,
      title: "Reconciliation Alert",
      message: "Balance sheet discrepancy detected in Assets section",
      type: "warning",
      timestamp: new Date(Date.now() - 43200000),
      read: true,
      actionUrl: "/balance-sheets/1",
    },
    {
      id: 6,
      title: "Permission Updated",
      message: "Your access to Computing Tables module has been updated",
      type: "info",
      timestamp: new Date(Date.now() - 86400000),
      read: true,
      actionUrl: "/rbac",
    },
  ]);

  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const filteredNotifications =
    filterType === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "info":
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/30";
      case "warning":
        return "bg-warning/10 border-warning/30";
      case "error":
        return "bg-destructive/10 border-destructive/30";
      case "info":
        return "bg-info/10 border-info/30";
      default:
        return "bg-muted border-border";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with system alerts and activity notifications
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
          <Button variant="outline" onClick={handleClearAll}>
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filterType === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType("unread")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filterType === "unread"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all ${getNotificationColor(
                notification.type
              )} ${!notification.read ? "bg-opacity-100" : "bg-opacity-50"}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(notification.timestamp)}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {notification.actionUrl && (
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {filterType === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Email Notifications</div>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">In-App Notifications</div>
              <p className="text-sm text-muted-foreground">
                Show notifications in the app
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">
                Collaboration Alerts
              </div>
              <p className="text-sm text-muted-foreground">
                Notify on comments and mentions
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Data Updates</div>
              <p className="text-sm text-muted-foreground">
                Notify on imports and exports
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
        </div>
        <Button className="mt-6">Save Preferences</Button>
      </div>
    </div>
  );
}
