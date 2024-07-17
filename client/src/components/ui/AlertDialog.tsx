import React, { useState, ReactNode } from 'react';

interface AlertDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ trigger, title, description, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="mb-4">{description}</p>
            <div className="flex justify-end space-x-2">
              {children}
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface AlertDialogActionProps {
  onClick: () => void;
  children: ReactNode;
}

export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ onClick, children }) => (
  <button
    onClick={() => {
      onClick();
    }}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    {children}
  </button>
);