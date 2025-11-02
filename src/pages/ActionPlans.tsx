import { useState } from 'react';
import Layout from '../components/Layout';
import ActionPlanCard from '../components/ActionPlanCard';

interface ActionStep {
  id: number;
  text: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

interface ActionPlan {
  id: number;
  title: string;
  device: string;
  status: 'pending' | 'in-progress' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  createdDate: string;
  steps: ActionStep[];
  aiConfidence: number;
  estimatedTime: string;
  completedSteps?: number;
  completedDate?: string;
  sensorDataUsed?: string;
  notes?: string;
}

function ActionPlans() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [generatingAI, setGeneratingAI] = useState(false);
  
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([
    {
      id: 1,
      title: 'Moisture Recovery Plan - Field B Zone 2',
      device: 'Field B - Zone 2',
      status: 'pending',
      priority: 'high',
      createdDate: '2024-01-15T10:30:00Z',
      steps: [
        { id: 1, text: 'Increase irrigation frequency to every 4 hours for next 24 hours', completed: false },
        { id: 2, text: 'Monitor soil moisture levels closely - target 35-40%', completed: false },
        { id: 3, text: 'Check irrigation system for blockages or leaks', completed: false }
      ],
      aiConfidence: 92,
      estimatedTime: '24 hours',
      sensorDataUsed: 'Last 24 hours sensor data from Field B Zone 2'
    },
    {
      id: 2,
      title: 'Nutrient Optimization - Field A Zone 1',
      device: 'Field A - Zone 1',
      status: 'in-progress',
      priority: 'medium',
      createdDate: '2024-01-14T14:15:00Z',
      steps: [
        { id: 1, text: 'Apply nitrogen-rich fertilizer (20-10-10) at 50kg/hectare', completed: true, completedDate: '2024-01-14T16:00:00Z' },
        { id: 2, text: 'Adjust pH levels using lime application if needed', completed: false },
        { id: 3, text: 'Schedule follow-up soil test in 7 days', completed: false }
      ],
      aiConfidence: 87,
      estimatedTime: '7 days',
      completedSteps: 1,
      sensorDataUsed: 'Last 48 hours comprehensive sensor analysis'
    }
  ]);

  const [devices] = useState([
    { id: 1, name: 'Field A - Zone 1' },
    { id: 2, name: 'Field B - Zone 2' },
    { id: 3, name: 'Field C - Zone 1' },
    { id: 4, name: 'Field D - Zone 1' }
  ]);

  const [aiRecommendation, setAiRecommendation] = useState({
    device: 'Field B - Zone 2',
    confidence: 94,
    urgency: 'High',
    steps: [
      'Immediate irrigation required - soil moisture at critical 28%',
      'Check irrigation lines for potential blockages in Zone 2',
      'Monitor closely for next 6 hours, target moisture level 40%'
    ],
    reasoning: 'Current soil moisture levels are below optimal range for soybeans at this growth stage. Temperature readings indicate increased evapotranspiration. Immediate action required to prevent crop stress.',
    sensorDataPeriod: 'Last 24 hours',
    dataPoints: 144
  });

  // Generate AI Plan from sensor data
  const generateAIPlan = async () => {
    setGeneratingAI(true);
    
    // Simulate AI generation with sensor data analysis
    setTimeout(() => {
      const mockSensorData = {
        moisture: Array.from({length: 144}, (_, i) => ({
          timestamp: new Date(Date.now() - (143-i) * 10 * 60 * 1000).toISOString(),
          value: 28 + Math.random() * 5
        })),
        temperature: Array.from({length: 144}, (_, i) => ({
          timestamp: new Date(Date.now() - (143-i) * 10 * 60 * 1000).toISOString(),
          value: 22 + Math.random() * 8
        })),
        ph: Array.from({length: 144}, (_, i) => ({
          timestamp: new Date(Date.now() - (143-i) * 10 * 60 * 1000).toISOString(),
          value: 6.5 + Math.random() * 0.6
        }))
      };

      // Analyze data and generate recommendations
      const avgMoisture = mockSensorData.moisture.reduce((sum, d) => sum + d.value, 0) / mockSensorData.moisture.length;
      const avgTemp = mockSensorData.temperature.reduce((sum, d) => sum + d.value, 0) / mockSensorData.temperature.length;
      
      let steps = [];
      let urgency = 'Medium';
      let confidence = 85;

      if (avgMoisture < 30) {
        steps.push('Immediate irrigation required - soil moisture critically low');
        steps.push('Increase irrigation frequency to every 3 hours');
        urgency = 'High';
        confidence = 95;
      } else if (avgMoisture < 35) {
        steps.push('Moderate irrigation increase recommended');
        steps.push('Monitor moisture levels every 2 hours');
        urgency = 'Medium';
        confidence = 88;
      }

      if (avgTemp > 28) {
        steps.push('High temperature detected - increase irrigation duration');
        steps.push('Consider shade cloth installation if available');
        confidence += 3;
      }

      steps.push('Continue monitoring for next 24-48 hours');
      steps.push('Document results for future AI learning');

      setAiRecommendation({
        device: selectedDevice === 'all' ? devices[0].name : devices.find(d => d.id.toString() === selectedDevice)?.name || devices[0].name,
        confidence,
        urgency,
        steps,
        reasoning: `Analysis of ${mockSensorData.moisture.length} data points over 24 hours shows average moisture at ${avgMoisture.toFixed(1)}% and temperature at ${avgTemp.toFixed(1)}°C. ${urgency === 'High' ? 'Immediate action required.' : 'Preventive measures recommended.'}`,
        sensorDataPeriod: 'Last 24 hours',
        dataPoints: mockSensorData.moisture.length
      });

      setGeneratingAI(false);
      setShowAIModal(true);
    }, 2000);
  };

