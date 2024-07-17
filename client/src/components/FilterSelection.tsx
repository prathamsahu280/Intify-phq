import React, { useState, useMemo, useEffect } from 'react';
import Cookies from 'js-cookie';

interface FilterSelectionProps {
  headers: string[];
  onComplete: (filters: { [key: string]: string }) => void;
  columnMapping: Record<string, string>;
  setCurrentStep: (step: 'import' | 'mapping' | 'filters' | 'main') => void;
}

export const FilterSelection: React.FC<FilterSelectionProps> = ({ headers, onComplete, columnMapping, setCurrentStep }) => {
  const [selectedFields, setSelectedFields] = useState<{ [key: string]: string }>({});

  const availableHeaders = useMemo(() => {
    const mappedColumns = Object.values(columnMapping);
    return headers.filter(header => !mappedColumns.includes(header));
  }, [headers, columnMapping]);

  useEffect(() => {
    // Load filters from cookies
    const storedFilters = Cookies.get('usedFilters');
    if (storedFilters) {
      setSelectedFields(JSON.parse(storedFilters));
    }
  }, []);

  const handleFieldChange = (header: string) => {
    setSelectedFields(prev => {
      const newFields = { ...prev };
      if (header in newFields) {
        delete newFields[header];
      } else {
        newFields[header] = 'Text'; // Default to 'Text'
      }
      return newFields;
    });
  };

  const handleTypeChange = (header: string, type: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [header]: type
    }));
  };

  const handleConfirm = () => {
    onComplete(selectedFields);
  };

  const handleGoBack = () => {
    setCurrentStep('mapping');
  };

  return (
    <div className="p-4">
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 p-2 px-4 bg-gray-500 text-white rounded"
      >
        Go Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Select Fields</h2>
      {availableHeaders.map(header => (
        <div key={`field-${header}`} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`field-${header}`}
            checked={header in selectedFields}
            onChange={() => handleFieldChange(header)}
            className="mr-2"
          />
          <label htmlFor={`field-${header}`} className="mr-2">{header}</label>
          {header in selectedFields && (
            <select
              value={selectedFields[header]}
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
       Confirm Fields
     </button>
   </div>
 );
};