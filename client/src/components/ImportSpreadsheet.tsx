import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface ImportSpreadsheetProps {
  setSpreadsheetId: (id: string) => void;
  setSelectedSheet: (sheet: string) => void;
  setCurrentStep: (step: 'import' | 'mapping' | 'filters' | 'main') => void;
  setFileType: (type: 'spreadsheet' | 'excel') => void;
}

export const ImportSpreadsheet: React.FC<ImportSpreadsheetProps> = ({ setSpreadsheetId, setSelectedSheet, setCurrentStep, setFileType }) => {
  const [url, setUrl] = useState('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [excelFilePath, setExcelFilePath] = useState<string | null>(null);

  const handleImport = async () => {
    if (file) {
      handleFileImport();
    } else if (url) {
      handleSpreadsheetImport();
    }
  };

  const handleSpreadsheetImport = async () => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const id = match[1];
      setSpreadsheetId(id);
      Cookies.set('spreadsheetId', id, { expires: 30 });
      Cookies.set('fileType', 'spreadsheet', { expires: 30 });
      setFileType('spreadsheet');

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/spreadsheet/sheets?id=${id}`);
        const sheets = response.data;
        setSheets(sheets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sheets:', error);
        setLoading(false);
      }
    } else {
      alert('Invalid Google Sheets URL');
    }
  };

  const handleFileImport = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      setLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/excel/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const { filePath, sheets } = response.data;
        setExcelFilePath(filePath);
        Cookies.set('excelFilePath', filePath, { expires: 30 });
        Cookies.set('fileType', 'excel', { expires: 30 });
        setFileType('excel');
        setSheets(sheets);
        setLoading(false);
        // Don't navigate to mapping yet
      } catch (error) {
        console.error('Error uploading file:', error);
        setLoading(false);
      }
    }
  };

  const handleSheetSelect = (sheet: string) => {
    setSelectedSheet(sheet);
    Cookies.set('selectedSheet', sheet, { expires: 30 });
    setCurrentStep('mapping');
  };


  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter Google Sheets URL"
        className="mb-4 p-2 border rounded"
      />
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleImport}
        className="p-2 px-4 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Import'}
      </button>
      {sheets.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold">Select a Sheet:</h3>
          <select 
            onChange={(e) => handleSheetSelect(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select a sheet</option>
            {sheets.map((sheet, index) => (
              <option key={index} value={sheet}>{sheet}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};