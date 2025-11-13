import { useState } from 'react';

export default function Sidebar({ projects, selectedProject, onSelectProject, onAddProject, onLogout, isOpen, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 sm:w-72 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Project Manager</h1>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:bg-blue-600 p-1 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700 text-sm sm:text-base">Projects</h2>
            <button
              onClick={onAddProject}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 text-xs sm:text-sm font-medium shadow-sm transition"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No projects yet. Click "+ Add" to create one!
              </div>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm sm:text-base truncate">{project.name}</div>
                  {project.description && (
                    <div className="text-xs sm:text-sm text-gray-500 truncate mt-1">{project.description}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 font-medium shadow-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
