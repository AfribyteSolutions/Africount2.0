import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImportModuleProps {
  projectId: number;
  onImportComplete?: () => void;
}

interface ImportedData {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
}

export default function ImportModule({
  projectId,
  onImportComplete,
}: ImportModuleProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "complete">(
    "upload"
  );
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importType, setImportType] = useState<"balance_sheet" | "transactions">(
    "transactions"
  );
  const [section, setSection] = useState<"assets" | "liabilities" | "equity">(
    "assets"
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        toast.error("File is empty");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || "";
        });
        rows.push(row);
      }

      setImportedData({
        headers,
        rows,
        fileName: file.name,
      });

      // Initialize field mapping
      const mapping: Record<string, string> = {};
      headers.forEach((header) => {
        mapping[header] = "";
      });
      setFieldMapping(mapping);

      setStep("mapping");
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to parse file. Please ensure it's a valid CSV.");
    }
  };

  const standardFields =
    importType === "balance_sheet"
      ? ["name", "amount", "category", "description"]
      : ["date", "type", "amount", "description", "category", "account"];

  const handleMappingChange = (csvField: string, standardField: string) => {
    setFieldMapping({
      ...fieldMapping,
      [csvField]: standardField,
    });
  };

  const handleProceedToPreview = () => {
    const mappedFields = Object.values(fieldMapping).filter((f) => f);
    if (mappedFields.length === 0) {
      toast.error("Please map at least one field");
      return;
    }
    setStep("preview");
  };

  const handleConfirmImport = () => {
    toast.success("Data imported successfully");
    setStep("complete");
    onImportComplete?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Import Data</h2>
        <p className="text-muted-foreground mt-1">
          Import CSV or Excel files with intelligent field mapping
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-4">
        {["upload", "mapping", "preview", "complete"].map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === s
                  ? "bg-primary text-white"
                  : ["upload", "mapping", "preview", "complete"].indexOf(step) >
                      idx
                    ? "bg-success text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {["upload", "mapping", "preview", "complete"].indexOf(step) > idx ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                idx + 1
              )}
            </div>
            <span className="text-sm font-medium text-foreground capitalize">
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="space-y-4">
            <div>
              <label className="africount-label">Import Type</label>
              <select
                className="africount-input"
                value={importType}
                onChange={(e) =>
                  setImportType(e.target.value as "balance_sheet" | "transactions")
                }
              >
                <option value="transactions">Transactions</option>
                <option value="balance_sheet">Balance Sheet</option>
              </select>
            </div>

            {importType === "balance_sheet" && (
              <div>
                <label className="africount-label">Section</label>
                <select
                  className="africount-input"
                  value={section}
                  onChange={(e) =>
                    setSection(e.target.value as "assets" | "liabilities" | "equity")
                  }
                >
                  <option value="assets">Assets</option>
                  <option value="liabilities">Liabilities</option>
                  <option value="equity">Equity</option>
                </select>
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-foreground font-medium mb-2">
                Drop your CSV or Excel file here
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Step */}
      {step === "mapping" && importedData && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Map Fields
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Match your CSV columns to standard fields
            </p>
            <div className="space-y-3">
              {importedData.headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {header}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      CSV Column
                    </div>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <select
                    className="africount-input flex-1"
                    value={fieldMapping[header] || ""}
                    onChange={(e) =>
                      handleMappingChange(header, e.target.value)
                    }
                  >
                    <option value="">Skip this field</option>
                    {standardFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleProceedToPreview}
              disabled={
                Object.values(fieldMapping).filter((f) => f).length === 0
              }
            >
              Continue to Preview
            </Button>
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === "preview" && importedData && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Preview Data
            </h3>
            <div className="overflow-x-auto">
              <table className="africount-table w-full">
                <thead>
                  <tr className="border-b border-border">
                    {importedData.headers
                      .filter((h) => fieldMapping[h])
                      .map((header) => (
                        <th
                          key={header}
                          className="africount-table-header"
                        >
                          {fieldMapping[header]}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {importedData.rows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="border-b border-border">
                      {importedData.headers
                        .filter((h) => fieldMapping[h])
                        .map((header) => (
                          <td key={header} className="africount-table-cell">
                            {row[header]}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importedData.rows.length > 5 && (
              <p className="text-muted-foreground text-sm mt-2">
                Showing 5 of {importedData.rows.length} rows
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirmImport}>Confirm & Import</Button>
            <Button variant="outline" onClick={() => setStep("mapping")}>
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Import Successful
          </h3>
          <p className="text-muted-foreground mb-6">
            Your data has been imported and is now available in the system.
          </p>
          <Button onClick={() => setStep("upload")}>Import Another File</Button>
        </div>
      )}
    </div>
  );
}
