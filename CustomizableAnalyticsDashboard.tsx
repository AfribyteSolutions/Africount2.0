import React, { useState, useEffect } from "react";
import { GridLayout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Save, RotateCcw, MessageCircle } from "lucide-react";
import { ChartCommentPanel } from "@/components/ChartCommentPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { KPICard } from "@/components/charts/KPICard";
import { RevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { BudgetVarianceChart } from "@/components/charts/BudgetVarianceChart";
import { CashFlowForecastChart } from "@/components/charts/CashFlowForecastChart";
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart";

interface DashboardChart {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "kpi" | "revenue" | "variance" | "cashflow" | "categories";
}

const CHART_TYPES = [
  { id: "kpi", name: "KPI Cards", component: KPICard },
  { id: "revenue", name: "Revenue vs Expense", component: RevenueExpenseChart },
  { id: "variance", name: "Budget Variance", component: BudgetVarianceChart },
  { id: "cashflow", name: "Cash Flow Forecast", component: CashFlowForecastChart },
  { id: "categories", name: "Top Categories", component: TopCategoriesChart },
];

const DEFAULT_LAYOUT: DashboardChart[] = [
  { i: "kpi-1", x: 0, y: 0, w: 4, h: 2, type: "kpi" },
  { i: "revenue-1", x: 4, y: 0, w: 4, h: 2, type: "revenue" },
  { i: "variance-1", x: 8, y: 0, w: 4, h: 2, type: "variance" },
  { i: "cashflow-1", x: 0, y: 2, w: 6, h: 3, type: "cashflow" },
  { i: "categories-1", x: 6, y: 2, w: 6, h: 3, type: "categories" },
];

export default function CustomizableAnalyticsDashboard() {
  const { user } = useAuth();
  const [charts, setCharts] = useState<DashboardChart[]>(DEFAULT_LAYOUT);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [layoutName, setLayoutName] = useState("My Dashboard");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);

  const saveLayoutMutation = trpc.dashboard.saveLayout.useMutation();
  const listLayoutsQuery = trpc.dashboard.listLayouts.useQuery(
    { workspaceId: user?.currentWorkspaceId || 1 },
    { enabled: !!user?.currentWorkspaceId }
  );

  useEffect(() => {
    if (listLayoutsQuery.data) {
      setSavedLayouts(listLayoutsQuery.data);
    }
  }, [listLayoutsQuery.data]);


  const handleLayoutChange = (newLayout: any) => {
    const updatedCharts = charts.map((chart) => {
      const layoutItem = newLayout.lg?.find((item: any) => item.i === chart.i);
      if (layoutItem) {
        return {
          ...chart,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
      return chart;
    });
    setCharts(updatedCharts);
  };

  const handleAddChart = (chartType: string) => {
    const newChart: DashboardChart = {
      i: `${chartType}-${Date.now()}`,
      x: 0,
      y: Math.max(...charts.map((c) => c.y + c.h), 0),
      w: 4,
      h: 2,
      type: chartType as DashboardChart["type"],
    };
    setCharts([...charts, newChart]);
    setShowAddDialog(false);
  };

  const handleRemoveChart = (chartId: string) => {
    setCharts(charts.filter((c) => c.i !== chartId));
  };

  const handleResetLayout = () => {
    setCharts(DEFAULT_LAYOUT);
  };

  const handleSaveLayout = async () => {
    if (!user?.currentWorkspaceId) return;
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!user?.currentWorkspaceId) return;
    try {
      await saveLayoutMutation.mutateAsync({
        workspaceId: user.currentWorkspaceId,
        name: layoutName,
        layoutConfig: { charts },
        isDefault: false,
      });
      setShowSaveDialog(false);
      await listLayoutsQuery.refetch();
      alert("Dashboard layout saved successfully!");
    } catch (error) {
      alert("Failed to save layout");
    }
  };

  const handleLoadLayout = (layout: any) => {
    if (layout.layoutConfig?.charts) {
      setCharts(layout.layoutConfig.charts);
      setLayoutName(layout.name);
    }
  };

  const renderChart = (chart: DashboardChart) => {
    const ChartComponent = CHART_TYPES.find((c) => c.id === chart.type)?.component;
    if (!ChartComponent) return null;

    return (
      <div key={chart.i} className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm">
            {CHART_TYPES.find((c) => c.id === chart.type)?.name}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedChartId(chart.i);
                setCommentPanelOpen(true);
              }}
              className="h-6 w-6 p-0"
              title="Add comment"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            {editMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveChart(chart.i)}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <ChartComponent {...({} as any)} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <Button
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "default" : "outline"}
        >
          {editMode ? "Done Editing" : "Edit Layout"}
        </Button>

        {editMode && (
          <>
            <Button onClick={() => setShowAddDialog(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Chart
            </Button>
            <Button onClick={handleResetLayout} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </>
        )}

        <Button onClick={handleSaveLayout} variant="default" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Layout
        </Button>
      </div>

      {/* Grid Layout */}
      <div
        className="bg-gray-50 rounded-lg p-4 grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {charts.map((chart) => renderChart(chart))}
      </div>

      {/* Add Chart Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chart to Dashboard</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {CHART_TYPES.map((chartType) => (
              <Button
                key={chartType.id}
                onClick={() => handleAddChart(chartType.id)}
                variant="outline"
                className="h-auto py-4"
              >
                {chartType.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Message */}
      {editMode && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          Drag to rearrange, resize corners to change size, or remove charts. Click "Done Editing"
          when finished.
        </div>
      )}

      {/* Comment Panel */}
      {user && selectedChartId && (
        <ChartCommentPanel
          chartId={selectedChartId}
          workspaceId={user.currentWorkspaceId || 1}
          isOpen={commentPanelOpen}
          onClose={() => setCommentPanelOpen(false)}
        />
      )}

      {/* Save Layout Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Layout Name</label>
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter layout name"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSave} disabled={saveLayoutMutation.isPending}>
                {saveLayoutMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Layout Section */}
      {savedLayouts.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-3">Saved Layouts</h3>
          <div className="grid grid-cols-2 gap-2">
            {savedLayouts.map((layout) => (
              <Button
                key={layout.id}
                variant="outline"
                onClick={() => handleLoadLayout(layout)}
                className="text-left"
              >
                {layout.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
