import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({ 
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="mb-4">
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
    </div>
  );
};

export default FilterBar; 