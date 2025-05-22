import React from 'react';

const SummaryButton = ({ onSummarize, disabled, pendingCount }) => {
  const handleClick = () => {
    if (pendingCount === 0) {
      alert('No pending todos to summarize!');
      return;
    }
    onSummarize();
  };

  return (
    <div className="summary-button-container">
      <div className="summary-info">
        <h3>AI Summary & Slack Integration</h3>
        <p>
          Generate an AI-powered summary of your {pendingCount} pending todo{pendingCount !== 1 ? 's' : ''} 
          and send it directly to your Slack channel.
        </p>
      </div>
      
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`btn btn-large btn-summary ${disabled ? 'disabled' : ''}`}
      >
        {disabled ? (
          <>
            <span className="spinner-small"></span>
            Generating Summary...
          </>
        ) : (
          <>
            🤖 Generate Summary & Send to Slack
          </>
        )}
      </button>

      <div className="summary-features">
        <div className="feature">
          <span className="feature-icon">🎯</span>
          <span>Smart categorization</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📊</span>
          <span>Priority insights</span>
        </div>
        <div className="feature">
          <span className="feature-icon">💬</span>
          <span>Slack delivery</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryButton;