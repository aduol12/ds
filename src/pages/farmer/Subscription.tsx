import { useState } from 'react';
import Layout from '../../components/Layout';

function Subscription() {
  const [currentPlan] = useState({
    name: 'Premium Plan',
    price: 49.99,
    billing: 'monthly',
    nextBilling: '2024-02-15',
    devicesUsed: 4,
    devicesLimit: 10,
    features: [
      'Up to 10 IoT devices',
      'Real-time monitoring',
      'AI-powered recommendations',
      'Historical data (1 year)',
      'Email & SMS alerts',
      'Priority support',
      'Advanced analytics',
      'Custom reports'
    ]
  });

  const [billingHistory] = useState([
    { id: 1, date: '2024-01-15', amount: 49.99, status: 'paid', invoice: 'INV-2024-001' },
    { id: 2, date: '2023-12-15', amount: 49.99, status: 'paid', invoice: 'INV-2023-012' },
    { id: 3, date: '2023-11-15', amount: 49.99, status: 'paid', invoice: 'INV-2023-011' },
    { id: 4, date: '2023-10-15', amount: 49.99, status: 'paid', invoice: 'INV-2023-010' }
  ]);

  const [paymentMethod] = useState({
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiry: '12/26'
  });

  const [showCancelModal, setShowCancelModal] = useState(false);

  const plans = [
    {
      name: 'Basic',
      price: 19.99,
      devices: 3,
      features: ['Up to 3 devices', 'Basic monitoring', 'Email alerts', '30-day data history']
    },
    {
      name: 'Premium',
      price: 49.99,
      devices: 10,
      features: ['Up to 10 devices', 'Real-time monitoring', 'AI recommendations', '1-year data history', 'SMS alerts', 'Priority support'],
      current: true
    },
    {
      name: 'Enterprise',
      price: 99.99,
      devices: 'Unlimited',
      features: ['Unlimited devices', 'Advanced analytics', 'Custom integrations', 'Unlimited data history', 'Dedicated support', 'White-label options']
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription, billing, and payment methods</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                ${currentPlan.price}
                <span className="text-lg font-normal text-gray-500">/{currentPlan.billing}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Next billing date: {new Date(currentPlan.nextBilling).toLocaleDateString()}
              </p>
              
              {/* Usage */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Devices Used</span>
                  <span>{currentPlan.devicesUsed} / {currentPlan.devicesLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPlan.devicesUsed / currentPlan.devicesLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Upgrade Plan
              </button>
              <button 
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 hover:text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className={`border rounded-xl p-6 relative ${
                plan.current ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}>
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-500">/month</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {typeof plan.devices === 'string' ? plan.devices : `Up to ${plan.devices}`} devices
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  disabled={plan.current}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    plan.current 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {plan.current ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            <button className="text-green-600 hover:text-green-700 font-medium">
              Update Payment Method
            </button>
          </div>
          
          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {paymentMethod.brand} ending in {paymentMethod.last4}
              </p>
              <p className="text-sm text-gray-600">Expires {paymentMethod.expiry}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Default
            </span>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
            <button className="text-green-600 hover:text-green-700 font-medium">
              Download All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((bill) => (
                  <tr key={bill.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{bill.invoice}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">${bill.amount}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancel Subscription Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your current billing period.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Subscription;