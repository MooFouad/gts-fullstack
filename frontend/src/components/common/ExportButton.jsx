import React from 'react';
import { FileDown } from 'lucide-react';

const ExportButton = ({ onClick, label = "Export to Excel", isLoading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileDown size={20} />
      {isLoading ? 'Exporting...' : label}
    </button>
  );
};

export default ExportButton;