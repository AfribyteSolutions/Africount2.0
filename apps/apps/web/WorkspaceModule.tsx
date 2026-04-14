import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Settings, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceModuleProps {
  currentWorkspaceId: number;
}

interface Workspace {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  isActive: boolean;
}

export default function WorkspaceModule({
  currentWorkspaceId,
}: WorkspaceModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(currentWorkspaceId);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 1,
      name: "Default Workspace",
      description: "Your primary workspace",
      memberCount: 3,
      createdAt: new Date(Date.now() - 86400000 * 30),
      isActive: true,
    },
    {
      id: 2,
      name: "Finance Team",
      description: "Dedicated workspace for finance operations",
      memberCount: 5,
      createdAt: new Date(Date.now() - 86400000 * 15),
      isActive: false,
    },
    {
      id: 3,
      name: "Project Alpha",
      description: "Special project workspace",
      memberCount: 8,
      createdAt: new Date(Date.now() - 86400000 * 7),
      isActive: false,
    },
  ]);

  const handleCreateWorkspace = () => {
    if (!formData.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    const newWorkspace: Workspace = {
      id: workspaces.length + 1,
      name: formData.name,
      description: formData.description,
      memberCount: 1,
      createdAt: new Date(),
      isActive: false,
    };

    setWorkspaces([...workspaces, newWorkspace]);
    setFormData({ name: "", description: "" });
    setShowCreateForm(false);
    toast.success("Workspace created successfully");
  };

  const handleSwitchWorkspace = (id: number) => {
    setSelectedWorkspaceId(id);
    setWorkspaces(
      workspaces.map((w) => ({
        ...w,
        isActive: w.id === id,
      }))
    );
    toast.success("Workspace switched");
  };

  const handleDeleteWorkspace = (id: number) => {
    if (id === currentWorkspaceId) {
      toast.error("Cannot delete the current workspace");
      return;
    }

    setWorkspaces(workspaces.filter((w) => w.id !== id));
    toast.success("Workspace deleted");
  };

  const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Workspaces</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage multiple workspaces for different teams or projects
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create Workspace
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Workspace Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Finance Team"
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
                placeholder="Workspace description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateWorkspace}>Create Workspace</Button>
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

      {/* Workspaces Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            All Workspaces
          </h3>
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => setSelectedWorkspaceId(workspace.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedWorkspaceId === workspace.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-foreground">
                        {workspace.name}
                      </h4>
                      {workspace.isActive && (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workspace.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {workspace.memberCount} members
                      </span>
                      <span>
                        Created {workspace.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!workspace.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchWorkspace(workspace.id)}
                      >
                        Switch
                      </Button>
                    )}
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {!workspace.isActive && (
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Details */}
        <div className="lg:col-span-1">
          {selectedWorkspace ? (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Workspace Details
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium text-foreground mt-1">
                    {selectedWorkspace.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Description</div>
                  <div className="font-medium text-foreground mt-1">
                    {selectedWorkspace.description}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Members</div>
                  <div className="font-medium text-foreground mt-1">
                    {selectedWorkspace.memberCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="font-medium text-foreground mt-1">
                    {selectedWorkspace.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium text-foreground mt-1 capitalize">
                    {selectedWorkspace.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Users className="w-4 h-4" />
                  Manage Members
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">
                Select a workspace to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
