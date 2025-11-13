export default function TaskCard({ task, onEdit, onDelete }) {
  const priorityColors = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Done': 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
        <h4 className="font-semibold text-sm sm:text-base text-gray-800 flex-1 break-words">{task.title}</h4>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1 hover:bg-red-50 rounded transition"
          >
            Delete
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
          {task.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-2">
        {task.assignee && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{task.assignee}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {task.effort && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{task.effort}</span>
          </div>
        )}
      </div>
    </div>
  );
}
