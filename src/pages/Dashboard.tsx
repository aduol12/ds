import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { getAllKits } from '../api/assets';
import { getLatestSensorData } from '../api/data';
import { getAllAlerts } from '../api/alerts';
import { getWeatherData } from '../api/weather';
import { getUserProfile } from '../api/users';
import { KitSummary, Alert, User } from '../types/api';

function Dashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [summary, setSummary] = useState<KitSummary[] | null>(null);
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data...');
        const kits = await getAllKits();
        const summaryData = await Promise.all(
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
        console.log('Summary data:', summaryData);
        const alertsData = await getAllAlerts();
        console.log('Alerts data:', alertsData);
        const userData = await getUserProfile();
        console.log('User data:', userData);
        
        setSummary(summaryData);
        setAlerts(alertsData);
        setUser(userData);

        if (userData.farmProfile?.county) {
          console.log(`Fetching weather for ${userData.farmProfile.county}`);
          const weatherData = await getWeatherData(userData.farmProfile.county);
          console.log('Weather data:', weatherData);
          setWeather(weatherData);
        } else {
          console.log('No county found in user profile to fetch weather.');
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to connect to the server. Please check your connection.');
        setSummary(null);
        setAlerts(null);
        setUser(null);
        setWeather(null);
      } finally {
        setLoading(false);
        console.log('Finished fetching data.');
      }
    };

    fetchData();
  }, []);

  // Enhanced mock data reflecting the complete system
  const systemOverview = {
    totalDevices: summary?.length || 0,
    activeDevices: summary?.filter(d => d.is_active && d.latest_reading).length || 0,
    offlineDevices: summary?.filter(d => !d.latest_reading).length || 0,
    maintenanceDevices: 0, // This data is not in the summary
    totalFields: summary?.length || 0, // Assuming one device per field for now
    irrigationActive: summary?.filter(d => d.is_irrigating).length || 0,
    waterUsedToday: 1247, // This data is not in the summary
    waterSavedThisMonth: 8934, // This data is not in the summary
    alertsCount: alerts?.length || 0,
    batteryAverage: summary ? Math.round(summary.reduce((acc, d) => acc + (d.latest_reading?.battery || 0), 0) / (summary.filter(d => d.latest_reading).length || 1)) : 0,
    lastSystemCheck: '2 minutes ago' // Static for now
  };

  const activeIrrigation = summary?.filter(d => d.is_irrigating).map(d => ({
    id: d.kit_id,
    device: d.location_name,
    startTime: '14:30', // Not in summary
    duration: '45 min', // Not in summary
    progress: 75, // Not in summary
    waterUsed: 234 // Not in summary
  })) || [];

  const recentReadings = summary?.map(d => ({
    id: d.kit_id,
    device: d.location_name,
    moisture: d.latest_reading?.moisture || 0,
    temp: d.latest_reading?.temperature || 0,
    ph: d.latest_reading?.ph || 0,
    status: d.latest_reading ? 'optimal' : 'offline', // Simplified status
    time: d.latest_reading ? new Date(d.latest_reading.timestamp).toLocaleTimeString(undefined, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) : 'N/A',
    irrigating: d.is_irrigating,
  })) || [];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
      case 'high': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Time Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farm Dashboard</h1>
                        <p className="text-gray-600">
              {user?.farmProfile?.farm_name 
                ? `Real-time monitoring of ${user.farmProfile.farm_name} irrigation systems` 
                : 'Real-time monitoring of your farm’s irrigation systems'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <span className="text-sm text-gray-500">Last updated: {systemOverview.lastSystemCheck}</span>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {alerts && alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-red-900">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</p>
                  <p className="text-sm text-red-700">{alerts[0].description}</p>
                </div>
              </div>
              <Link to="/devices" className="text-red-600 hover:text-red-700 font-medium text-sm">
                View All →
              </Link>
            </div>
          </div>
        )}

        {loading && <Loader />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Irrigation & Recent Readings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Irrigation */}
              {activeIrrigation.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>Active Irrigation</span>
                      </h2>
                      <Link to="/live-data" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All →
                      </Link>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {activeIrrigation.map((irrigation) => (
                      <div key={irrigation.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{irrigation.device}</p>
                            <p className="text-sm text-gray-600">Started at {irrigation.startTime} • {irrigation.duration} duration</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-600">{irrigation.progress}% Complete</p>
                            <p className="text-xs text-gray-600">{irrigation.waterUsed}L used</p>
                          </div>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${irrigation.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Sensor Readings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Live Sensor Data</h2>
                    <Link to="/live-data" className="text-green-600 hover:text-green-700 text-sm font-medium">
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {recentReadings.map((reading) => (
                      <div key={reading.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className={`h-3 w-3 rounded-full ${
                              reading.status === 'optimal' ? 'bg-green-500' :
                              reading.status === 'high' ? 'bg-blue-500' :
                              reading.status === 'critical' ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                            {reading.irrigating && (
                              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reading.device}</p>
                            <p className="text-sm text-gray-600">
                              {reading.status !== 'offline' ? (
                                <>Moisture: {reading.moisture}% • Temp: {reading.temp}°C • pH: {reading.ph}</>
                              ) : (
                                'Device offline - no recent data'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reading.status)}`}>
                            {reading.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{reading.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Weather & Farm Metrics Only */}
            <div className="space-y-6">
              {/* Weather Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Weather Conditions</h2>
                </div>
                <div className="p-6">
                  {weather ? (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-gray-900">{weather.current.temp_c}°C</p>
                        <p className="text-gray-600">{weather.current.condition.text}</p>
                        <p className="text-sm text-gray-500">Humidity: {weather.current.humidity}% • Wind: {weather.current.wind_kph} km/h</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {weather.forecast.forecastday.map((day: any) => (
                          <div key={day.date_epoch} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <img src={'https:' + day.day.condition.icon} alt={day.day.condition.text} className="mx-auto" />
                            <p className="text-sm font-medium text-gray-900">{day.day.maxtemp_c}°/{day.day.mintemp_c}°</p>
                            <p className="text-xs text-blue-600">{day.day.daily_chance_of_rain}% rain</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>Weather data not available.</p>
                  )}
                </div>
              </div>

              {/* Farm Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Farm Overview</h2>
                </div>
                <div className="p-6 space-y-4">
                  {user && user.farmProfile ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Farm Name</p>
                        <p className="font-semibold text-gray-900">{user.farmProfile.farm_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">{user.farmProfile.county}, {user.farmProfile.subcounty}, {user.farmProfile.ward}</p>
                      </div>
                    </>
                  ) : (
                    <p>Farm metrics not available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Recent Alerts Table - Mobile Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>System Alerts & Notifications</span>
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 sm:gap-0">
                  <span className="text-sm text-gray-500">{alerts?.length || 0} active alert{alerts?.length !== 1 ? 's' : ''}</span>
                  <Link to="/devices" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    Manage All →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {alerts && alerts.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="p-3 sm:p-4 bg-green-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Systems Operating Normally</h3>
                  <p className="text-gray-600 text-sm sm:text-base">No active alerts or issues detected across your irrigation system</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Last system check: {systemOverview.lastSystemCheck}</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {alerts && alerts.map((alert) => (
                    <div key={alert.alert_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 gap-3 sm:gap-4">
                      {/* Alert Info Section */}
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                            alert.severity === 'HIGH' ? 'bg-red-500 animate-pulse' :
                            alert.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            alert.alert_type === 'Offline' ? 'bg-red-100' :
                            alert.alert_type === 'Low Battery' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {alert.alert_type === 'Offline' && (
                              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {alert.alert_type === 'Low Battery' && (
                              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                            {alert.alert_type === 'Maintenance' && (
                              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-1">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{summary?.find(d => d.kit_id === alert.kit_id)?.location_name || alert.kit_id}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium border mt-1 sm:mt-0 self-start ${getSeverityColor(alert.severity.toLowerCase())}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1 break-words">{alert.description}</p>
                          <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString(undefined, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons Section - Mobile Responsive */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
                        {/* Mobile: Full width buttons, Desktop: Inline buttons */}
                        <button className="w-full sm:w-auto text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded border border-blue-200 hover:bg-blue-50 transition-colors text-center">
                          View Details
                        </button>
                        <button className="w-full sm:w-auto text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium px-3 py-2 rounded border border-green-200 hover:bg-green-50 transition-colors text-center">
                          Resolve
                        </button>
                        {alert.severity === 'HIGH' && (
                          <button className="w-full sm:w-auto text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 font-medium px-3 py-2 rounded transition-colors text-center">
                            Fix Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
        )}
      </div>
    </Layout>
  );
}

export default Dashboard;