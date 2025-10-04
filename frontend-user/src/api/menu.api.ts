// menu.api.ts
import { api } from "./client";

export async function fetchMenu() {
  return api(`/api/user/menu`, { method: "GET" });
}
