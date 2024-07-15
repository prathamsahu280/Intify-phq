import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface ImportSpreadsheetProps {
  setSpreadsheetId: (id: string) => void;
  setSelectedSheet: (sheet: string) => void;
}

export const ImportSpreadsheet: React.FC<ImportSpreadsheetProps> = ({ setSpreadsheetId, setSelectedSheet }) => {
  const [url, setUrl] = useState('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const id = match[1];
      console.log('Spreadsheet ID:', id);
      setSpreadsheetId(id);
      Cookies.set('spreadsheetId', id, { expires: 30 });

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

  const handleSheetSelect = (sheet: string) => {
    setSelectedSheet(sheet);
    Cookies.set('selectedSheet', sheet, { expires: 30 });
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
      <button
        onClick={handleImport}
        className="p-2 px-4 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Import Spreadsheet'}
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