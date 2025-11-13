import { useState } from 'react';
import api from '../api/axios';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

export default function SectionList({ sections, tasks, projectId, onRefresh, groupBy }) {
  const [newSectionName, setNewSectionName] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      await api.post('/sections', {
        projectId,
        name: newSectionName,
        order: sections.length
      });
      setNewSectionName('');
      onRefresh();
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section and all its tasks?')) return;

    try {
      await api.delete(`/sections/${sectionId}`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const handleAddTask = (sectionId) => {
    setSelectedSection(sectionId);
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
      } else {
        await api.post('/tasks', { ...taskData, sectionId: selectedSection });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getTasksBySection = (sectionId) => {
    return tasks.filter(t => t.sectionId === sectionId);
  };

  const renderGroupedTasks = () => {
    if (!groupBy) {
      return sections.map(section => (
        <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 hover:shadow-md transition">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">{section.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddTask(section.id)}
                className="flex-1 sm:flex-none bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium shadow-sm transition"
              >
                + Task
              </button>
              <button
                onClick={() => handleDeleteSection(section.id)}
                className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-medium shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {getTasksBySection(section.id).length > 0 ? (
              getTasksBySection(section.id).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                No tasks yet. Click "+ Task" to add one!
              </div>
            )}
          </div>
        </div>
      ));
    }

    const groups = {};
    tasks.forEach(task => {
      const key = task[groupBy];
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return Object.entries(groups).map(([groupName, groupTasks]) => (
      <div key={groupName} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 hover:shadow-md transition">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
          {groupName} ({groupTasks.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {groupTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <form onSubmit={handleAddSection} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Section</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Enter section name..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium shadow-sm transition whitespace-nowrap"
          >
            Add Section
          </button>
        </div>
      </form>

      {renderGroupedTasks()}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
