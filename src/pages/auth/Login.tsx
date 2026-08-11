import { useState } from "react";
import { Link } from "react-router-dom";

import {
  getAuthErrorMessage,
  useAuth,
  useAuthNavigation,
} from "@/contexts/AuthContext";
import { useToasts } from "@/hooks/useToasts";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { SessionExpiredError } from "@/utils/ApiError";

function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { redirectToRoleHome } = useAuthNavigation();
  const { addToast } = useToasts();
  const { isInstallable, isIOS, handleInstall } = useInstallPrompt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({
        phone_number: phoneNumber,
        password,
      });
      redirectToRoleHome(user.role);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        addToast("Your session expired. Please sign in again.", "error");
      } else {
        addToast(getAuthErrorMessage(error), "error");
      }
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/droughtsmart.png" alt="DroughtSmart Logo" className="mx-auto h-16 w-16 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">DroughtSmart</h2>
          <p className="mt-2 text-sm text-gray-600">
            Intelligent irrigation management for modern farmers
          </p>
        </div>

        {isInstallable && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <svg className="h-6 w-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900">Install DroughtSmart</h3>
                <p className="text-sm text-green-700">Get quick access from your home screen</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Install App
            </button>
          </div>
        )}

        {isIOS && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Install on iPhone/iPad</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Tap the share button at the bottom</li>
              <li>Select &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
            </ol>
          </div>
        )}

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="0712 345 678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Same phone number you used when registering
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
