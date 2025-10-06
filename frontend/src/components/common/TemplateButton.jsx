import React from 'react';
import { FileDown } from 'lucide-react';

const TemplateButton = ({ onClick, label = "Download Template" }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
    >
      <FileDown size={20} />
      {label}
    </button>
  );
};

export default TemplateButton;