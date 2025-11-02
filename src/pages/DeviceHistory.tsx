import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SensorChart from '../components/SensorChart';

function DeviceHistory() {
  const { deviceId } = useParams();
  const [timeRange, setTimeRange] = useState('24h');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['moisture', 'temperature']);

  // Mock device data
  const device = {
    id: deviceId,
    name: 'Field B - Zone 2',
    location: 'South Field',
    cropType: 'Soybeans',
    status: 'active'
  };

  // Mock historical data - Enhanced to include all parameters
  const generateMockData = (metric: string, hours: number) => {
    const data = [];
    const now = new Date();
    const baseValues = {
      moisture: 35,
      temperature: 22,
      ph: 6.8,
      ec: 1.2,
      nitrogen: 45,
      phosphorus: 25,
      potassium: 180
    };

    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseValue = baseValues[metric as keyof typeof baseValues];
      const variation = (Math.random() - 0.5) * 0.2 * baseValue;
      
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.round((baseValue + variation) * 100) / 100
      });
    }
    return data;
  };

  const getTimeRangeHours = (range: string) => {
    switch (range) {
      case '1h': return 1;
      case '3h': return 3;
      case '6h': return 6;
      case '12h': return 12;
      case '24h': return 24;
      case 'today': return 24;
      case 'yesterday': return 48;
      case 'week': return 168;
      case 'lastweek': return 336;
      case 'custom': return 168; // Default for custom
      default: return 24;
    }
  };

  const historicalData = {
    moisture: generateMockData('moisture', getTimeRangeHours(timeRange)),
    temperature: generateMockData('temperature', getTimeRangeHours(timeRange)),
    ph: generateMockData('ph', getTimeRangeHours(timeRange)),
    ec: generateMockData('ec', getTimeRangeHours(timeRange)),
    nitrogen: generateMockData('nitrogen', getTimeRangeHours(timeRange)),
    phosphorus: generateMockData('phosphorus', getTimeRangeHours(timeRange)),
    potassium: generateMockData('potassium', getTimeRangeHours(timeRange))
  };

  const metrics = [
    { key: 'moisture', label: 'Soil Moisture', unit: '%', color: '#3B82F6', icon: '💧' },
    { key: 'temperature', label: 'Temperature', unit: '°C', color: '#EF4444', icon: '🌡️' },
    { key: 'ph', label: 'pH Level', unit: 'pH', color: '#8B5CF6', icon: '⚗️' },
    { key: 'ec', label: 'Electrical Conductivity', unit: 'mS/cm', color: '#F59E0B', icon: '⚡' },
    { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'ppm', color: '#10B981', icon: '🌱' },
    { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'ppm', color: '#F97316', icon: '🌿' },
    { key: 'potassium', label: 'Potassium (K)', unit: 'ppm', color: '#84CC16', icon: '🍃' }
  ];

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const getCurrentValue = (metricKey: string) => {
    const data = historicalData[metricKey as keyof typeof historicalData];
    return data[data.length - 1]?.value || 0;
  };

  const getValueChange = (metricKey: string) => {
    const data = historicalData[metricKey as keyof typeof historicalData];
    if (data.length < 2) return 0;
    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    return ((current - previous) / previous * 100);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setShowCustomRange(value === 'custom');
  };

  // Prepare combined chart data
  const getCombinedChartData = () => {
    const baseData = historicalData.moisture.map(item => ({
      timestamp: item.timestamp,
      time: new Date(item.timestamp).toLocaleTimeString()
    }));

    selectedMetrics.forEach(metricKey => {
      const metricData = historicalData[metricKey as keyof typeof historicalData];
      baseData.forEach((item, index) => {
        item[metricKey] = metricData[index]?.value || 0;
      });
    });

    return baseData;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/device/${deviceId}`}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors group"
              title="Back to Device Details"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Back to Device Details
              </div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historical Data</h1>
              <p className="text-gray-600">{device.name} • {device.location} • {device.cropType}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="3h">Last 3 Hours</option>
                <option value="6h">Last 6 Hours</option>
                <option value="12h">Last 12 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="lastweek">Last Week</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {showCustomRange && (
              <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                  className="text-sm border-0 focus:outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                  className="text-sm border-0 focus:outline-none"
                />
              </div>
            )}
            
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Current Values Overview - All Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {metrics.map((metric) => {
            const currentValue = getCurrentValue(metric.key);
            const change = getValueChange(metric.key);
            const isPositive = change > 0;
            
            return (
              <div key={metric.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    Math.abs(change) < 1 ? 'bg-gray-100 text-gray-600' :
                    isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {currentValue}{metric.unit}
                  </p>
                  <p className="text-xs text-gray-600">{metric.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Metric Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Metrics to Display</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetrics.includes(metric.key)
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{metric.icon}</span>
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Combined Chart */}
        {selectedMetrics.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Combined Sensor Data</h3>
                <p className="text-sm text-gray-600">
                  Visualizing {selectedMetrics.length} selected metric{selectedMetrics.length > 1 ? 's' : ''} over time
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {selectedMetrics.map((metricKey) => {
                  const metric = metrics.find(m => m.key === metricKey);
                  return (
                    <div key={metricKey} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: metric?.color }}
                      />
                      <span className="text-sm text-gray-600">{metric?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="h-96">
              <SensorChart
                data={getCombinedChartData()}
                metrics={selectedMetrics.map(key => metrics.find(m => m.key === key)).filter(Boolean)}
                timeRange={timeRange}
                combined={true}
              />
            </div>
          </div>
        )}

        {/* Raw Data Table - All Parameters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Complete Historical Data</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Download CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  {metrics.map((metric) => (
                    <th key={metric.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {metric.label} ({metric.unit})
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Irrigation Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalData.moisture.slice(-15).reverse().map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(historicalData.moisture[historicalData.moisture.length - 1 - index].timestamp).toLocaleString()}
                    </td>
                    {metrics.map((metric) => {
                      const data = historicalData[metric.key as keyof typeof historicalData];
                      const value = data[data.length - 1 - index]?.value || 0;
                      return (
                        <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value}{metric.unit}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        Math.random() > 0.7 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {Math.random() > 0.7 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DeviceHistory;