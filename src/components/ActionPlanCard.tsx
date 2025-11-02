import { useState } from 'react';

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

interface ActionPlanCardProps {
  plan: ActionPlan;
  onEdit: () => void;
  onUpdateProgress: () => void;
  onToggleStep: (stepId: number) => void;
  onDelete: () => void;
  onDownloadPDF: () => void;
  onAddStep: () => void;
}

function ActionPlanCard({ 
  plan, 
  onEdit, 
  onUpdateProgress, 
  onToggleStep, 
  onDelete, 
  onDownloadPDF,
  onAddStep 
}: ActionPlanCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPlan, setEditedPlan] = useState(plan);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (plan.status === 'completed') return 100;
    const completedCount = plan.steps.filter(step => step.completed).length;
    return plan.steps.length > 0 ? Math.round((completedCount / plan.steps.length) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStepToggle = (stepId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleStep(stepId);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.title}</h3>
            <p className="text-sm text-gray-600">{plan.device}</p>
            {plan.sensorDataUsed && (
              <p className="text-xs text-gray-500 mt-1">📊 {plan.sensorDataUsed}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
              {plan.priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(plan.status)}`}>
              {plan.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {plan.status !== 'archived' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  plan.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Steps Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Action Steps</h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showDetails ? (
            <div className="space-y-2">
              {plan.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                  <button
                    onClick={(e) => handleStepToggle(step.id, e)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      step.completed
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    }`}
                  >
                    {step.completed ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${
                      step.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                    }`}>
                      {step.text}
                    </p>
                    {step.completed && step.completedDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Completed: {formatDate(step.completedDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Step Button */}
              <button
                onClick={onAddStep}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
              >
                + Add New Step
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {plan.steps.filter(s => s.completed).length} of {plan.steps.length} steps completed
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-600">AI Confidence:</span>
            <span className="ml-2 font-medium text-green-600">{plan.aiConfidence}%</span>
          </div>
          <div>
            <span className="text-gray-600">Est. Time:</span>
            <span className="ml-2 font-medium">{plan.estimatedTime}</span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 font-medium">{formatDate(plan.createdDate)}</span>
          </div>
          {plan.completedDate && (
            <div>
              <span className="text-gray-600">Completed:</span>
              <span className="ml-2 font-medium">{formatDate(plan.completedDate)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {plan.status === 'pending' && (
            <>
              <button 
                onClick={onUpdateProgress}
                className="flex-1 text-sm bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start Plan
              </button>
              <button 
                onClick={() => setShowEditModal(true)}
                className="text-sm text-gray-600 hover:text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                title="Edit Plan"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
          
          {plan.status === 'in-progress' && (
            <>
              <button 
                onClick={onUpdateProgress}
                className="flex-1 text-sm bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update Progress
              </button>
              <button 
                onClick={() => setShowEditModal(true)}
                className="text-sm text-gray-600 hover:text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                title="Edit Plan"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
          
          {(plan.status === 'completed' || plan.status === 'archived') && (
            <button 
              onClick={onDownloadPDF}
              className="flex-1 text-sm text-blue-600 hover:text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center space-x-1"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </button>
          )}
          
          <button 
            onClick={onDelete}
            className="text-sm text-red-600 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete Plan"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Action Plan</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // In a real app, this would update the plan
              setShowEditModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editedPlan.title}
                    onChange={(e) => setEditedPlan({...editedPlan, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editedPlan.priority}
                      onChange={(e) => setEditedPlan({...editedPlan, priority: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                    <input
                      type="text"
                      value={editedPlan.estimatedTime}
                      onChange={(e) => setEditedPlan({...editedPlan, estimatedTime: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={editedPlan.notes || ''}
                    onChange={(e) => setEditedPlan({...editedPlan, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                  <div className="space-y-2">
                    {editedPlan.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) => {
                            const updatedSteps = [...editedPlan.steps];
                            updatedSteps[index] = {...step, text: e.target.value};
                            setEditedPlan({...editedPlan, steps: updatedSteps});
                          }}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ActionPlanCard;