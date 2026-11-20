import { apiFetch } from "@/lib/core/server";

export const getPremiumById = async ({ userId }: { userId: string }) => {
  const res = await apiFetch(`/users/premium?id=${userId}`);
  return res.json();
};
