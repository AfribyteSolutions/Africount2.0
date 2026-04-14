import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, FileUp, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface BalanceSheetModuleProps {
  projectId: number;
}

export default function BalanceSheetModule({
  projectId,
}: BalanceSheetModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", period: "" });

  const { data: sheets, isLoading, refetch } = trpc.balanceSheet.list.useQuery({
    projectId,
  });

  const createSheetMutation = trpc.balanceSheet.create.useMutation({
    onSuccess: () => {
      toast.success("Balance sheet created successfully");
      setFormData({ name: "", period: "" });
      setShowCreateForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create balance sheet");
    },
  });

  const handleCreateSheet = async () => {
    if (!formData.name.trim()) {
      toast.error("Balance sheet name is required");
      return;
    }

    await createSheetMutation.mutateAsync({
      projectId,
      name: formData.name,
      period: formData.period,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Balance Sheets</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage balance sheets with assets, liabilities, and equity
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Balance Sheet
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create New Balance Sheet
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Sheet Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Q1 2026 Balance Sheet"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Period (Optional)</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., January 2026"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateSheet}
                disabled={createSheetMutation.isPending}
              >
                {createSheetMutation.isPending ? "Creating..." : "Create"}
              </Button>
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

      {/* Balance Sheets List */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : sheets && sheets.length > 0 ? (
          <div className="grid gap-4">
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {sheet.name}
                    </h3>
                    {sheet.period && (
                      <p className="text-sm text-muted-foreground">{sheet.period}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>

                {/* Summary Grid */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Assets
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ${parseFloat(sheet.totalAssets || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingDown className="w-4 h-4" />
                      Liabilities
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ${parseFloat(sheet.totalLiabilities || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      Equity
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      ${parseFloat(sheet.totalEquity || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-primary mb-1 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      Net Worth
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${parseFloat(sheet.netWorth || "0").toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileUp className="w-4 h-4" />
                    Import Data
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No balance sheets yet</p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Balance Sheet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
