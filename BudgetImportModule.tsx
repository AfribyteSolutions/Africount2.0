import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileUp, CheckCircle, AlertCircle, Download, Eye } from "lucide-react";

interface ImportHistory {
  id: number;
  fileName: string;
  fileType: "csv" | "excel";
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: "pending" | "processing" | "completed" | "failed";
  importDate: string;
  importedBy: string;
}

interface ImportPreview {
  rowNumber: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  vendor?: string;
  status: "valid" | "warning" | "error";
  message?: string;
}

const BudgetImportModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("import");
  const [showImportForm, setShowImportForm] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // Mock data
  const importHistory: ImportHistory[] = [
    {
      id: 1,
      fileName: "Q2_Budget_Request.xlsx",
      fileType: "excel",
      totalRows: 25,
      successfulRows: 24,
      failedRows: 1,
      status: "completed",
      importDate: "2026-04-10",
      importedBy: "John Doe",
    },
    {
      id: 2,
      fileName: "Office_Equipment.csv",
      fileType: "csv",
      totalRows: 12,
      successfulRows: 12,
      failedRows: 0,
      status: "completed",
      importDate: "2026-04-08",
      importedBy: "Jane Smith",
    },
  ];

  const previewData: ImportPreview[] = [
    {
      rowNumber: 1,
      itemName: "Dell Laptop XPS 13",
      quantity: 5,
      unitPrice: 1299.99,
      totalPrice: 6499.95,
      category: "Equipment",
      vendor: "Dell",
      status: "valid",
    },
    {
      rowNumber: 2,
      itemName: "Monitor 27 inch",
      quantity: 5,
      unitPrice: 399.99,
      totalPrice: 1999.95,
      category: "Equipment",
      vendor: "LG",
      status: "valid",
    },
    {
      rowNumber: 3,
      itemName: "Office Chair",
      quantity: 5,
      unitPrice: 349.99,
      totalPrice: 1749.95,
      category: "Furniture",
      status: "warning",
      message: "Vendor not specified",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
      pending: "outline",
    };
    return variants[status] || "outline";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Import</h1>
          <p className="text-gray-600 mt-1">Import budgets from CSV or Excel files</p>
        </div>
        <Button onClick={() => setShowImportForm(true)} className="bg-accent hover:bg-accent-dark">
          <Upload className="w-4 h-4 mr-2" />
          Import Budget
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import New</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Budget File</CardTitle>
              <CardDescription>Upload a CSV or Excel file with your budget data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition">
                <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-900 font-medium mb-1">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-600 mb-4">Supported formats: CSV, Excel (.xlsx, .xls)</p>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                      setShowFieldMapping(true);
                    }
                  }}
                  id="file-input"
                />
                <Button
                  onClick={() => document.getElementById("file-input")?.click()}
                  variant="outline"
                >
                  Select File
                </Button>
              </div>

              {selectedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✓ File selected: <strong>{selectedFile.name}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>View all previous budget imports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.fileName}</h3>
                          <Badge variant={getStatusBadge(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{item.fileType.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Imported by {item.importedBy} on {item.importDate}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Rows</p>
                        <p className="font-semibold text-gray-900">{item.totalRows}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Successful</p>
                        <p className="font-semibold text-green-600">{item.successfulRows}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Failed</p>
                        <p className="font-semibold text-red-600">{item.failedRows}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Templates</CardTitle>
              <CardDescription>Download templates to format your budget data correctly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Basic Budget Template</p>
                    <p className="text-sm text-gray-600">Simple format with essential fields</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download CSV
                  </Button>
                </div>

                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Detailed Budget Template</p>
                    <p className="text-sm text-gray-600">Comprehensive format with all available fields</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download Excel
                  </Button>
                </div>

                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Multi-Project Budget Template</p>
                    <p className="text-sm text-gray-600">For importing budgets across multiple projects</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Field Mapping Modal */}
      {showFieldMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Map Import Fields</CardTitle>
              <CardDescription>Match your file columns to budget fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p>
                  We detected the following columns in your file: <strong>Item Name, Quantity, Unit Price, Total Price, Category, Vendor</strong>
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Item Name</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Item Name (auto-detected)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Quantity</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Quantity (auto-detected)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Unit Price</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Unit Price (auto-detected)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Total Price</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Total Price (auto-detected)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Category (auto-detected)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Vendor</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Vendor (auto-detected)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFieldMapping(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-accent hover:bg-accent-dark"
                  onClick={() => {
                    setShowFieldMapping(false);
                    setShowPreview(true);
                  }}
                >
                  Continue to Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Import Preview</CardTitle>
              <CardDescription>Review the data before importing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p>
                  <strong>Summary:</strong> {previewData.filter((p) => p.status === "valid").length} valid rows,{" "}
                  {previewData.filter((p) => p.status === "warning").length} warnings,{" "}
                  {previewData.filter((p) => p.status === "error").length} errors
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-900 font-semibold">Status</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-semibold">Item Name</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-semibold">Quantity</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-semibold">Unit Price</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-semibold">Total Price</th>
                      <th className="px-4 py-2 text-left text-gray-900 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row) => (
                      <tr key={row.rowNumber} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(row.status)}
                            <span className="text-xs">{row.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">{row.itemName}</td>
                        <td className="px-4 py-2">{row.quantity}</td>
                        <td className="px-4 py-2">${row.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2">${row.totalPrice.toFixed(2)}</td>
                        <td className="px-4 py-2">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setShowFieldMapping(true);
                  }}
                >
                  Back
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Import {previewData.filter((p) => p.status !== "error").length} Items
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BudgetImportModule;
