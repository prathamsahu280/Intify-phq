import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ColumnMappingProps {
  spreadsheetId: string;
  onMappingComplete: (mapping: Record<string, string>) => void;
  sheetName: string;
}

export const ColumnMapping: React.FC<ColumnMappingProps> = ({ spreadsheetId, onMappingComplete, sheetName }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    Date: '',
    GR: '',
    Name: '',
    Content: '',
    UniqueId: ''
  });

  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/spreadsheet/headers?id=${spreadsheetId}&name=${sheetName}`);
        setHeaders(response.data);
      } catch (error) {
        console.error('Error fetching headers:', error);
      }
    };

    fetchHeaders();
  }, [spreadsheetId, sheetName]);

  const handleMappingChange = (field: string, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onMappingComplete(mapping);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Column Mapping</h2>
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
                  {headers.map((header) => (
                    <option key={header} value={header}>
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