import React, { useState, useMemo } from 'react';

interface FilterSelectionProps {
  headers: string[];
  onComplete: (filters: { [key: string]: string }) => void;
  columnMapping: Record<string, string>;
}

export const FilterSelection: React.FC<FilterSelectionProps> = ({ headers, onComplete, columnMapping }) => {
  const [usedFilters, setUsedFilters] = useState<{ [key: string]: string }>({});

  const availableHeaders = useMemo(() => {
    const mappedColumns = Object.values(columnMapping);
    return headers.filter(header => !mappedColumns.includes(header));
  }, [headers, columnMapping]);

  const handleFilterChange = (header: string) => {
    setUsedFilters(prev => {
      const newFilters = { ...prev };
      if (header in newFilters) {
        delete newFilters[header];
      } else {
        newFilters[header] = 'Text'; // Default to 'Text'
      }
      return newFilters;
    });
  };

  const handleTypeChange = (header: string, type: string) => {
    setUsedFilters(prev => ({
      ...prev,
      [header]: type
    }));
  };

  const handleConfirm = () => {
    onComplete(usedFilters);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select Filters</h2>
      {availableHeaders.map(header => (
        <div key={`filter-${header}`} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`filter-${header}`}
            checked={header in usedFilters}
            onChange={() => handleFilterChange(header)}
            className="mr-2"
          />
          <label htmlFor={`filter-${header}`} className="mr-2">{header}</label>
          {header in usedFilters && (
            <select
              value={usedFilters[header]}
              onChange={(e) => handleTypeChange(header, e.target.value)}
              className="p-1 border rounded"
            >
              <option value="Text">Text</option>
              <option value="Numbers">Numbers</option>
            </select>
          )}
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