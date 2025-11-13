import { useState, useEffect } from 'react';
import api from '../api/axios';
import SectionList from './SectionList';
import TaskFilters from './TaskFilters';

export default function ProjectView({ project, onDeleteProject, onUpdateProject }) {
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    dueDateFrom: '',
    dueDateTo: '',
    groupBy: ''
  });

  useEffect(() => {
    if (project) {
      // Clear AI summary when switching projects
      setAiSummary('');
      fetchSections();
      fetchTasks();
    }
  }, [project]);

  const fetchSections = async () => {
    try {
      const response = await api.get(`/sections/project/${project.id}`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/project/${project.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    setAiSummary(''); // Clear previous summary
    try {
      const response = await api.post('/ai/summary', { projectId: project.id });
      setAiSummary(response.data.summary);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setAiSummary('');
      }, 10000);
    } catch (error) {
      console.error('Error generating summary:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate summary. Please check backend logs.';
      alert(errorMessage);
      setAiSummary('');
    } finally {
      setLoadingSummary(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    
    if (filters.assignee) {
      filtered = filtered.filter(t => 
        t.assignee && t.assignee.toLowerCase().includes(filters.assignee.toLowerCase())
      );
    }
    
    if (filters.dueDateFrom) {
      filtered = filtered.filter(t => 
        t.dueDate && t.dueDate >= filters.dueDateFrom
      );
    }
    
    if (filters.dueDateTo) {
      filtered = filtered.filter(t => 
        t.dueDate && t.dueDate <= filters.dueDateTo
      );
    }
    
    return filtered;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mt-0 lg:mt-0">
      <div className="mb-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 break-words">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2 text-sm sm:text-base">{project.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateSummary}
                disabled={loadingSummary}
                className="flex-1 sm:flex-none bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 font-medium shadow-sm transition text-sm sm:text-base"
              >
                {loadingSummary ? 'Generating...' : '🤖 AI Summary'}
              </button>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium shadow-sm transition text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>

          {aiSummary && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mt-4 animate-fade-in">
              <div className="flex items-start gap-2">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-1">AI Project Summary</h3>
                  <p className="text-gray-700 text-sm sm:text-base">{aiSummary}</p>
                  <p className="text-xs text-purple-600 mt-2 italic">This message will auto-dismiss in 10 seconds</p>
                </div>
                <button
                  onClick={() => setAiSummary('')}
                  className="text-purple-600 hover:text-purple-800 font-bold text-xl"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Sections and Tasks */}
      <SectionList
        sections={sections}
        tasks={getFilteredTasks()}
        projectId={project.id}
        onRefresh={() => {
          fetchSections();
          fetchTasks();
        }}
        groupBy={filters.groupBy}
      />
    </div>
  );
}
