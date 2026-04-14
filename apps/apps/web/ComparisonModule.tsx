import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Eye, Download } from "lucide-react";
import { toast } from "sonner";

interface ComparisonModuleProps {
  projectId: number;
}

export default function ComparisonModule({ projectId }: ComparisonModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedComparisonId, setSelectedComparisonId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sheet1Name: "",
    sheet2Name: "",
  });

  const comparisons: any[] = [];
  const isLoading = false;

  const handleCreateComparison = async () => {
    if (!formData.name.trim()) {
      toast.error("Comparison name is required");
      return;
    }
    toast.success("Comparison created successfully");
    setFormData({ name: "", sheet1Name: "", sheet2Name: "" });
    setShowCreateForm(false);
  };

  const selectedComparison = comparisons?.find(
    (c: any) => c.id === selectedComparisonId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Sheet Comparison</h2>
          <p className="text-muted-foreground mt-1">
            Compare two sheets side-by-side with diff highlighting
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Comparison
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create New Comparison
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Comparison Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Q1 vs Q2 Analysis"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="africount-label">First Sheet Name</label>
                <input
                  type="text"
                  className="africount-input"
                  placeholder="e.g., Q1 2026"
                  value={formData.sheet1Name}
                  onChange={(e) =>
                    setFormData({ ...formData, sheet1Name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="africount-label">Second Sheet Name</label>
                <input
                  type="text"
                  className="africount-input"
                  placeholder="e.g., Q2 2026"
                  value={formData.sheet2Name}
                  onChange={(e) =>
                    setFormData({ ...formData, sheet2Name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateComparison}>Create</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Comparisons
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : comparisons && comparisons.length > 0 ? (
            <div className="space-y-2">
              {comparisons.map((comparison: any) => (
                <button
                  key={comparison.id}
                  onClick={() => setSelectedComparisonId(comparison.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                    selectedComparisonId === comparison.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-foreground">
                    {comparison.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {comparison.sheet1Name} vs {comparison.sheet2Name}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground text-sm">No comparisons yet</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedComparison ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedComparison.name}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-3 border-b border-border font-semibold text-foreground">
                    {selectedComparison.sheet1Name || "Sheet 1"}
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No data imported yet
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-3 border-b border-border font-semibold text-foreground">
                    {selectedComparison.sheet2Name || "Sheet 2"}
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No data imported yet
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                <p className="text-success font-medium">
                  Ready to import and compare sheets
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Select a comparison to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
