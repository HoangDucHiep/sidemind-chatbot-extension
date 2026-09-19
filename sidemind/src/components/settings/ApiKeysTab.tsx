// SideMind · API Keys Tab

import React from 'react';
import { ApiKeyRow } from './ApiKeyRow';
import { useI18n } from '../../lib/i18n';

export const ApiKeysTab: React.FC = () => {
  const { t } = useI18n();

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 className="text-headline" style={{ fontSize: '18px', marginBottom: '4px' }}>
          {t('keys.tab.title')}
        </h3>
        <p className="text-sm text-muted">{t('keys.tab.subtitle')}</p>
      </div>

      {/* Security Callout Box */}
      <div
        style={{
          padding: '12px 16px',
          borderLeft: '3px solid var(--accent)',
          background: 'var(--accent-soft)',
          color: 'var(--ink)',
          marginBottom: '20px',
          fontSize: '13px',
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '2px' }}>
          🛡️ {t('keys.callout.title')}
        </div>
        <div>{t('keys.callout.body')}</div>
      </div>

      <ApiKeyRow
        provider="gemini"
        title="Google Gemini"
        placeholder="AIzaSy..."
        docUrl="https://aistudio.google.com/app/apikey"
      />

      <ApiKeyRow
        provider="openai"
        title="OpenAI"
        placeholder="sk-..."
        docUrl="https://platform.openai.com/api-keys"
      />

      <ApiKeyRow
        provider="anthropic"
        title="Anthropic Claude"
        placeholder="sk-ant-..."
        docUrl="https://console.anthropic.com/settings/keys"
      />
    </div>
  );
};
