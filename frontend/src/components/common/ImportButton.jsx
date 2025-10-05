import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';

const ImportButton = ({ onImport, label = "Import Excel", accept = ".xlsx,.xls" }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await onImport(file);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        <FileUp size={20} />
        {label}
      </button>
    </>
  );
};

export default ImportButton;