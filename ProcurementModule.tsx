import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, Clock, TrendingUp, DollarSign } from "lucide-react";

interface BudgetRequest {
  id: number;
  title: string;
  description: string;
  totalAmount: number;
  status: "submitted" | "approved" | "rejected" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  submittedBy: string;
  submittedDate: string;
  dueDate?: string;
  lineItems?: LineItem[];
}

interface LineItem {
  id: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  vendor?: string;
}

interface ApprovalRequest {
  id: number;
  budgetRequest: BudgetRequest;
  approvalStatus: "pending" | "approved" | "rejected" | "commented";
  linkedProject?: string;
  linkedBalanceSheet?: string;
}

const ProcurementModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BudgetRequest | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newLineItem, setNewLineItem] = useState({ itemName: "", quantity: 1, unitPrice: 0, category: "" });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const addLineItem = () => {
    if (!newLineItem.itemName || newLineItem.quantity <= 0 || newLineItem.unitPrice <= 0) {
      setFormErrors([...formErrors, "Please fill in all line item fields"]);
      return;
    }
    const item: LineItem = {
      id: Date.now(),
      itemName: newLineItem.itemName,
      quantity: newLineItem.quantity,
      unitPrice: newLineItem.unitPrice,
      totalPrice: newLineItem.quantity * newLineItem.unitPrice,
      category: newLineItem.category,
    };
    setLineItems([...lineItems, item]);
    setNewLineItem({ itemName: "", quantity: 1, unitPrice: 0, category: "" });
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const validateSubmitForm = () => {
    const errors: string[] = [];
    if (!selectedProject || selectedProject === "") {
      errors.push("Project selection is required");
    }
    if (lineItems.length === 0) {
      errors.push("At least one line item is required");
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Mock data
  const budgetRequests: BudgetRequest[] = [
    {
      id: 1,
      title: "Office Equipment Purchase",
      description: "New computers and monitors for the finance team",
      totalAmount: 15000,
      status: "submitted",
      priority: "high",
      submittedBy: "John Doe",
      submittedDate: "2026-04-10",
      dueDate: "2026-04-30",
      lineItems: [
        { id: 1, itemName: "Dell Laptop", quantity: 5, unitPrice: 1200, totalPrice: 6000, category: "Equipment", vendor: "Dell" },
        { id: 2, itemName: "Monitor 27\"", quantity: 5, unitPrice: 400, totalPrice: 2000, category: "Equipment", vendor: "LG" },
        { id: 3, itemName: "Desk Chair", quantity: 5, unitPrice: 300, totalPrice: 1500, category: "Furniture" },
      ],
    },
    {
      id: 2,
      title: "Software Licenses",
      description: "Annual licenses for accounting software",
      totalAmount: 8500,
      status: "approved",
      priority: "medium",
      submittedBy: "Jane Smith",
      submittedDate: "2026-04-08",
      dueDate: "2026-05-15",
    },
  ];

  const approvalRequests: ApprovalRequest[] = [
    {
      id: 1,
      budgetRequest: budgetRequests[0],
      approvalStatus: "pending",
      linkedProject: "Q2 Office Upgrade",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "submitted":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "in_progress":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "outline",
      approved: "default",
      rejected: "destructive",
      in_progress: "secondary",
      completed: "default",
    };
    return variants[status] || "outline";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-600 mt-1">Submit and manage budget requests with approval workflows</p>
        </div>
        <Button onClick={() => setShowSubmitForm(true)} className="bg-accent hover:bg-accent-dark">
          Submit Budget Request
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budgets</p>
                <p className="text-2xl font-bold text-gray-900">$23,500</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">1</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-blue-600">50%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Budget Requests</CardTitle>
              <CardDescription>View and manage all budget requests across your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <Badge variant={getStatusBadge(request.status)} className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>Submitted by: {request.submittedBy}</span>
                          <span>Date: {request.submittedDate}</span>
                          {request.dueDate && <span>Due: {request.dueDate}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${request.totalAmount.toLocaleString()}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                          className="mt-2"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>Budget requests waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvalRequests.length > 0 ? (
                  approvalRequests.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{approval.budgetRequest.title}</h3>
                          <p className="text-sm text-gray-600">{approval.budgetRequest.description}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">${approval.budgetRequest.totalAmount.toLocaleString()}</p>
                      </div>

                      {approval.budgetRequest.lineItems && (
                        <div className="mb-4 bg-gray-50 rounded p-3">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Line Items:</p>
                          <div className="space-y-1 text-sm">
                            {approval.budgetRequest.lineItems.map((item) => (
                              <div key={item.id} className="flex justify-between text-gray-600">
                                <span>{item.itemName} (x{item.quantity})</span>
                                <span>${item.totalPrice.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRequest(approval.budgetRequest);
                            setShowApprovalForm(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button variant="destructive">Reject</Button>
                        <Button variant="outline">Request Changes</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No pending approvals</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Budgets</CardTitle>
              <CardDescription>Successfully approved budget requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetRequests
                  .filter((r) => r.status === "approved")
                  .map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <p className="text-sm text-gray-600">{request.description}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">${request.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Procurement History</CardTitle>
              <CardDescription>Timeline of all budget request activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4 py-2">
                  <p className="font-semibold text-gray-900">Office Equipment Purchase - Submitted</p>
                  <p className="text-sm text-gray-600">Submitted by John Doe on 2026-04-10</p>
                </div>
                <div className="border-l-2 border-yellow-600 pl-4 py-2">
                  <p className="font-semibold text-gray-900">Software Licenses - Approved</p>
                  <p className="text-sm text-gray-600">Approved by Manager on 2026-04-09</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Submit Budget Request</CardTitle>
              <CardDescription>Create a new budget request with line items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Request Title</label>
                <Input placeholder="e.g., Office Equipment Purchase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <Textarea placeholder="Describe the purpose and details of this budget request" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Project (Required)</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Select Project --</option>
                  <option value="none">None</option>
                  <option value="q2-office">Q2 Office Upgrade</option>
                  <option value="it-infra">IT Infrastructure</option>
                  <option value="new">+ Create New Project</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Total Amount (Auto-calculated)</label>
                  <Input type="number" value={calculateTotal()} disabled className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Due Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
                  <Input placeholder="e.g., Equipment, Software, Travel" />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Line Items</h3>
                
                {/* Add New Line Item Form */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Item name"
                      value={newLineItem.itemName}
                      onChange={(e) => setNewLineItem({ ...newLineItem, itemName: e.target.value })}
                    />
                    <Input
                      placeholder="Category"
                      value={newLineItem.category}
                      onChange={(e) => setNewLineItem({ ...newLineItem, category: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={newLineItem.quantity}
                      onChange={(e) => setNewLineItem({ ...newLineItem, quantity: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={newLineItem.unitPrice}
                      onChange={(e) => setNewLineItem({ ...newLineItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                    <Button onClick={addLineItem} className="bg-accent hover:bg-accent-dark">
                      Add
                    </Button>
                  </div>
                </div>

                {/* Line Items List */}
                {lineItems.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {lineItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white border rounded p-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          <p className="text-xs text-gray-600">{item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.totalPrice.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Errors */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  {formErrors.map((error, idx) => (
                    <p key={idx} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowSubmitForm(false);
                  setLineItems([]);
                  setSelectedProject("");
                  setFormErrors([]);
                }}>
                  Cancel
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent-dark"
                  onClick={() => {
                    if (validateSubmitForm()) {
                      // Submit form
                      setShowSubmitForm(false);
                      setLineItems([]);
                      setSelectedProject("");
                      setFormErrors([]);
                    }
                  }}
                >
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approval Form Modal */}
      {showApprovalForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Approve Budget Request</CardTitle>
              <CardDescription>Review and approve: {selectedRequest.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">${selectedRequest.totalAmount.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Link to Project</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">-- None (Optional) --</option>
                  <option>Q2 Office Upgrade</option>
                  <option>IT Infrastructure</option>
                  <option value="new">+ Create New Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Link to Balance Sheet</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">-- None (Optional) --</option>
                  <option>Q2 2026 Balance Sheet</option>
                  <option>Fixed Assets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Balance Sheet Section</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Assets</option>
                  <option>Liabilities</option>
                  <option>Equity</option>
                  <option>Expense</option>
                  <option>Revenue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Approval Comments</label>
                <Textarea placeholder="Add any comments or conditions for approval" rows={3} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowApprovalForm(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">Approve & Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProcurementModule;
