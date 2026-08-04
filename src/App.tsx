import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { ToastsContainer } from "@/components/Toast";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useToasts } from "@/hooks/useToasts";
import { AppRoutes } from "@/routes/AppRoutes";
import { SessionExpiredRedirect } from "@/routes/SessionExpiredRedirect";
import { queryClient } from "@/store/queryClient";

import "@/api/auth.api";

function App() {
  const { toasts, removeToast } = useToasts();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastsContainer toasts={toasts} onDismiss={removeToast} />
      <BrowserRouter>
        <SessionExpiredRedirect />
        <AppRoutes />
        {/* Dev-only floating widget, disabled by default and never present in production builds */}
        <RoleSwitcher />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
