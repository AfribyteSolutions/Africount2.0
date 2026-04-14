import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Settings, Users } from "lucide-react";
import { toast } from "sonner";

interface OrganizationModuleProps {
  workspaceId: number;
}

interface Organization {
  id: number;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  memberCount: number;
}

export default function OrganizationModule({
  workspaceId,
}: OrganizationModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    website: "",
    phone: "",
    address: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 1,
      name: "Acme Corporation",
      description: "Leading financial services company",
      email: "info@acme.com",
      website: "www.acme.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business Ave, New York, NY",
      createdAt: new Date(Date.now() - 86400000 * 30),
      memberCount: 12,
    },
    {
      id: 2,
      name: "Global Enterprises",
      description: "International trading company",
      email: "contact@globalent.com",
      website: "www.globalenterprises.com",
      phone: "+1 (555) 987-6543",
      address: "456 Commerce St, Los Angeles, CA",
      createdAt: new Date(Date.now() - 86400000 * 60),
      memberCount: 8,
    },
  ]);

  const handleCreateOrganization = () => {
    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    const newOrg: Organization = {
      id: organizations.length + 1,
      name: formData.name,
      description: formData.description,
      email: formData.email,
      website: formData.website,
      phone: formData.phone,
      address: formData.address,
      createdAt: new Date(),
      memberCount: 1,
    };

    setOrganizations([...organizations, newOrg]);
    setFormData({
      name: "",
      description: "",
      email: "",
      website: "",
      phone: "",
      address: "",
    });
    setShowCreateForm(false);
    toast.success("Organization created successfully");
  };

  const handleDeleteOrganization = (id: number) => {
    setOrganizations(organizations.filter((org) => org.id !== id));
    if (selectedOrgId === id) {
      setSelectedOrgId(null);
    }
    toast.success("Organization deleted");
  };

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Organizations</h2>
          <p className="text-muted-foreground mt-1">
            Manage your organizations and their settings
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Organization
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create Organization
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Organization Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Acme Corporation"
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
                placeholder="Organization description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="africount-label">Email</label>
                <input
                  type="email"
                  className="africount-input"
                  placeholder="info@organization.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="africount-label">Phone</label>
                <input
                  type="tel"
                  className="africount-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="africount-label">Website</label>
                <input
                  type="url"
                  className="africount-input"
                  placeholder="www.organization.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="africount-label">Address</label>
                <input
                  type="text"
                  className="africount-input"
                  placeholder="123 Business Ave"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateOrganization}>Create</Button>
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

      {/* Organizations Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            All Organizations
          </h3>
          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedOrgId === org.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {org.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {org.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {org.memberCount} members
                      </span>
                      <span>
                        Created{" "}
                        {org.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrganization(org.id)}
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

        {/* Organization Details */}
        <div className="lg:col-span-1">
          {selectedOrg ? (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Organization Details
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium text-foreground">
                    {selectedOrg.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium text-foreground">
                    {selectedOrg.email}
                  </div>
                </div>
                {selectedOrg.phone && (
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="font-medium text-foreground">
                      {selectedOrg.phone}
                    </div>
                  </div>
                )}
                {selectedOrg.website && (
                  <div>
                    <div className="text-xs text-muted-foreground">Website</div>
                    <div className="font-medium text-foreground">
                      {selectedOrg.website}
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">
                Select an organization to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
