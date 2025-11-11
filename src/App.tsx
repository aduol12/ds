import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import ActionPlans from "./pages/ActionPlans";
import LiveData from "./pages/LiveData";
import EditProfile from "./pages/EditProfile";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Analytics from './pages/Analytics';
import DeviceDetail from './pages/DeviceDetail';
import { ToastsContainer } from './components/Toast';
import { useToasts } from './hooks/useToasts';

function App() {
  const { toasts, removeToast } = useToasts();

  return (
    <>
      <ToastsContainer toasts={toasts} onDismiss={removeToast} />
      <BrowserRouter>
        <Routes>
          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main app routes - Dashboard is now the default */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
          <Route path="/device/:deviceId/analytics" element={<Analytics />} />
          <Route path="/live-data" element={<LiveData />} />
          <Route path="/action-plans" element={<ActionPlans />} />
          
          {/* Profile & Settings routes */}
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/settings" element={<Settings />} />

          {/* IMPORTANT: DO NOT place any routes below this. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
