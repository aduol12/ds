import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ToastProvider } from "@/hooks/useToasts";
import { AppRoutes } from "@/routes/AppRoutes";
import { SessionExpiredRedirect } from "@/routes/SessionExpiredRedirect";
import { queryClient } from "@/store/queryClient";

import "@/api/auth.api";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <SessionExpiredRedirect />
          <AppRoutes />
          {/* Dev-only floating widget, disabled by default and never present in production builds */}
          <RoleSwitcher />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
