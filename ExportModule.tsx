import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sheet, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ExportModuleProps {
  projectId: number;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: "csv" | "excel";
  dataType: string;
}

export default function ExportModule({ projectId }: ExportModuleProps) {
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "excel">("csv");
  const [selectedDataType, setSelectedDataType] = useState<string>("balance_sheet");
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<
    Array<{
      id: number;
      name: string;
      format: string;
      date: Date;
      size: string;
    }>
  >([
    {
      id: 1,
      name: "Balance Sheet Q1 2026",
      format: "Excel",
      date: new Date(Date.now() - 86400000),
      size: "245 KB",
    },
    {
      id: 2,
      name: "Transactions January 2026",
      format: "CSV",
      date: new Date(Date.now() - 172800000),
      size: "128 KB",
    },
  ]);

  const dataTypes = [
    { id: "balance_sheet", label: "Balance Sheet", icon: Sheet },
    { id: "transactions", label: "Transactions", icon: FileText },
    { id: "computing_tables", label: "Computing Tables", icon: Sheet },
    { id: "all", label: "All Data", icon: FileText },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fileName = `africount-${selectedDataType}-${new Date().toISOString().split("T")[0]}.${
        selectedFormat === "csv" ? "csv" : "xlsx"
      }`;

      // Create mock data
      const mockData = `Name,Amount,Category,Date
Balance Sheet Item 1,10000,Assets,2026-01-15
Balance Sheet Item 2,5000,Liabilities,2026-01-16`;

      // Create blob and download
      const blob = new Blob([mockData], {
        type:
          selectedFormat === "csv"
            ? "text/csv"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Add to history
      setExportHistory([
        {
          id: exportHistory.length + 1,
          name: `${selectedDataType} Export`,
          format: selectedFormat === "csv" ? "CSV" : "Excel",
          date: new Date(),
          size: "~150 KB",
        },
        ...exportHistory,
      ]);

      toast.success("Export completed successfully");
    } catch (error) {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
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
      <div>
        <h2 className="text-3xl font-bold text-foreground">Export Data</h2>
        <p className="text-muted-foreground mt-1">
          Export your financial data in CSV or Excel format
        </p>
      </div>

      {/* Export Configuration */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Export Settings
            </h3>

            <div className="space-y-4">
              {/* Data Type Selection */}
              <div>
                <label className="africount-label">Select Data to Export</label>
                <div className="grid grid-cols-2 gap-3">
                  {dataTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedDataType(type.id)}
                        className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                          selectedDataType === type.id
                            ? "bg-primary/10 border-primary"
                            : "bg-muted border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium text-foreground">
                            {type.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="africount-label">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "csv", label: "CSV", icon: FileText },
                    { id: "excel", label: "Excel (.xlsx)", icon: Sheet },
                  ].map((format) => {
                    const Icon = format.icon;
                    return (
                      <button
                        key={format.id}
                        onClick={() =>
                          setSelectedFormat(format.id as "csv" | "excel")
                        }
                        className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                          selectedFormat === format.id
                            ? "bg-primary/10 border-primary"
                            : "bg-muted border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium text-foreground">
                            {format.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3 pt-4 border-t border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">
                    Include headers
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-foreground">
                    Include formulas
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">
                    Include comments
                  </span>
                </label>
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full gap-2 mt-6"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Preview
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Data Type
              </div>
              <div className="font-medium text-foreground capitalize">
                {selectedDataType.replace("_", " ")}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Format
              </div>
              <div className="font-medium text-foreground">
                {selectedFormat === "csv" ? "CSV" : "Excel"}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                File Size
              </div>
              <div className="font-medium text-foreground">~150 KB</div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                Ready to export
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Exports
        </h3>
        <div className="space-y-2">
          {exportHistory.map((export_item) => (
            <div
              key={export_item.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {export_item.format === "CSV" ? (
                  <FileText className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sheet className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium text-foreground">
                    {export_item.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(export_item.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {export_item.size}
                </span>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
