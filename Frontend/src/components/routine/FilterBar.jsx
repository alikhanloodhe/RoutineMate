import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const FilterBar = ({ 
  searchTerm,
  setSearchTerm,
  routineTypeFilter,
  setRoutineTypeFilter
}) => {
  const [showDayFilters, setShowDayFilters] = useState(false);
  
  const dayFilters = [
    { id: 'Mon', label: 'Monday' },
    { id: 'Tue', label: 'Tuesday' },
    { id: 'Wed', label: 'Wednesday' },
    { id: 'Thu', label: 'Thursday' },
    { id: 'Fri', label: 'Friday' },
    { id: 'Sat', label: 'Saturday' },
    { id: 'Sun', label: 'Sunday' }
  ];
  
  return (
    <div className="mb-4 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search routines..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-[#4A2BAF]/30 focus:border-[#4A2BAF] focus:outline-none"
        />
      </div>

      {/* Routine type filter */}
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-md border border-gray-200">
        <div className="flex items-center text-sm text-gray-600 mr-1">
          <Filter className="h-4 w-4 mr-1" />
          <span>Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setRoutineTypeFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-full ${
              routineTypeFilter === 'all'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Routines
          </button>
          <button
            onClick={() => setRoutineTypeFilter('daily')}
            className={`px-3 py-1.5 text-xs rounded-full ${
              routineTypeFilter === 'daily'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setRoutineTypeFilter('weekday')}
            className={`px-3 py-1.5 text-xs rounded-full ${
              routineTypeFilter === 'weekday'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekdays
          </button>
          <button
            onClick={() => setRoutineTypeFilter('weekend')}
            className={`px-3 py-1.5 text-xs rounded-full ${
              routineTypeFilter === 'weekend'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekends
          </button>
          
          {/* Toggle day filters */}
          <button
            onClick={() => setShowDayFilters(!showDayFilters)}
            className="ml-auto px-3 py-1.5 text-xs rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 flex items-center"
          >
            Individual Days
            {showDayFilters ? (
              <ChevronUp size={14} className="ml-1" />
            ) : (
              <ChevronDown size={14} className="ml-1" />
            )}
          </button>
        </div>
        
        {/* Individual day filters */}
        {showDayFilters && (
          <div className="w-full mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1.5">
            {dayFilters.map(day => (
              <button
                key={day.id}
                onClick={() => setRoutineTypeFilter(day.id)}
                className={`px-3 py-1.5 text-xs rounded-full ${
                  routineTypeFilter === day.id
                    ? 'bg-[#4A2BAF] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar; 