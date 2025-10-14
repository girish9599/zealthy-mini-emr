import { cookies } from "next/headers";

const COOKIE = "sessionUserId";

// read user id from the cookie; null if missing
export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies(); // ⬅️ await here
  const v = store.get(COOKIE)?.value;
  return v ? Number(v) : null;
}

export async function setSessionUserId(userId: number) {
  const store = await cookies(); // ⬅️ await here
  store.set(COOKIE, String(userId), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
}

export async function clearSession() {
  const store = await cookies(); // ⬅️ await here
  store.delete(COOKIE);
}
