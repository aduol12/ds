  import Layout from '../components/Layout';
import SensorReading from '../components/SensorReading';

function LiveData() {
  const mockSensorData = [
    {
      id: 1,
      deviceName: 'Field A - Zone 1',
      location: 'North Field',
      moisture: 45,
      temperature: 24,
      ph: 6.8,
      ec: 1.2,
      nitrogen: 85,
      phosphorus: 42,
      potassium: 78,
      lastUpdate: '2 minutes ago',
      status: 'optimal',
      irrigationActive: false
    },
    {
      id: 2,
      deviceName: 'Field B - Zone 2',
      location: 'South Field',
      moisture: 28,
      temperature: 26,
      ph: 7.1,
      ec: 1.5,
      nitrogen: 62,
      phosphorus: 38,
      potassium: 55,
      lastUpdate: '1 minute ago',
      status: 'low',
      irrigationActive: true
    },
    {
      id: 3,
      deviceName: 'Field A - Zone 3',
      location: 'North Field',
      moisture: 52,
      temperature: 23,
      ph: 6.9,
      ec: 1.1,
      nitrogen: 92,
      phosphorus: 45,
      potassium: 82,
      lastUpdate: '3 minutes ago',
      status: 'optimal',
      irrigationActive: false
    },
    {
      id: 4,
      deviceName: 'Field C - Zone 1',
      location: 'East Field',
      moisture: 31,
      temperature: 25,
      ph: 7.3,
      ec: 1.8,
      nitrogen: 71,
      phosphorus: 35,
      potassium: 63,
      lastUpdate: '1 minute ago',
      status: 'warning',
      irrigationActive: false
    }
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockSensorData.map((sensor) => (
            <SensorReading key={sensor.id} sensor={sensor} />
          ))}
        </div>

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