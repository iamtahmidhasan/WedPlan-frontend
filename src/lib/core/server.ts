import { API_URL } from "@/lib/config";
import { getSession } from "@/lib/core/getSession";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const session = await getSession();
  const token = session?.session.token;

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
}
