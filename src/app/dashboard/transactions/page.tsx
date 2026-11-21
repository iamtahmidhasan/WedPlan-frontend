import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/core/server";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, DollarSign, ShieldCheck, Sparkles } from "lucide-react";

type Transaction = {
  _id?: string;
  session_id?: string;
  userId?: string;
  customer_email?: string;
  status?: string;
  payment_status?: string;
  payment_intent?: string;
  payment_date?: string;
  plan?: string;
  amount?: number;
  currency?: string;
};

type UserSummary = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
};

export default async function DashboardTransactionsPage() {
  const [transactionsRes, usersRes] = await Promise.all([
    apiFetch(`/transactions`, { cache: "no-store" }).catch(() => null),
    apiFetch(`/users`, { cache: "no-store" }).catch(() => null),
  ]);

  const transactions: Transaction[] = transactionsRes?.ok
    ? await transactionsRes.json()
    : [];
  const users: UserSummary[] = usersRes?.ok ? await usersRes.json() : [];

  const usersById = new Map<string, UserSummary>();
  for (const user of users) {
    const id = user._id ?? user.id;
    if (id) usersById.set(id, user);
  }

  // Calculate summary metrics
  const totalTransactions = transactions.length;
  const completedCount = transactions.filter(
    (t) => t.status === "complete" || t.payment_status === "paid",
  ).length;
  const totalRevenue = transactions.reduce((acc, t) => {
    const amt = t.amount ? (t.amount > 100 ? t.amount / 100 : t.amount) : 20;
    return acc + amt;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Platform subscription payments, vendor upgrades, and transaction history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Transactions</span>
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight">{totalTransactions}</span>
            <p className="mt-0.5 text-xs text-muted-foreground">Recorded checkout sessions</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Completed Payments</span>
            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight">{completedCount}</span>
            <p className="mt-0.5 text-xs text-muted-foreground">Active premium vendor accounts</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Platform Volume</span>
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight">${totalRevenue.toFixed(2)} USD</span>
            <p className="mt-0.5 text-xs text-muted-foreground">Gross subscription volume</p>
          </div>
        </div>
      </div>

      {/* Transactions Table conforming to Assignment 9 Specification */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Vendor Information</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="text-right">Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  No subscription transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const vendor = usersById.get(transaction.userId ?? "");
                const vendorDisplay =
                  vendor?.businessName ??
                  vendor?.name ??
                  transaction.customer_email ??
                  "Vendor";

                const txId = transaction.session_id || transaction._id || "N/A";
                const displayPlan = transaction.plan || "Lifetime Premium";
                const amountFormatted = transaction.amount
                  ? `$${(transaction.amount > 100 ? transaction.amount / 100 : transaction.amount).toFixed(2)} USD`
                  : "$20.00 USD";

                const isPaid =
                  transaction.status === "complete" ||
                  transaction.payment_status === "paid";

                return (
                  <TableRow key={transaction._id ?? transaction.session_id}>
                    {/* Transaction ID */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-foreground max-w-[180px] truncate" title={txId}>
                          {txId}
                        </span>
                        {transaction.payment_intent && (
                          <span className="font-mono text-[11px] text-muted-foreground max-w-[180px] truncate" title={transaction.payment_intent}>
                            pi: {transaction.payment_intent}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Vendor Name / Email */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {vendorDisplay}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {vendor?.email || transaction.customer_email || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Subscription Plan */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <ShieldCheck className="size-3" />
                        <span>{displayPlan}</span>
                      </span>
                    </TableCell>

                    {/* Amount Paid */}
                    <TableCell className="font-semibold text-foreground">
                      {amountFormatted}
                    </TableCell>

                    {/* Payment Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {transaction.payment_date
                        ? new Date(transaction.payment_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                        )}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Clock className="size-3" />
                        )}
                        <span>{isPaid ? "Paid" : transaction.payment_status ?? "Pending"}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
