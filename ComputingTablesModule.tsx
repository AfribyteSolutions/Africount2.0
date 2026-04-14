import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface ComputingTablesModuleProps {
  projectId: number;
}

interface TableCell {
  id: string;
  value: string | number;
  formula?: string;
  isFormula: boolean;
}

interface ComputingTable {
  id: number;
  name: string;
  description: string;
  rows: number;
  columns: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ComputingTablesModule({
  projectId,
}: ComputingTablesModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rows: 5,
    columns: 5,
  });

  const [tables, setTables] = useState<ComputingTable[]>([
    {
      id: 1,
      name: "Monthly Revenue Analysis",
      description: "Track monthly revenue with automatic calculations",
      rows: 12,
      columns: 5,
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      name: "Expense Tracking",
      description: "Categorized expense tracking with totals",
      rows: 8,
      columns: 4,
      createdAt: new Date(Date.now() - 86400000 * 14),
      updatedAt: new Date(Date.now() - 86400000 * 2),
    },
  ]);

  const [tableData, setTableData] = useState<Record<string, TableCell[][]>>({
    "1": Array(12)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map((_, i) => ({
            id: `cell-${Math.random()}`,
            value: i === 0 ? "Item" : i === 4 ? "Total" : "",
            isFormula: false,
          }))
      ),
  });

  const handleCreateTable = () => {
    if (!formData.name.trim()) {
      toast.error("Table name is required");
      return;
    }

    const newTable: ComputingTable = {
      id: tables.length + 1,
      name: formData.name,
      description: formData.description,
      rows: formData.rows,
      columns: formData.columns,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTables([...tables, newTable]);
    setTableData({
      ...tableData,
      [newTable.id]: Array(formData.rows)
        .fill(null)
        .map(() =>
          Array(formData.columns)
            .fill(null)
            .map(() => ({
              id: `cell-${Math.random()}`,
              value: "",
              isFormula: false,
            }))
        ),
    });

    setFormData({ name: "", description: "", rows: 5, columns: 5 });
    setShowCreateForm(false);
    toast.success("Computing table created successfully");
  };

  const handleDeleteTable = (id: number) => {
    setTables(tables.filter((t) => t.id !== id));
    if (selectedTableId === id) {
      setSelectedTableId(null);
    }
    toast.success("Table deleted");
  };

  const handleCellChange = (
    tableId: number,
    row: number,
    col: number,
    value: string
  ) => {
    const table = tableData[tableId];
    if (table) {
      const newTable = table.map((r, rIdx) =>
        rIdx === row
          ? r.map((c, cIdx) =>
              cIdx === col
                ? {
                    ...c,
                    value,
                    isFormula: value.startsWith("="),
                    formula: value.startsWith("=") ? value : undefined,
                  }
                : c
            )
          : r
      );
      setTableData({ ...tableData, [tableId]: newTable });
    }
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const selectedTableContent = selectedTableId
    ? tableData[selectedTableId]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Computing Tables</h2>
          <p className="text-muted-foreground mt-1">
            Create custom tables with formulas and automatic calculations
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Table
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create Computing Table
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Table Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Monthly Revenue Analysis"
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
                placeholder="Table description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="africount-label">Rows</label>
                <input
                  type="number"
                  className="africount-input"
                  min="1"
                  max="100"
                  value={formData.rows}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rows: parseInt(e.target.value) || 5,
                    })
                  }
                />
              </div>
              <div>
                <label className="africount-label">Columns</label>
                <input
                  type="number"
                  className="africount-input"
                  min="1"
                  max="20"
                  value={formData.columns}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      columns: parseInt(e.target.value) || 5,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateTable}>Create Table</Button>
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

      {/* Tables List */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            All Tables
          </h3>
          <div className="space-y-3">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedTableId === table.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {table.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {table.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {table.rows} rows × {table.columns} columns
                      </span>
                      <span>
                        Updated {table.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
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

        {/* Table Editor */}
        <div className="lg:col-span-1">
          {selectedTable && selectedTableContent ? (
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedTable.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTable.description}
                </p>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {selectedTableContent.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.slice(0, 3).map((cell, cIdx) => (
                          <td
                            key={`${rIdx}-${cIdx}`}
                            className="border border-border p-1"
                          >
                            <input
                              type="text"
                              className="w-full px-1 py-0.5 text-xs border-0 bg-muted rounded"
                              value={cell.value}
                              onChange={(e) =>
                                handleCellChange(
                                  selectedTable.id,
                                  rIdx,
                                  cIdx,
                                  e.target.value
                                )
                              }
                              placeholder={
                                cell.isFormula ? "Formula" : "Value"
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 Use formulas like =SUM(A1:A5) or =AVERAGE(B1:B10)
                </p>
                <Button variant="outline" className="w-full gap-2 text-xs">
                  <Download className="w-3 h-3" />
                  Export
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">
                Select a table to edit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
