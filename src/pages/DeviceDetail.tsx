import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

// Mock device data - in real app this would come from API
const mockDevice = {
  id: 1,
  name: 'Field Sensor Alpha',
  location: 'North Field - Zone A',
  status: 'active' as const,
  batteryLevel: 85,
  signalStrength: 4,
  lastSeen: '2 minutes ago',
  cropType: 'Corn',
  installDate: '2024-01-15',
  firmwareVersion: 'v2.1.3',
  latitude: 40.7128,
  longitude: -74.0060,
  irrigationActive: false
};

// Mock current sensor readings
const mockCurrentReadings = {
  moisture: 45,
  temperature: 22,
  ph: 6.8,
  ec: 1.2,
  nitrogen: 120,
  phosphorus: 80,
  potassium: 150,
  lastUpdate: '2 minutes ago'
};

// Mock historical data
const mockHistoricalData = [
  { id: 1, timestamp: '2024-01-20 14:30', moisture: 45, temperature: 22, ph: 6.8, ec: 1.2, nitrogen: 120, phosphorus: 80, potassium: 150, irrigationActive: false },
  { id: 2, timestamp: '2024-01-20 14:00', moisture: 42, temperature: 23, ph: 6.7, ec: 1.3, nitrogen: 118, phosphorus: 82, potassium: 148, irrigationActive: true },
  { id: 3, timestamp: '2024-01-20 13:30', moisture: 38, temperature: 24, ph: 6.9, ec: 1.1, nitrogen: 125, phosphorus: 78, potassium: 152, irrigationActive: true },
  { id: 4, timestamp: '2024-01-20 13:00', moisture: 35, temperature: 25, ph: 7.0, ec: 1.0, nitrogen: 122, phosphorus: 85, potassium: 145, irrigationActive: false },
  { id: 5, timestamp: '2024-01-20 12:30', moisture: 32, temperature: 26, ph: 6.8, ec: 1.4, nitrogen: 115, phosphorus: 88, potassium: 140, irrigationActive: false },
];

// Mock reports data
const mockReports = [
  { id: 1, title: 'Weekly Irrigation Summary', date: '2024-01-20', type: 'irrigation', status: 'completed' },
  { id: 2, title: 'Soil Health Analysis', date: '2024-01-19', type: 'soil', status: 'completed' },
  { id: 3, title: 'Water Usage Efficiency', date: '2024-01-18', type: 'water', status: 'completed' },
  { id: 4, title: 'NPK Trend Analysis', date: '2024-01-17', type: 'nutrients', status: 'completed' },
];

function DeviceDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [irrigationActive, setIrrigationActive] = useState(mockDevice.irrigationActive);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
  const [irrigationAction, setIrrigationAction] = useState<'start' | 'stop'>('start');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'history', label: 'Historical Data', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return '💧';
      case 'soil': return '🌱';
      case 'water': return '🚰';
      case 'nutrients': return '🧪';
      default: return '📄';
    }
  };

  const handleIrrigationToggle = (action: 'start' | 'stop') => {
    setIrrigationAction(action);
    setShowIrrigationModal(true);
  };

  const confirmIrrigationAction = () => {
    setIrrigationActive(irrigationAction === 'start');
    setShowIrrigationModal(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link to="/live-data" className="hover:text-green-600">Live Data</Link>
              <span>›</span>
              <span className="text-gray-900">{mockDevice.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{mockDevice.name}</h1>
            <p className="text-gray-600">{mockDevice.location}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              mockDevice.status === 'active' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {mockDevice.status}
            </span>
            
            {irrigationActive && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                💧 Watering
              </span>
            )}
            
            <Link 
              to="/devices"
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
                disabled={irrigationActive}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  irrigationActive
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
          <nav className="-mb-px flex space-x-8">
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
          <div className="space-y-6">
            {/* Current Readings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Current Sensor Readings</h2>
                <p className="text-sm text-gray-600">Last updated: {mockCurrentReadings.lastUpdate}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Soil Moisture</p>
                    <p className="text-3xl font-bold text-blue-600">{mockCurrentReadings.moisture}%</p>
                    <p className="text-xs text-gray-500">Optimal</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Temperature</p>
                    <p className="text-3xl font-bold text-orange-600">{mockCurrentReadings.temperature}°C</p>
                    <p className="text-xs text-gray-500">Normal</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">pH Level</p>
                    <p className="text-3xl font-bold text-purple-600">{mockCurrentReadings.ph}</p>
                    <p className="text-xs text-gray-500">Good</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">EC Level</p>
                    <p className="text-3xl font-bold text-green-600">{mockCurrentReadings.ec}</p>
                    <p className="text-xs text-gray-500">mS/cm</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">NPK Levels (ppm)</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Nitrogen (N)</p>
                      <p className="text-2xl font-bold text-red-600">{mockCurrentReadings.nitrogen}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Phosphorus (P)</p>
                      <p className="text-2xl font-bold text-yellow-600">{mockCurrentReadings.phosphorus}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Potassium (K)</p>
                      <p className="text-2xl font-bold text-indigo-600">{mockCurrentReadings.potassium}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Device Information</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Battery</p>
                      <p className="font-semibold text-gray-900">{mockDevice.batteryLevel}%</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 007.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Signal</p>
                      <p className="font-semibold text-gray-900">{mockDevice.signalStrength}/5</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Seen</p>
                      <p className="font-semibold text-gray-900">{mockDevice.lastSeen}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Firmware</p>
                      <p className="font-semibold text-gray-900">{mockDevice.firmwareVersion}</p>
                    </div>
                  </div>
                </div>
              </div>
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
                <div className="flex items-center space-x-4">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Custom range</option>
                  </select>
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Irrigation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockHistoricalData.map((reading) => (
                    <tr key={reading.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{reading.moisture}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.temperature}°C</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.ph}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.ec}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reading.nitrogen}-{reading.phosphorus}-{reading.potassium}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reading.irrigationActive 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reading.irrigationActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
                  <p className="text-sm text-gray-600">Download and view device reports</p>
                </div>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Generate New Report
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {mockReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{getReportTypeIcon(report.type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">Generated on {report.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {report.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Download
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  ? `Are you sure you want to start watering for ${mockDevice.name}? This will activate the irrigation system for this zone.`
                  : `Are you sure you want to stop watering for ${mockDevice.name}? This will deactivate the irrigation system for this zone.`
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
    </Layout>
  );
}

export default DeviceDetail;