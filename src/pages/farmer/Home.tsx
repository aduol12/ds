import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllKits } from '../../api/assets';
import { getLatestSensorData } from '../../api/data';
import { getUserProfile } from '../../api/users';
import { Kit, User, SensorReading } from '../../types/api';
import Loader from '../../components/Loader';

interface FarmWithData extends Kit {
  sensorData?: SensorReading | null;
  isLoading?: boolean;
}

export default function FarmerHomePage() {
  const [farmsWithData, setFarmsWithData] = useState<FarmWithData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userProfile = await getUserProfile();
        setUser(userProfile);

        const kits = await getAllKits();
        // Filter for only active farms
        const farmsList: Kit[] = Array.isArray(kits) ? kits.filter(kit => kit.is_active) : [];

        // Fetch sensor data for each farm
        const farmsDataList = await Promise.all(
          farmsList.map(async (farm) => {
            try {
              const sensorData = await getLatestSensorData(farm.kit_id);
              return {
                ...farm,
                sensorData: sensorData || null,
                isLoading: false,
              };
            } catch (err) {
              console.warn(`Failed to fetch live data for kit ${farm.kit_id}`, err);
              return {
                ...farm,
                sensorData: null,
                isLoading: false,
              };
            }
          })
        );

        setFarmsWithData(farmsDataList);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch farmer data:', err);
        setFarmsWithData([]);
        setError('Failed to load your farms. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHealthStatus = (data: SensorReading | null | undefined): 'healthy' | 'warning' | 'critical' => {
    if (!data) return 'healthy';
    
    const moisture = typeof data.moisture === 'string' ? parseFloat(data.moisture) : (data.moisture || 0);
    const temp = typeof data.temperature === 'string' ? parseFloat(data.temperature) : (data.temperature || 0);
    
    if (moisture < 20 || moisture > 80 || temp > 35) return 'critical';
    if (moisture < 30 || moisture > 75 || temp > 30) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'critical': return 'bg-rose-50 border-rose-200 text-rose-700';
    }
  };

  const getStatusBadgeColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'bg-emerald-100 text-emerald-700';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'critical': return 'bg-rose-100 text-rose-700';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✕';
    }
  };

  const getMoistureValue = (data: SensorReading | null | undefined): number => {
    if (!data?.moisture) return 0;
    return typeof data.moisture === 'string' ? parseFloat(data.moisture) : data.moisture;
  };

  const getTemperatureValue = (data: SensorReading | null | undefined): number => {
    if (!data?.temperature) return 0;
    return typeof data.temperature === 'string' ? parseFloat(data.temperature) : data.temperature;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  const healthyCount = farmsWithData.filter(f => getHealthStatus(f.sensorData) === 'healthy').length;
  const needsAttentionCount = farmsWithData.filter(f => {
    const status = getHealthStatus(f.sensorData);
    return status === 'warning' || status === 'critical';
  }).length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user?.first_name || 'Farmer'}! 👋
            </h1>
            <p className="mt-2 text-slate-600">
              Monitor your farms in real-time and make informed decisions for better yields.
            </p>
          </div>
          <Link
            to="/farmer/irrigation"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Manage Irrigation
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Farms</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{farmsWithData.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-1m6 1l1 3m-1-3l-6 9m0 0l9-3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Healthy Farms</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">{healthyCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Need Attention</p>
              <p className="mt-1 text-3xl font-bold text-amber-600">{needsAttentionCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Farms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Your Farms</h2>
          <Link
            to="/farmer/farm"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View Details →
          </Link>
        </div>

        {farmsWithData.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M7 11v6m6 0v6" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-900">No farms registered yet</p>
            <p className="mt-1 text-sm text-slate-600">Contact your administrator to add your farm.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {farmsWithData.map((farm) => {
              const status = getHealthStatus(farm.sensorData);
              const moisture = getMoistureValue(farm.sensorData);
              const temperature = getTemperatureValue(farm.sensorData);
              const hasData = farm.sensorData !== null;

              return (
                <Link
                  key={farm.kit_id}
                  to={`/admin/devices/${farm.kit_id}`}
                  className={`group rounded-2xl border-2 p-6 shadow-sm transition-all hover:shadow-md ${getStatusColor(status)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{farm.location_name}</h3>
                      <p className="text-sm text-slate-600">Crop: {farm.crop_type}</p>
                      <p className="text-xs text-slate-500 mt-1">Device ID: {farm.kit_id}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeColor(status)}`}>
                      <span className="mr-1">{getStatusIcon(status)}</span>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white bg-opacity-50 p-3">
                      <p className="text-xs text-slate-600">Soil Moisture</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {hasData ? `${moisture.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white bg-opacity-50 p-3">
                      <p className="text-xs text-slate-600">Temperature</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {hasData ? `${temperature.toFixed(1)}°C` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {!hasData && (
                    <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs text-amber-700 font-medium">⚠ No sensor data available</p>
                      <p className="text-xs text-amber-600 mt-1">Check if device is online</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-current border-opacity-20">
                    <span className="text-sm font-medium text-slate-700">View Details</span>
                    <svg className="h-4 w-4 text-slate-700 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <Link
            to="/farmer/irrigation"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Irrigation</p>
              <p className="text-xs text-slate-500">Manage watering</p>
            </div>
          </Link>

          <Link
            to="/farmer/notifications"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Alerts</p>
              <p className="text-xs text-slate-500">View notifications</p>
            </div>
          </Link>

          <Link
            to="/farmer/learning"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25c0 5.25 3.07 9.338 7.5 11.286M12 6.253c5.5 0 10 4.745 10 11.997 0 5.25-3.07 9.338-7.5 11.286m0 0A17.933 17.933 0 0112 23.75c-5.08 0-9.355-1.529-12.26-3.558" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Learning</p>
              <p className="text-xs text-slate-500">Tips & guides</p>
            </div>
          </Link>

          <Link
            to="/farmer/profile"
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Profile</p>
              <p className="text-xs text-slate-500">Account settings</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">Today's Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">💡</span>
              <span>Check soil moisture levels regularly for optimal crop growth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">💡</span>
              <span>Early morning irrigation reduces water loss through evaporation</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Connected Devices</span>
              <span className="font-medium text-slate-900">
                {farmsWithData.filter(f => f.sensorData).length}/{farmsWithData.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Last Sync</span>
              <span className="font-medium text-slate-900">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
