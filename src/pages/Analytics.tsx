import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SensorChart from '../components/SensorChart';
import { getKitById } from '../api/assets';
import { getHistoricalSensorData } from '../api/data';
import { Kit, SensorReading } from '../types/api';
import Loader from '../components/Loader';

function Analytics() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [device, setDevice] = useState<Kit | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorReading[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['moisture', 'temperature']);

  useEffect(() => {
    const fetchData = async () => {
      if (!deviceId) return;
      setLoading(true);
      try {
        const kitData = await getKitById(deviceId);
        setDevice(kitData);

        let now = new Date();
        let fromDate = new Date();
        switch (timeRange) {
          case '1h': fromDate.setHours(now.getHours() - 1); break;
          case '3h': fromDate.setHours(now.getHours() - 3); break;
          case '6h': fromDate.setHours(now.getHours() - 6); break;
          case '12h': fromDate.setHours(now.getHours() - 12); break;
          case '24h': fromDate.setDate(now.getDate() - 1); break;
          case 'today': fromDate.setHours(0, 0, 0, 0); break;
          case 'yesterday':
            fromDate.setDate(now.getDate() - 1);
            fromDate.setHours(0, 0, 0, 0);
            now.setDate(now.getDate() - 1);
            now.setHours(23, 59, 59, 999);
            break;
          case 'week': fromDate.setDate(now.getDate() - 7); break;
          case 'lastweek':
            fromDate.setDate(now.getDate() - 14);
            now.setDate(now.getDate() - 7);
            break;
          case 'custom':
            if (customDateRange.start && customDateRange.end) {
              fromDate = new Date(customDateRange.start);
              fromDate.setUTCHours(0, 0, 0, 0);
              now = new Date(customDateRange.end);
              now.setUTCHours(23, 59, 59, 999);
            } else {
              setHistoricalData([]);
              setLoading(false);
              return;
            }
            break;
          default: fromDate.setDate(now.getDate() - 1);
        }
        const from = fromDate.toISOString();
        const to = now.toISOString();

        const data = await getHistoricalSensorData(deviceId, from, to);
        if (Array.isArray(data)) {
          const parsedData = data.map(reading => ({
            ...reading,
            moisture: parseFloat(reading.moisture),
            temperature: parseFloat(reading.temperature),
            ph: parseFloat(reading.ph),
            ec: parseFloat(reading.ec),
            nitrogen: parseFloat(reading.nitrogen),
            phosphorus: parseFloat(reading.phosphorus),
            potassium: parseFloat(reading.potassium),
          }));
          parsedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setHistoricalData(parsedData);
        } else {
          setHistoricalData(data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId, timeRange, customDateRange]);

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

  const getCurrentValue = (metricKey: keyof SensorReading) => {
    if (!historicalData || historicalData.length === 0) return 0;
    return historicalData[historicalData.length - 1]?.[metricKey] || 0;
  };

  const getValueChange = (metricKey: keyof SensorReading) => {
    if (!historicalData || historicalData.length < 2) return 0;
    const current = historicalData[historicalData.length - 1]?.[metricKey] as number || 0;
    const previous = historicalData[historicalData.length - 2]?.[metricKey] as number || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setShowCustomRange(value === 'custom');
  };

  // Prepare combined chart data
  const getCombinedChartData = () => {
    if (!historicalData) return [];
    return historicalData.map(item => {
      const dataPoint: any = {
        timestamp: item.timestamp,
        time: new Date(item.timestamp).toLocaleTimeString(),
        value: 0, // Add a default value
      };
      selectedMetrics.forEach(metricKey => {
        dataPoint[metricKey] = item[metricKey as keyof SensorReading];
      });
      return dataPoint;
    });
  };

  if (loading) {
    return <Layout><Loader /></Layout>;
  }

  if (error) {
    return <Layout><p className="text-red-500">{error}</p></Layout>;
  }

  if (!device) {
    return <Layout><p>Device not found.</p></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/device/${deviceId}`}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors group"
              title="Back to Device Details"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historical Data</h1>
              <p className="text-gray-600">{device.location_name} • {device.crop_type}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
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
                  type="datetime-local"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                  className="text-sm border-0 focus:outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="datetime-local"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                  className="text-sm border-0 focus:outline-none"
                />
              </div>
            )}
            
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
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
            const currentValue = getCurrentValue(metric.key as keyof SensorReading);
            const change = getValueChange(metric.key as keyof SensorReading);
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
{selectedMetrics.length > 0 && historicalData && historicalData.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    
    {/* --- THIS IS THE UPDATED BLOCK --- */}
    {/* Stacks vertically on mobile, goes to row on medium+ screens */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Combined Sensor Data</h3>
        <p className="text-sm text-gray-600">
          Visualizing {selectedMetrics.length} selected metric{selectedMetrics.length > 1 ? 's' : ''} over time
        </p>
      </div>
      {/* Uses flex-wrap to stack legend items if they overflow */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end">
        {selectedMetrics.map((metricKey) => {
          const metric = metrics.find(m => m.key === metricKey);
          if (!metric) return null; // Add a check for safety
          return (
            <div key={metricKey} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-sm text-gray-600">{metric.label}</span>
            </div>
          );
        })}
      </div>
    </div>
    {/* --- END OF UPDATED BLOCK --- */}
    
    <div>
      <SensorChart
        data={getCombinedChartData()}
        metrics={selectedMetrics.map(key => metrics.find(m => m.key === key)).filter(Boolean) as any}
        timeRange={timeRange}
        combined={true}
      />
    </div>
  </div>
)}

        {/* Raw Data Table - All Parameters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Complete Historical Data</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Download CSV
              </button>
            </div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalData && historicalData.slice(-15).reverse().map((reading) => (
                  <tr key={reading.timestamp} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reading.timestamp).toLocaleString()}
                    </td>
                    {metrics.map((metric) => {
                      const value = reading[metric.key as keyof SensorReading] || 0;
                      return (
                        <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value}{metric.unit}
                        </td>
                      );
                    })}
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

export default Analytics;