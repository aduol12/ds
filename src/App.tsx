import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

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
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
