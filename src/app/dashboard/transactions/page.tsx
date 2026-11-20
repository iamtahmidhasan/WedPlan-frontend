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

type Transaction = {
  _id?: string;
  session_id?: string;
  userId?: string;
  customer_email?: string;
  status?: string;
  payment_status?: string;
  payment_intent?: string;
  payment_date?: string;
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Premium payment records with vendor details.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const vendor = usersById.get(transaction.userId ?? "");
                const vendorDisplay =
                  vendor?.businessName ??
                  vendor?.name ??
                  vendor?.email ??
                  transaction.customer_email ??
                  "N/A";

                return (
                  <TableRow key={transaction._id ?? transaction.session_id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {transaction.session_id ?? "N/A"}
                        </span>
                        {transaction.payment_intent && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {transaction.payment_intent}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {vendorDisplay}
                        </span>
                        {vendor?.email && (
                          <span className="text-[11px] text-muted-foreground">
                            {vendor.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                          transaction.status === "complete"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {transaction.status ?? "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {transaction.payment_status ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.payment_date
                        ? new Date(transaction.payment_date).toLocaleDateString()
                        : "N/A"}
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
