import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, User, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface AgentDataModuleProps {
  projectId: number;
}

export default function AgentDataModule({ projectId }: AgentDataModuleProps) {
  const { user } = useAuth();
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

  const [accountFormData, setAccountFormData] = useState({
    accountName: "",
    accountType: "cash" as "cash" | "bank" | "mobile_money" | "other",
  });

  const [entryFormData, setEntryFormData] = useState({
    entryType: "cash_in" as "cash_in" | "cash_out",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
  });

  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } =
    trpc.agentAccount.list.useQuery({ projectId });

  const { data: entries, isLoading: entriesLoading, refetch: refetchEntries } =
    trpc.agentEntry.list.useQuery(
      { accountId: selectedAccountId! },
      { enabled: !!selectedAccountId }
    );

  const createAccountMutation = trpc.agentAccount.create.useMutation({
    onSuccess: () => {
      toast.success("Agent account created successfully");
      setAccountFormData({ accountName: "", accountType: "cash" });
      setShowCreateAccountForm(false);
      refetchAccounts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const createEntryMutation = trpc.agentEntry.create.useMutation({
    onSuccess: () => {
      toast.success("Entry recorded successfully");
      setEntryFormData({
        entryType: "cash_in",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        reference: "",
      });
      setShowEntryForm(false);
      refetchEntries();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record entry");
    },
  });

  const handleCreateAccount = async () => {
    if (!accountFormData.accountName.trim()) {
      toast.error("Account name is required");
      return;
    }

    await createAccountMutation.mutateAsync({
      projectId,
      accountName: accountFormData.accountName,
      accountType: accountFormData.accountType,
    });
  };

  const handleCreateEntry = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account");
      return;
    }

    if (!entryFormData.amount || parseFloat(entryFormData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    await createEntryMutation.mutateAsync({
      accountId: selectedAccountId,
      entryType: entryFormData.entryType,
      amount: parseFloat(entryFormData.amount),
      date: new Date(entryFormData.date),
      description: entryFormData.description,
      reference: entryFormData.reference,
    });
  };

  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId);
  const totalCashIn =
    entries
      ?.filter((e) => e.entryType === "cash_in")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
  const totalCashOut =
    entries
      ?.filter((e) => e.entryType === "cash_out")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Agent Data Entry</h2>
          <p className="text-muted-foreground mt-1">
            Track cash-in and cash-out for individual agent accounts
          </p>
        </div>
        <Button
          onClick={() => setShowCreateAccountForm(!showCreateAccountForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Account
        </Button>
      </div>

      {/* Create Account Form */}
      {showCreateAccountForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Create Agent Account
          </h3>
          <div className="space-y-4">
            <div>
              <label className="africount-label">Account Name</label>
              <input
                type="text"
                className="africount-input"
                placeholder="e.g., Field Agent 1"
                value={accountFormData.accountName}
                onChange={(e) =>
                  setAccountFormData({
                    ...accountFormData,
                    accountName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="africount-label">Account Type</label>
              <select
                className="africount-input"
                value={accountFormData.accountType}
                onChange={(e) =>
                  setAccountFormData({
                    ...accountFormData,
                    accountType: e.target.value as
                      | "cash"
                      | "bank"
                      | "mobile_money"
                      | "other",
                  })
                }
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Account</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateAccount}
                disabled={createAccountMutation.isPending}
              >
                {createAccountMutation.isPending ? "Creating..." : "Create"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateAccountForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Accounts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Accounts</h3>
          {accountsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="space-y-2">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedAccountId === account.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {account.accountName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {account.accountType}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No accounts yet</p>
            </div>
          )}
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {selectedAccount ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedAccount.accountName} - Entries
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowEntryForm(!showEntryForm)}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Entry
                </Button>
              </div>

              {/* Entry Form */}
              {showEntryForm && (
                <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                  <div>
                    <label className="africount-label text-sm">Type</label>
                    <select
                      className="africount-input text-sm"
                      value={entryFormData.entryType}
                      onChange={(e) =>
                        setEntryFormData({
                          ...entryFormData,
                          entryType: e.target.value as "cash_in" | "cash_out",
                        })
                      }
                    >
                      <option value="cash_in">Cash In</option>
                      <option value="cash_out">Cash Out</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="africount-label text-sm">Amount</label>
                      <input
                        type="number"
                        className="africount-input text-sm"
                        placeholder="0.00"
                        step="0.01"
                        value={entryFormData.amount}
                        onChange={(e) =>
                          setEntryFormData({
                            ...entryFormData,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="africount-label text-sm">Date</label>
                      <input
                        type="date"
                        className="africount-input text-sm"
                        value={entryFormData.date}
                        onChange={(e) =>
                          setEntryFormData({
                            ...entryFormData,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="africount-label text-sm">Description</label>
                    <input
                      type="text"
                      className="africount-input text-sm"
                      placeholder="What was this for?"
                      value={entryFormData.description}
                      onChange={(e) =>
                        setEntryFormData({
                          ...entryFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateEntry}
                      disabled={createEntryMutation.isPending}
                    >
                      {createEntryMutation.isPending ? "Recording..." : "Record"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowEntryForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-success/10 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-success mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Cash In
                  </div>
                  <div className="text-lg font-bold text-success">
                    ${totalCashIn.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-error/10 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-error mb-1">
                    <TrendingDown className="w-3 h-3" />
                    Cash Out
                  </div>
                  <div className="text-lg font-bold text-error">
                    ${totalCashOut.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-2">
                {entriesLoading ? (
                  <div className="text-center text-muted-foreground text-sm">
                    Loading entries...
                  </div>
                ) : entries && entries.length > 0 ? (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {entry.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          entry.entryType === "cash_in"
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {entry.entryType === "cash_in" ? "+" : "-"}$
                        {parseFloat(entry.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No entries yet
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Select an account to view entries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
