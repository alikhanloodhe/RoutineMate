import React, { useState, useMemo } from 'react';
import GroupTaskItem from './GroupTaskItem';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  FiFilter, 
  FiX, 
  FiSearch, 
  FiList, 
  FiTag, 
  FiUser, 
  FiAlertTriangle,
  FiSliders,
  FiCheck,
  FiChevronDown
} from 'react-icons/fi';

/**
 * GroupTaskList component displays a list of group tasks with filtering capabilities
 * 
 * @param {Object} props
 * @param {Array} props.tasks - Array of group task objects
 * @param {Array} props.priorities - Priority options for filtering
 * @param {Array} props.statuses - Status options for filtering
 * @param {Array} props.tags - Tag options for filtering
 * @param {Array} props.friends - Friends/users for filtering by assignee
 * @param {Function} props.onEdit - Function called when a task is edited
 * @param {Function} props.onDelete - Function called when a task is deleted
 */
const GroupTaskList = ({
  tasks = [],
  priorities = [],
  statuses = [],
  tags = [],
  friends = [],
  onEdit,
  onDelete
}) => {
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    tag: null,
    assignee: null,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'title'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Get active filter count
  const activeFilterCount = [
    filters.priority,
    filters.status,
    filters.tag,
    filters.assignee
  ].filter(Boolean).length + (filters.search ? 1 : 0);

  // Get current sort label
  const getSortLabel = () => {
    switch(sortBy) {
      case 'dueDate': return 'Due Date';
      case 'priority': return 'Priority';
      case 'title': return 'Title';
      default: return 'Sort by';
    }
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    // First filter the tasks
    const filtered = tasks.filter(task => {
      // Filter by search text
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filter by priority
      if (filters.priority && task.priorityId !== filters.priority) {
        return false;
      }
      
      // Filter by status
      if (filters.status && task.statusId !== filters.status) {
        return false;
      }
      
      // Filter by tag
      if (filters.tag && !task.tagIds.includes(filters.tag)) {
        return false;
      }
      
      // Filter by assignee
      if (filters.assignee && !task.assignees.includes(filters.assignee)) {
        return false;
      }
      
      return true;
    });
    
    // Then sort the filtered tasks
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Handle null dates
          if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
          if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;
          // Sort by date
          return sortDirection === 'asc' 
            ? new Date(a.dueDate) - new Date(b.dueDate)
            : new Date(b.dueDate) - new Date(a.dueDate);
        
        case 'priority':
          return sortDirection === 'asc'
            ? a.priorityId - b.priorityId
            : b.priorityId - a.priorityId;
        
        case 'title':
          return sortDirection === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        
        default:
          return 0;
      }
    });
  }, [tasks, filters, sortBy, sortDirection]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value === filters[filterType] ? null : value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priority: null,
      status: null,
      tag: null,
      assignee: null,
      search: ''
    });
  };

  // Toggle sort menu
  const toggleSortMenu = () => {
    setShowSortMenu(!showSortMenu);
  };

  // Handle sort selection
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setShowSortMenu(false);
  };

  return (
    <div>
      {/* Search and filter header */}
      <div className="mb-6">
        <Card shadow="sm" className="overflow-visible">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search in tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Button 
                  variant="light"
                  icon={FiSliders}
                  onClick={toggleSortMenu}
                  rightIcon={FiChevronDown}
                >
                  {getSortLabel()}
                </Button>
                
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-1 z-10 w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <ul>
                      <li>
                        <button 
                          className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 
                            ${sortBy === 'dueDate' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => handleSort('dueDate')}
                        >
                          <span>Due Date</span>
                          {sortBy === 'dueDate' && (
                            <FiCheck className="text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 
                            ${sortBy === 'priority' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => handleSort('priority')}
                        >
                          <span>Priority</span>
                          {sortBy === 'priority' && (
                            <FiCheck className="text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 
                            ${sortBy === 'title' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                          onClick={() => handleSort('title')}
                        >
                          <span>Title</span>
                          {sortBy === 'title' && (
                            <FiCheck className="text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            
              <Button 
                variant={showFilters ? 'primary' : 'light'}
                icon={FiFilter}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    color={showFilters ? 'secondary' : 'primary'} 
                    className="ml-1"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filters section */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button 
                    variant="text"
                    size="sm"
                    icon={FiX}
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiAlertTriangle size={14} />
                    <span>Priority</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map(priority => (
                      <Badge
                        key={priority.id}
                        color={priority.color}
                        className={`cursor-pointer transition-all ${filters.priority === priority.id ? 'opacity-100 shadow-sm' : 'opacity-80'}`}
                        style={{
                          fontWeight: filters.priority === priority.id ? 'bold' : 'normal'
                        }}
                        onClick={() => handleFilterChange('priority', priority.id)}
                      >
                        {priority.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiList size={14} />
                    <span>Status</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <Badge
                        key={status.id}
                        color={status.color || "secondary"}
                        className={`cursor-pointer transition-all ${filters.status === status.id ? 'opacity-100 shadow-sm' : 'opacity-80'}`}
                        style={{
                          fontWeight: filters.status === status.id ? 'bold' : 'normal'
                        }}
                        onClick={() => handleFilterChange('status', status.id)}
                      >
                        {status.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiTag size={14} />
                    <span>Tags</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag.id}
                        color={tag.color || "secondary"}
                        icon={<FiTag size={12} />}
                        className={`cursor-pointer transition-all ${filters.tag === tag.id ? 'opacity-100 shadow-sm' : 'opacity-80'}`}
                        style={{
                          fontWeight: filters.tag === tag.id ? 'bold' : 'normal'
                        }}
                        onClick={() => handleFilterChange('tag', tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiUser size={14} />
                    <span>Assignees</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        className={`flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer transition-all
                          ${filters.assignee === friend.id
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 shadow-sm'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
                          }`}
                        onClick={() => handleFilterChange('assignee', friend.id)}
                      >
                        <img 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-5 h-5 rounded-full border border-white dark:border-gray-700" 
                        />
                        <span className="text-xs font-medium">{friend.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center mb-4">
            <FiList className="text-2xl text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {activeFilterCount > 0 
              ? "There are no tasks matching your current filters." 
              : "There are no tasks in this list yet. Create your first task to get started."}
          </p>
          
          {activeFilterCount > 0 && (
            <Button 
              onClick={clearFilters}
              variant="primary"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map(task => {
            const priorityObj = priorities.find(p => p.id === task.priorityId);
            const statusObj = statuses.find(s => s.id === task.statusId);
            const tagObjs = task.tagIds?.map(id => tags.find(t => t.id === id)).filter(Boolean) || [];
            const assigneeObjs = task.assignees?.map(id => friends.find(f => f.id === id)).filter(Boolean) || [];
            
            return (
              <GroupTaskItem
                key={task.id}
                task={task}
                priority={priorityObj}
                status={statusObj}
                tags={tagObjs}
                assignees={assigneeObjs}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupTaskList; 