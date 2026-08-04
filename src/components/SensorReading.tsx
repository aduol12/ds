import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DeviceSummary } from '../types/api';
import { sendControlCommand } from '../api/control';
import { useToasts } from '../hooks/useToasts';

interface SensorReadingProps {
  device: DeviceSummary;
}

function SensorReading({ device }: SensorReadingProps) {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const { addToast } = useToasts();
  const [isToggling, setIsToggling] = useState(false);
  const [isIrrigating, setIsIrrigating] = useState(device.kit_is_irrigating);
  const latestReading = {
    moisture: device.moisture,
    temperature: device.temperature,
    ph: device.ph,
    ec: device.ec,
    nitrogen: device.nitrogen,
    phosphorus: device.phosphorus,
    potassium: device.potassium,
    timestamp: device.timestamp,
  };

  const getStatusColor = (moisture: number | null | undefined) => {
    if (moisture === null || moisture === undefined) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (moisture >= 40) return 'bg-green-100 text-green-800 border-green-200';
    if (moisture >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getMoistureColor = (moisture: number | null | undefined) => {
    if (moisture === null || moisture === undefined) return 'text-gray-400';
    if (moisture >= 40) return 'text-green-600';
    if (moisture >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleToggleIrrigation = async () => {
    if (!device.kit_id || isToggling) return;
    const nextState = !isIrrigating;
    setIsToggling(true);
    try {
      await sendControlCommand(device.kit_id, nextState);
      setIsIrrigating(nextState);
      addToast(
        nextState ? 'Irrigation started.' : 'Irrigation stopped.',
        'success',
      );
    } catch (error) {
      console.error('Failed to send control command', error);
      addToast('Failed to update irrigation status.', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link
              to={`${basePath}/devices/${device.kit_id ?? ''}`}
              className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
            >
              {device.kit_location_name}
            </Link>
            <p className="text-sm text-gray-600">Kit ID: {device.kit_id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(latestReading?.moisture)}`}>
              {latestReading?.moisture === null || latestReading?.moisture === undefined ? 'Inactive' : latestReading.moisture >= 40 ? 'Optimal' : latestReading.moisture >= 30 ? 'Warning' : 'Low'}
            </span>
            {isIrrigating && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                💧 Watering
              </span>
            )}
          </div>
        </div>

        {/* Main Readings */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Soil Moisture</p>
            <p className={`text-2xl font-bold ${getMoistureColor(latestReading?.moisture)}`}>
              {latestReading?.moisture ?? 'N/A'}%
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="text-2xl font-bold text-gray-900">{latestReading?.temperature ?? 'N/A'}°C</p>
          </div>
        </div>

        {/* Detailed Readings */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">pH Level</span>
            <span className="font-medium">{latestReading?.ph ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">EC (mS/cm)</span>
            <span className="font-medium">{latestReading?.ec ?? 'N/A'}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">NPK Levels (ppm)</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="text-gray-600">N</p>
                <p className="font-medium">{latestReading?.nitrogen ?? 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">P</p>
                <p className="font-medium">{latestReading?.phosphorus ?? 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">K</p>
                <p className="font-medium">{latestReading?.potassium ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {latestReading?.timestamp ? `Updated ${new Date(latestReading.timestamp).toLocaleString()}` : 'No recent data'}
        </p>
        <div className="flex space-x-2">
          <Link
            to={`${basePath}/devices/${device.kit_id ?? ''}`}
            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors group relative"
            title="View Device Details"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
              View Details
            </div>
          </Link>

          <Link
            to={`${basePath}/devices/${device.kit_id ?? ''}/analytics`}
            className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors group relative"
            title="View Historical Data"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
              View History
            </div>
          </Link>

          <button
            onClick={handleToggleIrrigation}
            disabled={!device.kit_id || isToggling}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 group relative ${
              isIrrigating
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
            } ${!device.kit_id || isToggling ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {isIrrigating ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                </svg>
                <span>{isToggling ? 'Stopping...' : 'Stop Water'}</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>{isToggling ? 'Starting...' : 'Start Water'}</span>
              </>
            )}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
              {isIrrigating ? 'Stop watering this zone' : 'Start watering this zone'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SensorReading;