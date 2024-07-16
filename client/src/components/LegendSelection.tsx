import React, { useState, useMemo } from 'react';

interface LegendSelectionProps {
  headers: string[];
  onComplete: (legends: { [key: string]: string }) => void;
  columnMapping: Record<string, string>;
}

export const LegendSelection: React.FC<LegendSelectionProps> = ({ headers, onComplete, columnMapping }) => {
  const [usedLegends, setUsedLegends] = useState<{ [key: string]: string }>({});

  const availableHeaders = useMemo(() => {
    const mappedColumns = Object.values(columnMapping);
    return headers.filter(header => !mappedColumns.includes(header));
  }, [headers, columnMapping]);

  const handleLegendChange = (header: string) => {
    setUsedLegends(prev => {
      const newLegends = { ...prev };
      if (header in newLegends) {
        delete newLegends[header];
      } else {
        newLegends[header] = 'Text'; // Default to 'Text'
      }
      return newLegends;
    });
  };

  const handleTypeChange = (header: string, type: string) => {
    setUsedLegends(prev => ({
      ...prev,
      [header]: type
    }));
  };

  const handleConfirm = () => {
    onComplete(usedLegends);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select Legends</h2>
      {availableHeaders.map(header => (
        <div key={`legend-${header}`} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`legend-${header}`}
            checked={header in usedLegends}
            onChange={() => handleLegendChange(header)}
            className="mr-2"
          />
          <label htmlFor={`legend-${header}`} className="mr-2">{header}</label>
          {header in usedLegends && (
            <select
              value={usedLegends[header]}
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
        Confirm Legends
      </button>
    </div>
  );
};