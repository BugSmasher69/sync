import React from 'react';

const TextInput = ({ value, onChange, onSend, disabled, placeholder }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend();
    }
  };
  
  return (
    <form className="text-input-container" onSubmit={handleSubmit}>
      <textarea
        className="text-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button 
        type="submit" 
        className={`send-button ${disabled ? 'disabled' : ''}`}
        disabled={disabled || !value.trim()}
      >
        <span className="send-icon">➢</span>
      </button>
    </form>
  );
};

export default TextInput;