import React, { useState } from 'react';

interface FilterSelectionProps {
  headers: string[];
  onComplete: (filters: string[]) => void;
}

export const FilterSelection: React.FC<FilterSelectionProps> = ({ headers, onComplete }) => {
  const [usedFilters, setUsedFilters] = useState<string[]>([]);

  const handleFilterChange = (header: string) => {
    setUsedFilters(prev => 
      prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
    );
  };

  const handleConfirm = () => {
    onComplete(usedFilters);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select Filters</h2>
      {headers.map(header => (
        <div key={`filter-${header}`} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`filter-${header}`}
            checked={usedFilters.includes(header)}
            onChange={() => handleFilterChange(header)}
            className="mr-2"
          />
          <label htmlFor={`filter-${header}`}>{header}</label>
        </div>
      ))}
      <button
        onClick={handleConfirm}
        className="mt-4 p-2 px-4 bg-blue-500 text-white rounded"
      >
        Confirm Filters
      </button>
    </div>
  );
};