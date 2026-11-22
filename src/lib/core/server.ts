import { API_URL } from "@/lib/config";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/core/getSession";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const reqHeaders = await headers();
  const jwtRes = await auth.api.getToken({ headers: reqHeaders }).catch(() => null);
  let token = jwtRes?.token;

  if (!token) {
    const session = await getSession();
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
