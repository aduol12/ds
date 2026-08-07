import { useState, useEffect } from 'react';
import { getAllKits } from '../../api/assets';
import { getLatestSensorData } from '../../api/data';
import { getDashboardSummary } from '../../api/dashboard';
import type { Kit, LatestSensorData } from '../../types/api';
import { toNumber } from '../../utils/number';

interface DeviceWithLiveData extends Kit {
  liveData: LatestSensorData | null;
}

function getDeviceStatus(liveData: LatestSensorData | null): 'optimal' | 'warning' | 'critical' | null {
  const moisture = toNumber(liveData?.moisture);
  if (moisture === null) return null;
  const temperature = toNumber(liveData?.temperature) ?? 0;
  if (moisture < 20 || moisture > 80 || temperature > 35) return 'critical';
  if (moisture < 30 || moisture > 75 || temperature > 30) return 'warning';
  return 'optimal';
}

export default function AdminDashboardPage() {
  const [devices, setDevices] = useState<DeviceWithLiveData[]>([]);
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
    farms: 0,
    farmers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allDevices, summary] = await Promise.all([
          getAllKits() as Promise<Kit[]>,
          getDashboardSummary().catch(() => null),
        ]);

        const devicesWithData: DeviceWithLiveData[] = [];
        for (const device of allDevices) {
          try {
            const data = await getLatestSensorData(device.kit_id);
            devicesWithData.push({ ...device, liveData: data });
          } catch {
            devicesWithData.push({ ...device, liveData: null });
          }
        }

        setDevices(devicesWithData);
        const onlineCount = devicesWithData.filter((d) => d.liveData).length;
        setStats({
          totalDevices: summary?.kpis?.kits ?? allDevices.length,
          onlineDevices: onlineCount,
          offlineDevices: allDevices.length - onlineCount,
          criticalAlerts:
            summary?.kpis?.active_alerts ??
            devicesWithData.filter((d) => getDeviceStatus(d.liveData) === 'critical').length,
          warningAlerts: devicesWithData.filter((d) => getDeviceStatus(d.liveData) === 'warning').length,
          farms: summary?.kpis?.farms ?? 0,
          farmers: summary?.kpis?.farmers ?? 0,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setDevices([]);
        setError('Failed to load devices. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading devices...</div>;

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard - Device Monitor</h2>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        {[
          { label: 'Farmers', value: stats.farmers },
          { label: 'Farms', value: stats.farms },
          { label: 'Total Devices', value: stats.totalDevices },
          { label: 'Online', value: stats.onlineDevices },
          { label: 'Offline', value: stats.offlineDevices },
          { label: 'Active Alerts', value: stats.criticalAlerts },
          { label: 'Warnings', value: stats.warningAlerts },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-4">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 font-semibold">Active Devices</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {devices.map((d) => {
            const status = getDeviceStatus(d.liveData);
            return (
              <div key={d.kit_id} className="rounded border p-3">
                <div className="mb-2 flex justify-between">
                  <h4 className="font-medium">{d.location_name}</h4>
                  <span
                    className="rounded px-2 py-1 text-xs"
                    style={{
                      backgroundColor:
                        status === 'critical'
                          ? '#fee2e2'
                          : status === 'warning'
                            ? '#fef3c7'
                            : status === 'optimal'
                              ? '#dcfce7'
                              : '#f1f5f9',
                    }}
                  >
                    {status ?? 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {d.kit_id} • {d.crop_type}
                </p>
                {d.liveData && (
                  <div className="mt-2 text-sm">
                    <p>
                      Moisture: {toNumber(d.liveData.moisture)?.toFixed(1) ?? 'N/A'}% | Temp:{' '}
                      {toNumber(d.liveData.temperature)?.toFixed(1) ?? 'N/A'}°C
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
