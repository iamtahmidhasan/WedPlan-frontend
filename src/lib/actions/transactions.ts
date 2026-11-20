import { apiFetch } from "@/lib/core/server";

export const transactionVerify = async (session_id: string) => {
  const res = await apiFetch("/transactions/verify", {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });
  return res.json();
};
