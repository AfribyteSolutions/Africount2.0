import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Mail, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

interface UserManagementModuleProps {
  workspaceId: number;
}

interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent";
  status: "active" | "pending" | "inactive";
  joinedAt: Date;
  lastActive: Date;
}

export default function UserManagementModule({
  workspaceId,
}: UserManagementModuleProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "agent" as "admin" | "manager" | "agent",
  });

  const [members, setMembers] = useState<WorkspaceMember[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      status: "active",
      joinedAt: new Date(Date.now() - 86400000 * 30),
      lastActive: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "manager",
      status: "active",
      joinedAt: new Date(Date.now() - 86400000 * 20),
      lastActive: new Date(Date.now() - 7200000),
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "agent",
      status: "active",
      joinedAt: new Date(Date.now() - 86400000 * 10),
      lastActive: new Date(Date.now() - 86400000),
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "agent",
      status: "pending",
      joinedAt: new Date(Date.now() - 86400000 * 2),
      lastActive: new Date(),
    },
  ]);

  const handleInviteMember = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (members.some((m) => m.email === formData.email)) {
      toast.error("This member is already in the workspace");
      return;
    }

    const newMember: WorkspaceMember = {
      id: members.length + 1,
      name: formData.email.split("@")[0],
      email: formData.email,
      role: formData.role,
      status: "pending",
      joinedAt: new Date(),
      lastActive: new Date(),
    };

    setMembers([...members, newMember]);
    setFormData({ email: "", role: "agent" });
    setShowInviteForm(false);
    toast.success("Invitation sent successfully");
  };

  const handleRemoveMember = (id: number) => {
    const member = members.find((m) => m.id === id);
    if (member?.role === "admin" && members.filter((m) => m.role === "admin").length === 1) {
      toast.error("Cannot remove the last admin");
      return;
    }

    setMembers(members.filter((m) => m.id !== id));
    if (selectedMemberId === id) {
      setSelectedMemberId(null);
    }
    toast.success("Member removed");
  };

  const handleChangeRole = (id: number, newRole: "admin" | "manager" | "agent") => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
    toast.success("Role updated");
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive";
      case "manager":
        return "bg-primary/10 text-primary";
      case "agent":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage workspace members and their roles
          </p>
        </div>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Invite New Member
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Email Address</label>
              <input
                type="email"
                className="africount-input"
                placeholder="member@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Role</label>
              <select
                className="africount-input"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "manager" | "agent",
                  })
                }
              >
                <option value="agent">Agent - Can enter data</option>
                <option value="manager">Manager - Can manage projects</option>
                <option value="admin">Admin - Full access</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleInviteMember}>Send Invitation</Button>
              <Button
                variant="outline"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Workspace Members ({members.length})
          </h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedMemberId === member.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {member.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {member.status.charAt(0).toUpperCase() +
                          member.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(member.lastActive)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Details */}
        <div className="lg:col-span-1">
          {selectedMember ? (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                  {selectedMember.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedMember.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMember.email}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Role</div>
                  <select
                    className="africount-input text-sm mt-1"
                    value={selectedMember.role}
                    onChange={(e) =>
                      handleChangeRole(
                        selectedMember.id,
                        e.target.value as "admin" | "manager" | "agent"
                      )
                    }
                  >
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium text-foreground mt-1 capitalize">
                    {selectedMember.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Joined</div>
                  <div className="font-medium text-foreground mt-1">
                    {formatDate(selectedMember.joinedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Active</div>
                  <div className="font-medium text-foreground mt-1">
                    {formatTime(selectedMember.lastActive)}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2">
                <Mail className="w-4 h-4" />
                Resend Invitation
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">
                Select a member to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
