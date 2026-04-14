import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface TransactionsModuleProps {
  projectId: number;
}

export default function TransactionsModule({
  projectId,
}: TransactionsModuleProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [formData, setFormData] = useState({
    type: "cash_in" as "cash_in" | "cash_out" | "transfer" | "adjustment",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    category: "",
    account: "",
    reference: "",
  });

  const { data: transactions, isLoading, refetch } = trpc.transaction.list.useQuery({
    projectId,
  });

  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction created successfully");
      setFormData({
        type: "cash_in",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        description: "",
        category: "",
        account: "",
        reference: "",
      });
      setShowCreateForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });

  const handleCreateTransaction = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    await createTransactionMutation.mutateAsync({
      projectId,
      type: formData.type,
      date: new Date(formData.date),
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      account: formData.account,
      reference: formData.reference,
    });
  };

  const filteredTransactions = transactions?.filter((t) => {
    const matchesSearch =
      !searchText ||
      t.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.reference?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !filterType || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalCashIn = filteredTransactions
    ?.filter((t) => t.type === "cash_in")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const totalCashOut = filteredTransactions
    ?.filter((t) => t.type === "cash_out")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Transactions</h2>
          <p className="text-muted-foreground mt-1">
            Track all cash-in and cash-out transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Transaction
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,.xlsx,.xls';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                
                const text = await file.text();
                toast.success("Import file loaded. Feature coming soon!");
              };
              input.click();
            }}
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowUpRight className="w-4 h-4 text-success" />
            Total Cash In
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${totalCashIn.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ArrowDownLeft className="w-4 h-4 text-error" />
            Total Cash Out
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${totalCashOut.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
          <div className="flex items-center gap-2 text-sm text-primary mb-2 font-semibold">
            Net Balance
          </div>
          <div className="text-2xl font-bold text-primary">
            ${(totalCashIn - totalCashOut).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Record Transaction
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="africount-label">Type</label>
              <select
                className="africount-input"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "cash_in" | "cash_out" | "transfer" | "adjustment",
                  })
                }
              >
                <option value="cash_in">Cash In</option>
                <option value="cash_out">Cash Out</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="africount-label">Date</label>
              <input
                type="date"
                className="africount-input"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Amount</label>
              <input
                type="number"
                className="africount-input"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Category</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Sales, Expenses"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Account</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Main Account"
                value={formData.account}
                onChange={(e) =>
                  setFormData({ ...formData, account: e.target.value })
                }
              />
            </div>
            <div>
              <label className="africount-label">Reference</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Invoice #123"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="africount-label">Description</label>
              <textarea
                className="africount-input"
                placeholder="Add details about this transaction..."
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleCreateTransaction}
              disabled={createTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending ? "Recording..." : "Record"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            className="africount-input pl-10"
            placeholder="Search transactions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <select
          className="africount-input"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="cash_in">Cash In</option>
          <option value="cash_out">Cash Out</option>
          <option value="transfer">Transfer</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading transactions...
          </div>
        ) : filteredTransactions && filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="africount-table w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="africount-table-header">Date</th>
                  <th className="africount-table-header">Type</th>
                  <th className="africount-table-header">Description</th>
                  <th className="africount-table-header">Category</th>
                  <th className="africount-table-header text-right">Amount</th>
                  <th className="africount-table-header">Account</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="africount-table-row border-b border-border hover:bg-muted/50"
                  >
                    <td className="africount-table-cell">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="africount-table-cell">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === "cash_in"
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {transaction.type === "cash_in" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3" />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="africount-table-cell">
                      {transaction.description}
                    </td>
                    <td className="africount-table-cell">
                      {transaction.category || "-"}
                    </td>
                    <td className="africount-table-cell text-right font-semibold">
                      ${parseFloat(transaction.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="africount-table-cell">
                      {transaction.account || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
