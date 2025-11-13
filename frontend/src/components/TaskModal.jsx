import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function TaskModal({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'Medium',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || '',
    effort: task?.effort || ''
  });
  
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get AI suggestions when title or description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title && formData.title.length > 3 && !task) {
        getAISuggestions();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  const getAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await api.post('/ai/suggest', {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate
      });
      setAiSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestions = () => {
    if (aiSuggestions) {
      setFormData({
        ...formData,
        priority: aiSuggestions.priority,
        effort: aiSuggestions.effort
      });
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          {loadingSuggestions && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>AI analyzing...</span>
            </div>
          )}
        </div>

        {/* AI Suggestions Banner */}
        {showSuggestions && aiSuggestions && !task && (
          <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h3 className="font-semibold text-purple-900">AI Suggestions</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Priority:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      aiSuggestions.priority === 'High' ? 'bg-red-100 text-red-800' :
                      aiSuggestions.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {aiSuggestions.priority}
                    </span>
                    <span className="text-gray-500">({aiSuggestions.priorityConfidence}% confidence)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Effort:</span>
                    <span className="text-gray-700">{aiSuggestions.effort}</span>
                    <span className="text-gray-500">({aiSuggestions.effortConfidence}% confidence)</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{aiSuggestions.priorityReasoning}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={applySuggestions}
                  className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 whitespace-nowrap"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter task description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
            <input
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter assignee name..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Effort</label>
              <input
                type="text"
                name="effort"
                value={formData.effort}
                onChange={handleChange}
                placeholder="e.g., 2h, 1d"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-sm transition"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
