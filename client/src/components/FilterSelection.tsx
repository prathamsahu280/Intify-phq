import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface FilterSelectionProps {
  onComplete: (filters: { [key: string]: string }) => void;
  columnMapping: Record<string, string>;
  setCurrentStep: (step: 'import' | 'mapping' | 'filters' | 'main') => void;
}

export const FilterSelection: React.FC<FilterSelectionProps> = ({ 
  onComplete, 
  columnMapping, 
  setCurrentStep 
}) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const fileType = Cookies.get('fileType');
  const spreadsheetId = Cookies.get('spreadsheetId');
  const excelFilePath = Cookies.get('excelFilePath');
  const sheetName = Cookies.get('selectedSheet');

  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        let response;
        if (fileType === 'spreadsheet' && spreadsheetId) {
          response = await axios.get(`http://localhost:5000/api/spreadsheet/headers?id=${spreadsheetId}&name=${sheetName}`);
        } else if (fileType === 'excel' && excelFilePath) {
          response = await axios.get(`http://localhost:5000/api/excel/headers?filePath=${encodeURIComponent(excelFilePath)}&sheetName=${encodeURIComponent(sheetName || '')}`);
        } else {
          throw new Error('Invalid file type or missing data');
        }
        
        // Filter out headers that are already mapped in columnMapping
        const mappedHeaders = Object.values(columnMapping);
        const availableHeaders = response.data.filter((header: string) => !mappedHeaders.includes(header));
        setHeaders(availableHeaders);
      } catch (error) {
        console.error('Error fetching headers:', error);
        setError('Failed to fetch headers. Please try again.');
      }
    };

    fetchHeaders();
  }, [fileType, spreadsheetId, excelFilePath, sheetName, columnMapping]);

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
      <h2 className="text-2xl font-bold mb-4">Select Fields for Filtering</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {headers.length === 0 ? (
        <p>No additional fields available for filtering.</p>
      ) : (
        headers.map(header => (
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
        ))
      )}
      <button
        onClick={handleConfirm}
        className="mt-4 p-2 px-4 bg-blue-500 text-white rounded"
      >
        Confirm Fields
      </button>
    </div>
  );
};