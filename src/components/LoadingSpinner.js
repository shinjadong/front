import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-message">
        {message || '잠시만 기다려주세요...'}
      </div>
    </div>
  );
};

export default LoadingSpinner;
