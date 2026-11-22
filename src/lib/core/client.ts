import { authClient } from "@/lib/auth-client";
import { API_URL } from "@/lib/config";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const tokenRes = await authClient.token().catch(() => null);
  let token = tokenRes?.data?.token;

  if (!token) {
    const { data: session } = await authClient.getSession();
    token = session?.session.token;
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}
