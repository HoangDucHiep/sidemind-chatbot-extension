// SideMind · Error Banner Component

import React from 'react';

interface ErrorBannerProps {
  error: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  const isMissingKey = error.includes('MISSING_KEY') || error.includes('API key is not configured');
  const isRateLimit = error.includes('429') || error.includes('quota') || error.includes('rate limit');
  const isNetwork = error.includes('Network') || error.includes('Failed to fetch');

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  };

  return (
    <div
      style={{
        padding: '12px 14px',
        background: isMissingKey ? 'var(--accent-soft)' : 'var(--paper)',
        border: '1px solid var(--accent)',
        color: 'var(--ink)',
        fontSize: '12px',
        lineHeight: 1.5,
        margin: '8px 0',
      }}
    >
      <div className="row between" style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
          {isMissingKey
            ? '🔑 API Key Required'
            : isRateLimit
              ? '⏳ Rate Limit Exceeded (429)'
              : isNetwork
                ? '🌐 Network Connection Error'
                : '⚠ AI Generation Error'}
        </span>
        {onDismiss && (
          <button type="button" className="btn-ghost" style={{ fontSize: '12px', padding: '0 4px' }} onClick={onDismiss}>
            ✕
          </button>
        )}
      </div>

      <div style={{ color: 'var(--muted)', marginBottom: isMissingKey ? '8px' : '0' }}>{error}</div>

      {isMissingKey && (
        <button type="button" className="btn btn-filled btn-sm" onClick={openOptions}>
          Open Settings & Add API Key ↗
        </button>
      )}
    </div>
  );
};
