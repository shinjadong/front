import React from 'react';
import '../styles/LoadingSpinner.css';

function LoadingSpinner({ message = "잠시만 기다려주세요. 자동화 시스템 가동중" }) {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