  // Save AI recommendation as action plan
  const saveAIPlan = () => {
    const newPlan: ActionPlan = {
      id: Date.now(),
      title: `AI Generated Plan - ${aiRecommendation.device}`,
      device: aiRecommendation.device,
      status: 'pending',
      priority: aiRecommendation.urgency.toLowerCase() as 'high' | 'medium' | 'low',
      createdDate: new Date().toISOString(),
      steps: aiRecommendation.steps.map((step, index) => ({
        id: index + 1,
        text: step,
        completed: false
      })),
      aiConfidence: aiRecommendation.confidence,
      estimatedTime: aiRecommendation.urgency === 'High' ? '6-12 hours' : '24-48 hours',
      sensorDataUsed: `${aiRecommendation.sensorDataPeriod} - ${aiRecommendation.dataPoints} data points analyzed`
    };

    setActionPlans(prev => [newPlan, ...prev]);
    setShowAIModal(false);
  };

  // Edit action plan
  const editPlan = (plan: ActionPlan) => {
    setSelectedPlan(plan);
  };

  // Update plan progress
  const updateProgress = (plan: ActionPlan) => {
    setSelectedPlan(plan);
  };

  // Toggle step completion
  const toggleStepCompletion = (planId: number, stepId: number) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedSteps = plan.steps.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              completed: !step.completed,
              completedDate: !step.completed ? new Date().toISOString() : undefined
            };
          }
          return step;
        });
        
        const completedCount = updatedSteps.filter(step => step.completed).length;
        const newStatus = completedCount === updatedSteps.length ? 'completed' : 
                         completedCount > 0 ? 'in-progress' : 'pending';
        
        return {
          ...plan,
          steps: updatedSteps,
          completedSteps: completedCount,
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return plan;
    }));
  };

  // Add new step to existing plan
  const addStepToPlan = (planId: number, stepText: string) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const newStep: ActionStep = {
          id: Math.max(...plan.steps.map(s => s.id)) + 1,
          text: stepText,
          completed: false
        };
        return {
          ...plan,
          steps: [...plan.steps, newStep]
        };
      }
      return plan;
    }));
  };

  // Delete action plan
  const deletePlan = (planId: number) => {
    if (confirm('Are you sure you want to delete this action plan?')) {
      setActionPlans(prev => prev.filter(plan => plan.id !== planId));
    }
  };

  // Download PDF report
  const downloadPDF = (plan: ActionPlan) => {
    // In a real app, this would generate and download a PDF
    const pdfContent = `
Action Plan Report
==================

Title: ${plan.title}
Device: ${plan.device}
Status: ${plan.status}
Priority: ${plan.priority}
Created: ${new Date(plan.createdDate).toLocaleString()}
AI Confidence: ${plan.aiConfidence}%
Estimated Time: ${plan.estimatedTime}

Sensor Data Used:
${plan.sensorDataUsed || 'N/A'}

Action Steps:
${plan.steps.map((step, index) => 
  `${index + 1}. ${step.text} ${step.completed ? '✓ Completed' : '○ Pending'}`
).join('\n')}

${plan.notes ? `Notes:\n${plan.notes}` : ''}

Generated by DroughtSmart AI Agronomist
Report generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-plan-${plan.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Action Plans</h1>
            <p className="text-gray-600">Manage AI-generated recommendations and track progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Devices</option>
              {devices.map(device => (
                <option key={device.id} value={device.id.toString()}>{device.name}</option>
              ))}
            </select>
            <button
              onClick={generateAIPlan}
              disabled={generatingAI}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {generatingAI ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate AI Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{actionPlans.filter(p => p.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{actionPlans.filter(p => p.status === 'in-progress').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{actionPlans.filter(p => p.status === 'completed').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{actionPlans.filter(p => p.status === 'archived').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Plans List */}
        <div className="space-y-4">
          {actionPlans.map((plan) => (
            <ActionPlanCard 
              key={plan.id} 
              plan={plan}
              onEdit={() => editPlan(plan)}
              onUpdateProgress={() => updateProgress(plan)}
              onToggleStep={(stepId) => toggleStepCompletion(plan.id, stepId)}
              onDelete={() => deletePlan(plan.id)}
              onDownloadPDF={() => downloadPDF(plan)}
              onAddStep={() => {
                setSelectedPlan(plan);
                setShowAddStepModal(true);
              }}
            />
          ))}
        </div>

        {/* AI Generation Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AI Agronomist Recommendation</h3>
                </div>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* AI Analysis */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Analysis for {aiRecommendation.device}</h4>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{aiRecommendation.dataPoints}</span> data points
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className="font-bold text-green-600">{aiRecommendation.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{aiRecommendation.reasoning}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      aiRecommendation.urgency === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {aiRecommendation.urgency} Priority
                    </span>
                    <span className="text-xs text-gray-500">
                      Based on {aiRecommendation.sensorDataPeriod} sensor data
                    </span>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                  <div className="space-y-2">
                    {aiRecommendation.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={saveAIPlan}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save as Action Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Step Modal */}
        {showAddStepModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Step</h3>
                <button
                  onClick={() => setShowAddStepModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const stepText = formData.get('stepText') as string;
                if (stepText.trim()) {
                  addStepToPlan(selectedPlan.id, stepText.trim());
                  setShowAddStepModal(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Description
                  </label>
                  <textarea
                    name="stepText"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter the new action step..."
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddStepModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Step
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ActionPlans;