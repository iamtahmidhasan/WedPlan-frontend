import { API_URL } from "@/lib/config";

interface MinimalUser {
  id?: string;
  _id?: string;
  email?: string;
  isBlocked?: boolean;
}

export async function checkIsUserBlocked(
  user?: MinimalUser | null
): Promise<boolean> {
  if (!user) {
    return false;
  }

  if (user.isBlocked) {
    return true;
  }

  try {
    const res = await fetch(`${API_URL}/users`, { cache: "no-store" });
    if (!res.ok) {
      return false;
    }

    const users = await res.json();
    if (!Array.isArray(users)) {
      return false;
    }

    let matched: MinimalUser | undefined;
    if (user.id) {
      matched = users.find((u: MinimalUser) => u._id === user.id);
      if (!matched) {
        matched = users.find((u: MinimalUser) => u.id === user.id);
      }
    }

    if (!matched && user.email) {
      const email = user.email.toLowerCase();
      matched = users.find(
        (u: MinimalUser) => u.email?.toLowerCase() === email
      );
    }

    return Boolean(matched?.isBlocked);
  } catch {
    return false;
  }
}
