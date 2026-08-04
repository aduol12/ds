import { useState, useEffect } from 'react';
import { getUserProfile, updateUserSettings } from '../../api/users';
import { UserSettings } from '../../types/api';
import { useToasts } from '../../hooks/useToasts';

const defaultSettings: UserSettings = {
  notify_email_alerts: true,
  notify_sms_alerts: false,
  notify_push: false,
  alert_weekly_reports: true,
  alert_maintenance: true,
  alert_low_battery: true,
  alert_moisture: true,
  alert_temperature: false,
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  date_format: 'MM/DD/YYYY',
  temp_unit: 'C',
  measurement_unit: 'Metric',
  share_data: false,
  usage_analytics: true,
  marketing_emails: false,
  third_party_integrations: false,
  two_factor_enabled: false,
};

function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { addToast } = useToasts();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile();
        // If settings are null or undefined, use the default settings
        setSettings(userData.settings || defaultSettings);
      } catch (error) {
        console.error('Failed to fetch settings', error);
        addToast('Failed to load settings. Using default values.', 'error');
        setSettings(defaultSettings); // Fallback to default on error
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [addToast]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      await updateUserSettings(settings);
      addToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings', error);
      addToast('Failed to save settings.', 'error');
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  if (!settings) {
    return <div>Could not load settings. Please try again later.</div>;
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your application preferences and account settings</p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email Alerts</h3>
                <p className="text-sm text-gray-600">Receive important alerts via email</p>
              </div>
              <button
                onClick={() => handleSettingChange('notify_email_alerts', !settings.notify_email_alerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notify_email_alerts ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notify_email_alerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">SMS Alerts</h3>
                <p className="text-sm text-gray-600">Receive urgent alerts via text message</p>
              </div>
              <button
                onClick={() => handleSettingChange('notify_sms_alerts', !settings.notify_sms_alerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notify_sms_alerts ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notify_sms_alerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-600">Receive notifications in your browser</p>
              </div>
              <button
                onClick={() => handleSettingChange('notify_push', !settings.notify_push)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notify_push ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notify_push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Alert Types</h3>
              <div className="space-y-3">
                {[
                  { key: 'alert_weekly_reports', label: 'Weekly Reports', desc: 'Summary of your farm data' },
                  { key: 'alert_maintenance', label: 'Maintenance Reminders', desc: 'Device maintenance notifications' },
                  { key: 'alert_low_battery', label: 'Low Battery Alerts', desc: 'When device batteries are low' },
                  { key: 'alert_moisture', label: 'Moisture Alerts', desc: 'Critical soil moisture levels' },
                  { key: 'alert_temperature', label: 'Temperature Alerts', desc: 'Extreme temperature conditions' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange(item.key as keyof UserSettings, !settings[item.key as keyof UserSettings])}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        settings[item.key as keyof UserSettings] ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          settings[item.key as keyof UserSettings] ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="America/Detroit">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select
                value={settings.date_format}
                onChange={(e) => handleSettingChange('date_format', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature Unit</label>
              <select
                value={settings.temp_unit}
                onChange={(e) => handleSettingChange('temp_unit', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Unit</label>
              <select
                value={settings.measurement_unit}
                onChange={(e) => handleSettingChange('measurement_unit', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Metric">Metric</option>
                <option value="Imperial">Imperial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h2>
          <div className="space-y-4">
            {[
              { key: 'share_data', label: 'Data Sharing', desc: 'Share anonymized data to improve our services' },
              { key: 'usage_analytics', label: 'Usage Analytics', desc: 'Help us improve the app with usage data' },
              { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Receive updates about new features and offers' },
              { key: 'third_party_integrations', label: 'Third-party Integrations', desc: 'Allow connections to external services' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleSettingChange(item.key as keyof UserSettings, !settings[item.key as keyof UserSettings])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[item.key as keyof UserSettings] ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[item.key as keyof UserSettings] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button 
                onClick={() => handleSettingChange('two_factor_enabled', !settings.two_factor_enabled)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {settings.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Active Sessions</h3>
                <p className="text-sm text-gray-600">Manage your active login sessions</p>
              </div>
              <button className="text-green-600 hover:text-green-700 font-medium">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium text-red-900">Export Data</h3>
                <p className="text-sm text-red-700">Download all your farm data and settings</p>
              </div>
              <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors">
                Export Data
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default Settings;