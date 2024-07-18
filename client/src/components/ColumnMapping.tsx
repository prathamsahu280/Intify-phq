import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface ColumnMappingProps {
  spreadsheetId: string;
  onMappingComplete: (mapping: Record<string, string>) => void;
  sheetName: string;
  setCurrentStep: (step: 'import' | 'mapping' | 'filters' | 'main') => void;
}

export const ColumnMapping: React.FC<ColumnMappingProps> = ({ spreadsheetId, onMappingComplete, sheetName, setCurrentStep }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    Date: '',
    GR: '',
    Name: '',
    Content: '',
    UniqueId: ''
  });
  const [error, setError] = useState<string | null>(null);

  const fileType = Cookies.get('fileType');
  const excelFilePath = Cookies.get('excelFilePath');

  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        let response;
        if (fileType === 'spreadsheet') {
          response = await axios.get(`http://localhost:5000/api/spreadsheet/headers?id=${spreadsheetId}&name=${sheetName}`);
        } else if (fileType === 'excel' && excelFilePath) {
          response = await axios.get(`http://localhost:5000/api/excel/headers?filePath=${encodeURIComponent(excelFilePath)}&sheetName=${encodeURIComponent(sheetName)}`);
        } else {
          throw new Error('Invalid file type or missing file path');
        }
        setHeaders(response.data);
      } catch (error) {
        console.error('Error fetching headers:', error);
        setError('Failed to fetch headers. Please try again.');
      }
    };

    if (sheetName) {
      fetchHeaders();
    }

    // Load mapping from cookies
    const storedMapping = Cookies.get('columnMapping');
    if (storedMapping) {
      setMapping(JSON.parse(storedMapping));
    }
  }, [spreadsheetId, sheetName, fileType, excelFilePath]);

  const handleMappingChange = (field: string, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes a change
  };

  const handleSubmit = () => {
    // Check if all fields are filled
    const emptyFields = Object.entries(mapping).filter(([_, value]) => value === '');
    
    if (emptyFields.length > 0) {
      setError(`Please fill all fields. Missing: ${emptyFields.map(([field]) => field).join(', ')}`);
      return;
    }

    onMappingComplete(mapping);
  };

  const handleGoBack = () => {
    setCurrentStep('import');
  };

  return (
    <div className="p-4">
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 p-2 px-4 bg-gray-500 text-white rounded"
      >
        Go Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Column Mapping</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Mapping</th>
            <th className="border border-gray-300 p-2">Select</th>
          </tr>
        </thead>
        <tbody>
  {Object.keys(mapping).map((field) => (
    <tr key={field}>
      <td className="border border-gray-300 p-2">{field}</td>
      <td className="border border-gray-300 p-2">
        <select
          value={mapping[field]}
          onChange={(e) => handleMappingChange(field, e.target.value)}
          className="w-full p-1"
        >
          <option value="">Select a column</option>
          {headers.map((header, index) => header && header.length >1 && (
            <option key={`${header}-${index}`} value={header}>
              {header}
            </option>
          ))}
        </select>
      </td>
    </tr>
  ))}
</tbody>
      </table>
      <button
        onClick={handleSubmit}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Confirm Mapping
      </button>
    </div>
  );
};