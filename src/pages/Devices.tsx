import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DeviceCard from '../components/DeviceCard';
import NoDevices from '../components/NoDevices';
import Loader from '../components/Loader';
import { getAllKits, createKit } from '../api/assets';
import { getLatestSensorData } from '../api/data';
import { DeviceSummary } from '../types/api';
import { useToasts } from '../hooks/useToasts';

function Devices() {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToasts();
  const [newDevice, setNewDevice] = useState({
    location_name: '',
    crop_type: '',
    latitude: 0,
    longitude: 0,
    reading_interval_active_min: 5,
    reading_interval_idle_min: 30,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    const numericFields = ['latitude', 'longitude', 'reading_interval_active_min', 'reading_interval_idle_min'];
    if (numericFields.includes(name)) {
      setNewDevice((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setNewDevice((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', newDevice);
    console.log('Attempting to add device with data:', newDevice);
    try {
      const createdKit = await createKit(newDevice);
      setDevices((prev) => [...prev, createdKit]);
      setShowAddDevice(false);
      addToast('Device added successfully!', 'success');
    } catch (err) {
      console.error('Failed to add device:', err);
      addToast('Failed to add device.', 'error');
    }
  };


  useEffect(() => {
    const fetchDevicesAndData = async () => {
      try {
        const kits = await getAllKits();
        const devicesWithLiveData = await Promise.all(
          kits.map(async (kit: any) => {
            try {
              const liveData = await getLatestSensorData(kit.kit_id);
              return { ...kit, latest_reading: liveData };
            } catch (error) {
              console.error(`Failed to fetch live data for kit ${kit.kit_id}`, error);
              return { ...kit, latest_reading: null };
            }
          })
        );
        setDevices(devicesWithLiveData);
      } catch (err) {
        setError('Failed to fetch devices or live data');
      } finally {
        setLoading(false);
      }
    };

    fetchDevicesAndData();
  }, []);
  const activeDevices = devices.filter((device) => device.is_active).length;
  const offlineDevices = devices.filter((device) => !device.is_active).length;
  // TODO: Add maintenance status
  const maintenanceDevices = 0;
  const avgBattery =
    devices.length > 0
      ? Math.round(
          devices.reduce((acc, device) => {
            return acc + (device.latest_reading?.battery ?? 0);
          }, 0) / devices.length
        )
      : 0;


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
            <p className="text-gray-600">Monitor and manage your IoT sensor devices</p>
          </div>
          <button
            onClick={() => {
              console.log('Add Device button clicked');
              setShowAddDevice(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Device</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Offline</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{offlineDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{maintenanceDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Battery</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{avgBattery}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by status:</label>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0">
                <option value="all">All Devices</option>
                <option value="active">Active</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Location:</label>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0">
                <option value="all">All Fields</option>
                <option value="north">North Field</option>
                <option value="south">South Field</option>
                <option value="east">East Field</option>
                <option value="west">West Field</option>
              </select>
            </div>
          </div>
        </div>

        {/* Devices Grid */}
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.kit_id} device={device} />
            ))}
          </div>
        ) : (
          <NoDevices onAddDevice={() => setShowAddDevice(true)} />
        )}

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Device</h3>
                <button
                  onClick={() => setShowAddDevice(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={handleAddDevice}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                  <input
                    type="text"
                    name="location_name"
                    value={newDevice.location_name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., North Field, Zone A"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <input
                    type="text"
                    name="crop_type"
                    value={newDevice.crop_type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Maize"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      step="0.000001"
                      value={newDevice.latitude}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., -1.17"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      step="0.000001"
                      value={newDevice.longitude}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 36.95"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Interval (min)</label>
                    <input
                      type="number"
                      name="reading_interval_active_min"
                      min="1"
                      value={newDevice.reading_interval_active_min}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idle Interval (min)</label>
                    <input
                      type="number"
                      name="reading_interval_idle_min"
                      min="1"
                      value={newDevice.reading_interval_idle_min}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 30"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDevice(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Device
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Devices;