import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import ProjectView from '../components/ProjectView';
import ProjectModal from '../components/ProjectModal';

export default function Dashboard() {
  const { logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      setProjects([response.data, ...projects]);
      setSelectedProject(response.data);
      setShowProjectModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Delete this project and all its data?')) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      setSelectedProject(projects[0] || null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button - Fixed position that doesn't overlap */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all active:scale-95"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={(project) => {
          setSelectedProject(project);
          setIsSidebarOpen(false);
        }}
        onAddProject={() => {
          setShowProjectModal(true);
          setIsSidebarOpen(false);
        }}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main content with padding-top on mobile to avoid overlap with menu button */}
      <div className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {selectedProject ? (
          <ProjectView
            project={selectedProject}
            onDeleteProject={handleDeleteProject}
            onUpdateProject={fetchProjects}
          />
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">No Projects Yet</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">Get started by creating your first project to organize your tasks and boost productivity.</p>
              <button
                onClick={() => setShowProjectModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium shadow-lg transition transform hover:scale-105"
              >
                Create Your First Project
              </button>
            </div>
          </div>
        )}
      </div>

      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSave={handleCreateProject}
        />
      )}
    </div>
  );
}
