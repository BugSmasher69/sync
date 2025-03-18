import React, { useRef } from 'react';

const FileUpload = ({ onFileSelected, disabled }) => {
  const fileInputRef = useRef(null);
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  return (
    <div className="file-upload-container">
      <button 
        className={`file-upload-button ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        disabled={disabled}
      >
        <span className="upload-icon">📎</span>
        <span>Upload File</span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload;