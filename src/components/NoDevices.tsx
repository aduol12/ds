import React from 'react';

interface NoDevicesProps {
  onAddDevice: () => void;
}

const NoDevices: React.FC<NoDevicesProps> = ({ onAddDevice }) => {
  return (
    <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7c0-1.1.9-2 2-2h5l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by adding a new device.</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onAddDevice}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Device
        </button>
      </div>
    </div>
  );
};

export default NoDevices;
