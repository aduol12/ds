import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DeviceSummary } from '../types/api';

interface DeviceCardProps {
  device: DeviceSummary;
}

function DeviceCard({ device }: DeviceCardProps) {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
  const [irrigationMode, setIrrigationMode] = useState<'manual' | 'sensor' | 'smart'>('sensor');
  const [manualSchedule, setManualSchedule] = useState([
    { day: 'monday', enabled: false, times: ['06:00'] },
    { day: 'tuesday', enabled: false, times: ['06:00'] },
    { day: 'wednesday', enabled: false, times: ['06:00'] },
    { day: 'thursday', enabled: false, times: ['06:00'] },
    { day: 'friday', enabled: false, times: ['06:00'] },
    { day: 'saturday', enabled: false, times: ['06:00'] },
    { day: 'sunday', enabled: false, times: ['06:00'] }
  ]);
  const latestReading = {
    battery: device.battery,
    signal: device.signal,
    firmware: device.firmware,
    timestamp: device.timestamp,
  };

  const getStatus = (device: DeviceSummary) => {
    if (!device.kit_is_active) return { text: 'Offline', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    // TODO: Add logic for maintenance status
    return { text: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const status = getStatus(device);

  const getBatteryColor = (level: number | null | undefined) => {
    if (level === null || level === undefined) return 'text-slate-400';
    if (level > 50) return 'text-emerald-600';
    if (level > 20) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getSignalBars = (strength: number | null | undefined) => {
    const level = strength ? Math.round(strength / 20) : 0;
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1 rounded-sm ${
          i < level ? 'bg-emerald-500' : 'bg-slate-200'
        }`}
        style={{ height: `${(i + 1) * 3 + 2}px` }}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{device.kit_location_name}</h3>
          <p className="text-sm text-slate-500">{device.kit_crop_type}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <svg className={`h-5 w-5 ${getBatteryColor(latestReading?.battery)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <p className="text-sm text-slate-500">Battery</p>
            <p className={`font-medium ${getBatteryColor(latestReading?.battery)}`}>
              {latestReading?.battery ?? 'N/A'}%
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-end space-x-0.5 h-5">
            {getSignalBars(latestReading?.signal)}
          </div>
          <div>
            <p className="text-sm text-slate-500">Signal</p>
            <p className="font-medium text-slate-900">{latestReading?.signal ? `${Math.round(latestReading.signal / 20)}/5` : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Device Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Kit ID:</span>
          <span className="font-medium">{device.kit_id ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Crop Type:</span>
          <span className="font-medium">{device.kit_crop_type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Firmware:</span>
          <span className="font-medium">{latestReading?.firmware ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Seen:</span>
          <span className="font-medium">{latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString() : 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Latitude:</span>
          <span className="font-medium">{device.kit_latitude}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Longitude:</span>
          <span className="font-medium">{device.kit_longitude}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4 border-t border-slate-200">
        <Link 
          to={`${basePath}/devices/${device.kit_id ?? ''}`}
          className="flex-1 text-sm text-sky-600 hover:text-sky-700 font-medium py-2 px-3 rounded-lg hover:bg-sky-50 transition-colors flex items-center justify-center group relative"
          title="View Device Details"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            View Device Details
          </div>
        </Link>
        
        <Link 
          to={`${basePath}/devices/${device.kit_id ?? ''}/analytics`}
          className="flex-1 text-sm text-slate-600 hover:text-slate-700 font-medium py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center group relative"
          title="View Historical Data"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            View Historical Data
          </div>
        </Link>
        
        <button 
          onClick={() => setShowConfigModal(true)}
          className="flex-1 text-sm text-gray-600 hover:text-gray-700 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center group relative"
          title="Device Configuration"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Device Configuration
          </div>
        </button>
        
        <button 
          onClick={() => setShowIrrigationModal(true)}
          className="flex-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 px-3 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center group relative"
          title="Irrigation Settings"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Irrigation Settings
          </div>
        </button>
        
        <button 
          className="text-sm text-rose-600 hover:text-rose-700 font-medium py-2 px-3 rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center group relative"
          title="Delete Device"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Delete Device
          </div>
        </button>
      </div>

      {/* Configure Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Configure Device</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-6">
              {/* Device Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Device Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                  <input
                    type="text"
                    defaultValue={device.kit_location_name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue={device.kit_location_name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      defaultValue={device.kit_latitude || ''}
                      placeholder="e.g., 40.7128"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      defaultValue={device.kit_longitude || ''}
                      placeholder="e.g., -74.0060"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <select 
                    defaultValue={device.kit_crop_type.toLowerCase()}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="corn">Corn</option>
                    <option value="soybeans">Soybeans</option>
                    <option value="wheat">Wheat</option>
                    <option value="barley">Barley</option>
                    <option value="tomatoes">Tomatoes</option>
                    <option value="potatoes">Potatoes</option>
                    <option value="cotton">Cotton</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Sensor Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Sensor Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Interval (Active)</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="1">1 minute</option>
                      <option value="5" selected>5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Interval (Idle)</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="15">15 minutes</option>
                      <option value="30" selected>30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Moisture Threshold (%)</label>
                    <input
                      type="number"
                      defaultValue="30"
                      min="0"
                      max="100"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Optimal Moisture Range (%)</label>
                    <input
                      type="text"
                      defaultValue="40-60"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Notifications</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="lowMoistureAlert"
                      defaultChecked
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lowMoistureAlert" className="text-sm font-medium text-gray-700">
                      Low Moisture Alerts
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="deviceOfflineAlert"
                      defaultChecked
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="deviceOfflineAlert" className="text-sm font-medium text-gray-700">
                      Device Offline Alerts
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="lowBatteryAlert"
                      defaultChecked
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lowBatteryAlert" className="text-sm font-medium text-gray-700">
                      Low Battery Alerts
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Irrigation Configuration Modal */}
      {showIrrigationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Irrigation Configuration</h3>
              <button
                onClick={() => setShowIrrigationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-6">
              {/* Irrigation Mode Selection */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Irrigation Mode</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      irrigationMode === 'manual' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setIrrigationMode('manual')}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="irrigationMode"
                        value="manual"
                        checked={irrigationMode === 'manual'}
                        onChange={() => setIrrigationMode('manual')}
                        className="h-4 w-4 text-green-600"
                      />
                      <h5 className="font-medium text-gray-900">Manual Schedule</h5>
                    </div>
                    <p className="text-sm text-gray-600">Set specific days and times for irrigation</p>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      irrigationMode === 'sensor' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setIrrigationMode('sensor')}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="irrigationMode"
                        value="sensor"
                        checked={irrigationMode === 'sensor'}
                        onChange={() => setIrrigationMode('sensor')}
                        className="h-4 w-4 text-green-600"
                      />
                      <h5 className="font-medium text-gray-900">Sensor Driven</h5>
                    </div>
                    <p className="text-sm text-gray-600">Automatic irrigation based on soil moisture</p>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      irrigationMode === 'smart' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setIrrigationMode('smart')}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="radio"
                        name="irrigationMode"
                        value="smart"
                        checked={irrigationMode === 'smart'}
                        onChange={() => setIrrigationMode('smart')}
                        className="h-4 w-4 text-green-600"
                      />
                      <h5 className="font-medium text-gray-900">Smart Weather</h5>
                    </div>
                    <p className="text-sm text-gray-600">AI-powered with weather predictions</p>
                  </div>
                </div>
              </div>

              {/* Manual Schedule Configuration */}
              {irrigationMode === 'manual' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Manual Schedule</h4>
                  
                  <div className="space-y-3">
                    {manualSchedule.map((schedule, index) => (
                      <div key={schedule.day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 w-24">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={(e) => {
                              const newSchedule = [...manualSchedule];
                              newSchedule[index].enabled = e.target.checked;
                              setManualSchedule(newSchedule);
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {schedule.day}
                          </label>
                        </div>
                        
                        <div className="flex-1 flex items-center space-x-2">
                          {schedule.times.map((time, timeIndex) => (
                            <input
                              key={timeIndex}
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const newSchedule = [...manualSchedule];
                                newSchedule[index].times[timeIndex] = e.target.value;
                                setManualSchedule(newSchedule);
                              }}
                              disabled={!schedule.enabled}
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newSchedule = [...manualSchedule];
                              newSchedule[index].times.push('06:00');
                              setManualSchedule(newSchedule);
                            }}
                            disabled={!schedule.enabled}
                            className="text-green-600 hover:text-green-700 text-sm font-medium disabled:text-gray-400"
                          >
                            + Add Time
                          </button>
                        </div>

                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Duration (min)"
                            min="1"
                            max="480"
                            disabled={!schedule.enabled}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Duration (minutes)</label>
                      <input
                        type="number"
                        defaultValue="30"
                        min="1"
                        max="480"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interval Between Sessions (hours)</label>
                      <input
                        type="number"
                        defaultValue="6"
                        min="1"
                        max="24"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sensor Driven Configuration */}
              {irrigationMode === 'sensor' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Sensor-Driven Settings</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Start Threshold (%)</label>
                      <input
                        type="number"
                        defaultValue="25"
                        min="0"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Start irrigation when moisture drops below this level</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Stop Threshold (%)</label>
                      <input
                        type="number"
                        defaultValue="50"
                        min="0"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Stop irrigation when moisture reaches this level</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Duration (minutes)</label>
                      <input
                        type="number"
                        defaultValue="60"
                        min="1"
                        max="480"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Safety limit for continuous irrigation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Interval (hours)</label>
                      <input
                        type="number"
                        defaultValue="2"
                        min="0.5"
                        max="24"
                        step="0.5"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum time between irrigation sessions</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Active Hours</label>
                      <div className="flex space-x-2">
                        <input
                          type="time"
                          defaultValue="06:00"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="self-center text-gray-500">to</span>
                        <input
                          type="time"
                          defaultValue="20:00"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Only irrigate during these hours</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Weather Configuration */}
              {irrigationMode === 'smart' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Smart Weather Integration</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h5 className="font-medium text-blue-900">AI-Powered Irrigation</h5>
                    </div>
                    <p className="text-sm text-blue-800">
                      Combines sensor data with weather forecasts, crop requirements, and machine learning to optimize irrigation timing and duration.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weather Forecast Range</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="24">24 hours</option>
                        <option value="48">48 hours</option>
                        <option value="72" selected>72 hours</option>
                        <option value="120">5 days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rain Threshold (mm)</label>
                      <input
                        type="number"
                        defaultValue="5"
                        min="0"
                        max="50"
                        step="0.1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Skip irrigation if rain expected above this amount</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="evapotranspiration"
                        defaultChecked
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="evapotranspiration" className="text-sm font-medium text-gray-700">
                        Consider Evapotranspiration (ET) rates
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="windSpeed"
                        defaultChecked
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="windSpeed" className="text-sm font-medium text-gray-700">
                        Adjust for wind speed and humidity
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="soilType"
                        defaultChecked
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="soilType" className="text-sm font-medium text-gray-700">
                        Factor in soil type and drainage
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="cropStage"
                        defaultChecked
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="cropStage" className="text-sm font-medium text-gray-700">
                        Adjust for crop growth stage
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">AI Sensitivity</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="conservative">Conservative</option>
                        <option value="balanced" selected>Balanced</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Override Threshold (%)</label>
                      <input
                        type="number"
                        defaultValue="20"
                        min="0"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Emergency irrigation if moisture drops below</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Daily Duration (hours)</label>
                      <input
                        type="number"
                        defaultValue="4"
                        min="0.5"
                        max="12"
                        step="0.5"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowIrrigationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Irrigation Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceCard;