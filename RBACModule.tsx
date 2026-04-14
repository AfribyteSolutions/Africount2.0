import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Shield, Check, X } from "lucide-react";
import { toast } from "sonner";

interface RBACModuleProps {
  workspaceId: number;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: "project.create",
    name: "Create Projects",
    description: "Create new projects",
    category: "Projects",
  },
  {
    id: "project.edit",
    name: "Edit Projects",
    description: "Edit project details",
    category: "Projects",
  },
  {
    id: "project.delete",
    name: "Delete Projects",
    description: "Delete projects",
    category: "Projects",
  },
  {
    id: "balance_sheet.create",
    name: "Create Balance Sheets",
    description: "Create balance sheets",
    category: "Balance Sheets",
  },
  {
    id: "balance_sheet.edit",
    name: "Edit Balance Sheets",
    description: "Edit balance sheet data",
    category: "Balance Sheets",
  },
  {
    id: "balance_sheet.export",
    name: "Export Balance Sheets",
    description: "Export balance sheet data",
    category: "Balance Sheets",
  },
  {
    id: "transaction.create",
    name: "Create Transactions",
    description: "Create transactions",
    category: "Transactions",
  },
  {
    id: "transaction.edit",
    name: "Edit Transactions",
    description: "Edit transactions",
    category: "Transactions",
  },
  {
    id: "transaction.delete",
    name: "Delete Transactions",
    description: "Delete transactions",
    category: "Transactions",
  },
  {
    id: "comment.create",
    name: "Create Comments",
    description: "Add comments to entries",
    category: "Collaboration",
  },
  {
    id: "comment.edit",
    name: "Edit Comments",
    description: "Edit own comments",
    category: "Collaboration",
  },
  {
    id: "user.manage",
    name: "Manage Users",
    description: "Add/remove workspace members",
    category: "Administration",
  },
  {
    id: "role.manage",
    name: "Manage Roles",
    description: "Create and modify roles",
    category: "Administration",
  },
];

export default function RBACModule({ workspaceId }: RBACModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "Admin",
      description: "Full access to all features",
      permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
      memberCount: 2,
      isSystem: true,
    },
    {
      id: 2,
      name: "Manager",
      description: "Can manage projects and view reports",
      permissions: [
        "project.create",
        "project.edit",
        "balance_sheet.create",
        "balance_sheet.edit",
        "balance_sheet.export",
        "transaction.create",
        "transaction.edit",
        "comment.create",
      ],
      memberCount: 5,
      isSystem: true,
    },
    {
      id: 3,
      name: "Agent",
      description: "Can enter data and view own entries",
      permissions: [
        "transaction.create",
        "transaction.edit",
        "comment.create",
      ],
      memberCount: 8,
      isSystem: true,
    },
  ]);

  const handleCreateRole = () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const newRole: Role = {
      id: roles.length + 1,
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions,
      memberCount: 0,
      isSystem: false,
    };

    setRoles([...roles, newRole]);
    setFormData({ name: "", description: "", permissions: [] });
    setShowCreateForm(false);
    toast.success("Role created successfully");
  };

  const handleDeleteRole = (id: number) => {
    const role = roles.find((r) => r.id === id);
    if (role?.isSystem) {
      toast.error("Cannot delete system roles");
      return;
    }

    setRoles(roles.filter((r) => r.id !== id));
    if (selectedRoleId === id) {
      setSelectedRoleId(null);
    }
    toast.success("Role deleted");
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter((p) => p !== permissionId)
        : [...formData.permissions, permissionId],
    });
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Role-Based Access Control
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage roles and permissions for your workspace
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Role
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create Role
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Role Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Finance Manager"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Description</label>
              <textarea
                className="africount-input min-h-20 resize-none"
                placeholder="Role description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="africount-label">Permissions</label>
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(
                  ([category, perms]) => (
                    <div key={category}>
                      <h4 className="font-semibold text-foreground text-sm mb-2">
                        {category}
                      </h4>
                      <div className="space-y-2 ml-4">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm.id)}
                              onChange={() =>
                                handlePermissionToggle(perm.id)
                              }
                              className="w-4 h-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {perm.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateRole}>Create Role</Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            All Roles
          </h3>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedRoleId === role.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {role.name}
                      </h4>
                      {role.isSystem && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {role.permissions.length} permissions
                      </span>
                      <span>{role.memberCount} members</span>
                    </div>
                  </div>
                  {!role.isSystem && (
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Details */}
        <div className="lg:col-span-1">
          {selectedRole ? (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Permissions
              </h3>
              <div className="space-y-3">
                {Object.entries(permissionsByCategory).map(
                  ([category, perms]) => {
                    const categoryPerms = perms.filter((p) =>
                      selectedRole.permissions.includes(p.id)
                    );
                    if (categoryPerms.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {categoryPerms.map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-center gap-2 text-sm text-foreground"
                            >
                              <Check className="w-4 h-4 text-success" />
                              {perm.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">
                Select a role to view permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
