// SideMind · About & System Information Tab

import React from 'react';
import { useI18n } from '../../lib/i18n';

export const AboutTab: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="stack gap-6">
      {/* Hero card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="row gap-2">
              <span className="font-heading" style={{ fontSize: '24px', fontWeight: 700 }}>
                Side<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Mind</span>
              </span>
              <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                v0.3.0
              </span>
            </div>
            <p className="text-sm text-muted" style={{ marginTop: '6px' }}>
              {t('settings.about.subtitle')}
            </p>
          </div>
          <span className="chip chip-filled" style={{ fontSize: '11px' }}>
            MIT License
          </span>
        </div>

        <div className="callout" style={{ marginTop: '16px' }}>
          <div className="callout-title">
            <span>✨</span> Core Technical Highlights
          </div>
          <div className="stack gap-1 text-xs" style={{ marginTop: '4px' }}>
            <div>• <strong>No-Backend Architecture:</strong> Direct browser-to-provider HTTPS streaming (zero proxy).</div>
            <div>• <strong>Local Key Vault:</strong> AES-GCM-256 encryption with PBKDF2 device-derived keys.</div>
            <div>• <strong>5 Context Pipelines:</strong> YouTube transcripts, Article readability, PDF.js, Google Docs, and General DOM.</div>
            <div>• <strong>Interactive Citations:</strong> Smooth scroll & background highlight pulse on source web pages.</div>
          </div>
        </div>
      </div>

      {/* Specifications & Tech Stack */}
      <div className="card">
        <h4 className="card-title">Technical Specifications</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '8px' }}>
          <tbody>
            <tr style={{ borderBottom: 'var(--hairline)' }}>
              <td style={{ padding: '10px 4px', color: 'var(--muted)', width: '35%' }}>Platform</td>
              <td style={{ padding: '10px 4px', fontWeight: 500 }}>Google Chrome Manifest V3 (WXT + Vite)</td>
            </tr>
            <tr style={{ borderBottom: 'var(--hairline)' }}>
              <td style={{ padding: '10px 4px', color: 'var(--muted)' }}>Supported AI Providers</td>
              <td style={{ padding: '10px 4px', fontWeight: 500 }}>Google Gemini, OpenAI, Anthropic Claude</td>
            </tr>
            <tr style={{ borderBottom: 'var(--hairline)' }}>
              <td style={{ padding: '10px 4px', color: 'var(--muted)' }}>Data Storage</td>
              <td style={{ padding: '10px 4px', fontWeight: 500 }}>Local chrome.storage + IndexedDB (No cloud sync)</td>
            </tr>
            <tr style={{ borderBottom: 'var(--hairline)' }}>
              <td style={{ padding: '10px 4px', color: 'var(--muted)' }}>Design System</td>
              <td style={{ padding: '10px 4px', fontWeight: 500 }}>Editorial / Ink Aesthetic with CSS Variables & Tokens</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 4px', color: 'var(--muted)' }}>Project Type</td>
              <td style={{ padding: '10px 4px', fontWeight: 500 }}>UDDN Capstone Research Project</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
