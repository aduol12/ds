import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SensorReading from '../components/SensorReading';
import NoDevices from '../components/NoDevices';
import Loader from '../components/Loader';
import { getAllKits } from '../api/assets';
import { getLatestSensorData } from '../api/data';
import { DeviceSummary } from '../types/api';
import { useToasts } from '../hooks/useToasts';

function LiveData() {
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
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
    const numericFields = ['latitude', 'longitude', 'reading_interval_active_min', 'reading_interval_idle_min'];
    if (numericFields.includes(name)) {
      setNewDevice((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setNewDevice((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to add device with data:', newDevice);
    try {
      // This functionality is not available on this page, so we'll just log it.
      console.log('Device creation is not implemented on the LiveData page.');
      addToast('Device creation is not available here.', 'info');
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Sensor Data</h1>
            <p className="text-gray-600">Real-time monitoring of soil conditions across all zones</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="whitespace-nowrap">Live updates every 5 minutes</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Row 1 */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by status:</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0">
                  <option value="all">All Devices</option>
                  <option value="optimal">Optimal</option>
                  <option value="warning">Warning</option>
                  <option value="low">Low Moisture</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Location:</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0">
                  <option value="all">All Fields</option>
                  <option value="north">North Field</option>
                  <option value="south">South Field</option>
                  <option value="east">East Field</option>
                </select>
              </div>
            </div>
            
            {/* Export Button */}
            <div className="flex justify-end">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap">
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Sensor Readings Grid */}
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {devices.map((device) => (
              <SensorReading key={device.kit_id} device={device} />
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

        {/* Emergency Controls */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-900 flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Emergency Water Control</span>
              </h3>
              <p className="text-red-700 text-sm sm:text-base">Instantly activate watering for all zones in critical drought conditions</p>
            </div>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>💧 Emergency Water All Zones</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LiveData;