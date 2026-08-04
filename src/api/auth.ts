export {
  login,
  register,
  getCurrentUser,
  restoreSession,
  clearSession,
  logoutRequest,
} from "./auth.api";

import { clearSession, logoutRequest } from "./auth.api";

/** @deprecated Use AuthContext `logout` instead */
export async function logout(): Promise<void> {
  await logoutRequest();
  clearSession();
}
