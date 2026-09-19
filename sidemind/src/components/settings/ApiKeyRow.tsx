// SideMind · API Key Row Component

import React, { useState, useEffect } from 'react';
import { type AiProvider } from '../../lib/ai/types';
import { getDecryptedApiKey, saveApiKey } from '../../lib/crypto';
import { verifyApiKey } from '../../lib/keys/test';
import { useI18n } from '../../lib/i18n';

interface ApiKeyRowProps {
  provider: AiProvider;
  title: string;
  placeholder: string;
  docUrl: string;
}

type KeyStatus = 'not_set' | 'testing' | 'valid' | 'invalid';

export const ApiKeyRow: React.FC<ApiKeyRowProps> = ({
  provider,
  title,
  placeholder,
  docUrl,
}) => {
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<KeyStatus>('not_set');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isFocused, setIsFocused] = useState(false);

  const maskApiKey = (key: string): string => {
    if (!key) return '';
    if (key.length <= 4) return '••••';
    const last3 = key.slice(-3);
    return '••••••••••••••••...' + last3;
  };

  useEffect(() => {
    getDecryptedApiKey(provider).then((key) => {
      if (key) {
        setApiKey(key);
        setSavedKey(key);
        setStatus('valid');
      } else {
        setStatus('not_set');
      }
    });
  }, [provider]);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setStatus('not_set');
      return;
    }
    setStatus('testing');
    setStatusMessage('');

    const res = await verifyApiKey(provider, apiKey);
    if (res.valid) {
      setStatus('valid');
      setStatusMessage('API Key is valid and active.');
    } else {
      setStatus('invalid');
      setStatusMessage(res.error || 'Key verification failed.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveApiKey(provider, apiKey);
    setSavedKey(apiKey);
    setIsSaving(false);

    if (apiKey.trim()) {
      handleTest();
    } else {
      setStatus('not_set');
      setStatusMessage('');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Remove API key for ${title}?`)) {
      setApiKey('');
      setSavedKey('');
      await saveApiKey(provider, '');
      setStatus('not_set');
      setStatusMessage('');
    }
  };

  const badgeClass =
    status === 'valid'
      ? 'badge-accent'
      : status === 'invalid'
        ? 'badge-ink'
        : status === 'testing'
          ? 'badge'
          : 'badge-muted';

  const badgeText =
    status === 'valid'
      ? t('keys.status.valid')
      : status === 'invalid'
        ? t('keys.status.invalid')
        : status === 'testing'
          ? t('keys.status.testing')
          : t('keys.status.notset');

  return (
    <div
      style={{
        padding: '16px',
        border: 'var(--hairline)',
        background: 'var(--paper)',
        marginBottom: '12px',
      }}
    >
      <div className="row between" style={{ marginBottom: '8px' }}>
        <div className="row gap-2">
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{title}</span>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '10px' }}>
            {badgeText}
          </span>
        </div>
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted"
          style={{ textDecoration: 'underline' }}
        >
          Get API Key ↗
        </a>
      </div>

      <div className="row gap-2" style={{ marginBottom: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type={showKey ? 'text' : isFocused ? 'password' : 'text'}
            className="input input-mono"
            placeholder={placeholder}
            value={showKey || isFocused ? apiKey : maskApiKey(apiKey)}
            onChange={(e) => setApiKey(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ paddingRight: '74px' }}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              fontWeight: 600,
              padding: '3px 8px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--paper)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              cursor: 'pointer',
              zIndex: 2,
              userSelect: 'none',
            }}
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? t('keys.btn.hide', 'HIDE') : t('keys.btn.show', 'SHOW')}
          </button>
        </div>

        <button type="button" className="btn btn-sm" onClick={handleTest}>
          {t('keys.btn.test')}
        </button>

        <button
          type="button"
          className="btn btn-filled btn-sm"
          onClick={handleSave}
          disabled={isSaving || apiKey === savedKey}
        >
          {isSaving ? 'Saving…' : t('keys.btn.save')}
        </button>

        {savedKey && (
          <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
            {t('keys.btn.delete')}
          </button>
        )}
      </div>

      {statusMessage && (
        <div
          style={{
            fontSize: '12px',
            color: status === 'valid' ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {status === 'valid' ? '✓ ' : '⚠ '}
          {statusMessage}
        </div>
      )}
    </div>
  );
};
