import React, { useState } from 'react';

interface LegendSelectionProps {
  headers: string[];
  onComplete: (legends: string[]) => void;
}

export const LegendSelection: React.FC<LegendSelectionProps> = ({ headers, onComplete }) => {
  const [usedLegends, setUsedLegends] = useState<string[]>([]);

  const handleLegendChange = (header: string) => {
    setUsedLegends(prev => 
      prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
    );
  };

  const handleConfirm = () => {
    onComplete(usedLegends);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select Legends</h2>
      {headers.map(header => (
        <div key={`legend-${header}`} className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`legend-${header}`}
            checked={usedLegends.includes(header)}
            onChange={() => handleLegendChange(header)}
            className="mr-2"
          />
          <label htmlFor={`legend-${header}`}>{header}</label>
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