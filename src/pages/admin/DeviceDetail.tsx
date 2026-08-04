import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getKitById, updateKit } from '../../api/assets';
import { getLatestSensorData, getHistoricalSensorData } from '../../api/data';
import { Kit, SensorReading } from '../../types/api';
import Loader from '../../components/Loader';

function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const [device, setDevice] = useState<Kit | null>(null);
  const [editableDevice, setEditableDevice] = useState<Kit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [irrigationActive, setIrrigationActive] = useState(false);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
  const [irrigationAction, setIrrigationAction] = useState<'start' | 'stop'>('start');
  const [historicalData, setHistoricalData] = useState<SensorReading[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTimeRange, setHistoryTimeRange] = useState('24h');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (activeTab === 'history' && id) {
        setHistoryLoading(true);
        try {
          let from = '';
          let to = '';

          if (historyTimeRange === 'custom') {
            if (dateRange.start && dateRange.end) {
              const startDate = new Date(dateRange.start);
              startDate.setUTCHours(0, 0, 0, 0);
              from = startDate.toISOString();

              const endDate = new Date(dateRange.end);
              endDate.setUTCHours(23, 59, 59, 999);
              to = endDate.toISOString();
            } else {
              // Don't fetch if custom range is not complete, and clear previous data
              setHistoricalData([]);
              setHistoryLoading(false);
              return;
            }
          } else {
            const now = new Date();
            let fromDate = new Date();
            switch (historyTimeRange) {
              case '24h':
                fromDate.setDate(now.getDate() - 1);
                break;
              case '7d':
                fromDate.setDate(now.getDate() - 7);
                break;
              case '30d':
                fromDate.setDate(now.getDate() - 30);
                break;
              default:
                fromDate.setDate(now.getDate() - 1);
            }
            from = fromDate.toISOString();
            to = now.toISOString();
          }
          
          const data = await getHistoricalSensorData(id, from, to);
          if (Array.isArray(data)) {
            data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          }
          setHistoricalData(data);
        } catch (err) {
          console.error("Failed to fetch historical data", err);
          setHistoricalData([]); // Set to empty array on error to show "no data" message
        } finally {
          setHistoryLoading(false);
        }
      }
    };

    fetchHistoricalData();
  }, [activeTab, id, historyTimeRange, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const kitData = await getKitById(id);
        setDevice(kitData);
        setEditableDevice(kitData);
        setIrrigationActive(kitData.is_irrigating);

        try {
          const sensorData = await getLatestSensorData(id);
          setSensorData(sensorData);
        } catch (err: any) {
          if (err.response && err.response.status === 404) {
            setSensorData(null);
          } else {
            setError('Failed to fetch sensor data');
          }
        }
      } catch (err) {
        setError('Failed to fetch device details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableDevice) {
      setEditableDevice({
        ...editableDevice,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSave = async () => {
    if (editableDevice && id) {
      setSaveLoading(true);
      setSaveError(null);
      try {
        const updatedKit = await updateKit(id, editableDevice);
        setDevice(updatedKit);
        setEditableDevice(updatedKit);
        setIsEditing(false);
      } catch (err) {
        setSaveError('Failed to save device details');
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setEditableDevice(device);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'history', label: 'Historical Data', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  const handleIrrigationToggle = (action: 'start' | 'stop') => {
    setIrrigationAction(action);
    setShowIrrigationModal(true);
  };

  const confirmIrrigationAction = () => {
    setIrrigationActive(irrigationAction === 'start');
    setShowIrrigationModal(false);
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <p className="text-red-500">{error}</p>
    );
  }

  if (!device) {
    return (
      <p>Device not found</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link to={`${basePath}/devices`} className="hover:text-green-600">Devices</Link>
              <span>›</span>
              <span className="text-gray-900 truncate">{device.location_name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 truncate">{device.location_name}</h1>
            <p className="text-gray-600 truncate">{device.crop_type}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              device.is_active
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {device.is_active ? 'Active' : 'Offline'}
            </span>
            
            {irrigationActive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                💧 Watering
              </span>
            )}
            
            <Link 
              to={`${basePath}/devices`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Devices
            </Link>
          </div>
        </div>

        {/* Irrigation Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Irrigation Control</span>
              </h2>
              <p className="text-gray-600">
                {irrigationActive 
                  ? 'Irrigation is currently active for this zone' 
                  : 'Control watering for this irrigation zone'
                }
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleIrrigationToggle('start')}
                disabled={irrigationActive || !sensorData}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  irrigationActive || !sensorData
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Start Watering</span>
              </button>
              
              <button
                onClick={() => handleIrrigationToggle('stop')}
                disabled={!irrigationActive}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  !irrigationActive
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                </svg>
                <span>Stop Watering</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-col sm:flex-row sm:space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Current Readings */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Sensor Readings</h3>
              {sensorData ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Soil Moisture</p>
                    <p className="text-2xl font-bold text-blue-600">{sensorData.moisture}%</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="text-2xl font-bold text-gray-900">{sensorData.temperature}°C</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">pH Level</p>
                    <p className="text-2xl font-bold text-gray-900">{sensorData.ph}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">EC (mS/cm)</p>
                    <p className="text-2xl font-bold text-gray-900">{sensorData.ec}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Nitrogen</p>
                    <p className="text-2xl font-bold text-gray-900">{sensorData.nitrogen}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Phosphorus</p>
                    <p className="text-2xl font-bold text-gray-900">{sensorData.phosphorus}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Potassium</p>
                    <p className="text-2xl font-bold text-gray-900">{sensorData.potassium}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-lg font-medium text-gray-700">No sensor data available</p>
                  <p className="text-sm text-gray-500">This device has not reported any data yet.</p>
                </div>
              )}
            </div>

            {/* Right Column - Device Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Device Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditing && editableDevice ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kit ID</label>
                    <input
                      type="text"
                      name="kit_id"
                      value={editableDevice.kit_id}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location_name"
                      value={editableDevice.location_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                    <input
                      type="text"
                      name="crop_type"
                      value={editableDevice.crop_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      value={editableDevice.latitude}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      value={editableDevice.longitude}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {saveLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {saveError && <p className="text-red-500 text-sm mt-2">{saveError}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kit ID:</span>
                    <span className="font-medium">{device.kit_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{device.location_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Crop Type:</span>
                    <span className="font-medium">{device.crop_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Firmware:</span>
                    <span className="font-medium">{sensorData?.firmware ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Seen:</span>
                    <span className="font-medium">{sensorData ? new Date(sensorData.timestamp).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Latitude:</span>
                    <span className="font-medium">{device.latitude}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Longitude:</span>
                    <span className="font-medium">{device.longitude}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Battery:</span>
                    <span className="font-medium">{sensorData?.battery ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Signal:</span>
                    <span className="font-medium">{sensorData?.signal ?? 'N/A'}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Historical Data</h2>
                  <p className="text-sm text-gray-600">View sensor readings over time</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Link to={`${basePath}/devices/${id}/analytics`} className="text-sm font-medium text-green-600 hover:text-green-700">
                    Go to Analytics Page
                  </Link>
                  <select 
                    value={historyTimeRange}
                    onChange={(e) => setHistoryTimeRange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                  {historyTimeRange === 'custom' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <span>to</span>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

            {historyLoading ? (
              <div className="p-6 text-center">
                <Loader />
              </div>
            ) : historicalData && historicalData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moisture (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EC</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N-P-K</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalData.map((reading) => (
                      <tr key={reading.timestamp} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(reading.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{reading.moisture}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.temperature}°C</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.ph}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.ec}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reading.nitrogen}-{reading.phosphorus}-{reading.potassium}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p>No historical data available for the selected time range.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Reports Feature Coming Soon</h2>
            <p className="text-sm text-gray-600 mt-2">We're working hard to bring you detailed reports and analytics. Stay tuned!</p>
          </div>
        )}

        {/* Generate Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generate Advanced Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select report type</option>
                    <option value="irrigation">Irrigation Summary</option>
                    <option value="soil">Soil Health Analysis</option>
                    <option value="water">Water Usage Efficiency</option>
                    <option value="nutrients">NPK Trend Analysis</option>
                    <option value="comprehensive">Comprehensive Report</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include Data Points</label>
                  <div className="space-y-2">
                    {['Soil Moisture', 'Temperature', 'pH Levels', 'EC Levels', 'NPK Values', 'Irrigation Events', 'Weather Data'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Format</label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        defaultChecked
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label className="text-sm text-gray-700">PDF</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="excel"
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label className="text-sm text-gray-700">Excel</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label className="text-sm text-gray-700">CSV</label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowReportModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Irrigation Confirmation Modal */}
        {showIrrigationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${irrigationAction === 'start' ? 'bg-blue-100' : 'bg-red-100'}`}>
                  <svg className={`h-6 w-6 ${irrigationAction === 'start' ? 'text-blue-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {irrigationAction === 'start' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10h6v4H9z" />
                    )}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {irrigationAction === 'start' ? 'Start Irrigation' : 'Stop Irrigation'}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {irrigationAction === 'start' 
                  ? `Are you sure you want to start watering for ${device.location_name}? This will activate the irrigation system for this zone.`
                  : `Are you sure you want to stop watering for ${device.location_name}? This will deactivate the irrigation system for this zone.`
                }
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowIrrigationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmIrrigationAction}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${
                    irrigationAction === 'start' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {irrigationAction === 'start' ? 'Start Watering' : 'Stop Watering'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ... existing modals remain the same ... */}
      </div>
  );
}

export default DeviceDetail;