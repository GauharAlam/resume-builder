import React from 'react';

interface SaveStatusIndicatorProps {
  status: 'saving' | 'saved' | 'error';
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status }) => {
  if (status === 'saving') {
    return (
      <div className="flex items-center text-sm text-gray-500 transition-opacity duration-300" aria-live="polite">
        <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center text-sm text-red-600 transition-opacity duration-300" aria-live="polite">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.8 4a2 2 0 00-3.6 0L3.33 16a2 2 0 001.74 3z" />
        </svg>
        Save failed. Try again
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-gray-500 transition-opacity duration-300" aria-live="polite">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      All changes saved
    </div>
  );
};

export default SaveStatusIndicator;
