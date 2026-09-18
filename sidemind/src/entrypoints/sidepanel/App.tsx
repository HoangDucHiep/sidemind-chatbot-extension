import React, { useState, useEffect } from 'react';
import { useTheme } from '../../lib/theme';
import { useI18n } from '../../lib/i18n';
import { Seg } from '../../components/ui/Seg';
import { IconButton } from '../../components/ui/IconButton';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [activeTabTitle, setActiveTabTitle] = useState<string>('Current Webpage');
  const [activeTabUrl, setActiveTabUrl] = useState<string>('');
  const [inputVal, setInputVal] = useState<string>('');

  // Fetch current active tab info
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab) {
          setActiveTabTitle(tab.title || 'Untitled Page');
          setActiveTabUrl(tab.url || '');
        }
      });
    }
  }, []);

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      alert('Options page (will open settings in Phase 3)');
    }
  };

  return (
    <div className="panel">
      {/* Header */}
      <header className="panel-header">
        <div className="row gap-2" style={{ flexShrink: 0 }}>
          <span className="font-heading" style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Side<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Mind</span>
          </span>
        </div>

        <div className="row gap-1" style={{ flexShrink: 0 }}>
          <Seg<'en' | 'vi'>
            options={[
              { value: 'en', label: 'EN' },
              { value: 'vi', label: 'VI' },
            ]}
            value={lang}
            onChange={setLang}
            ariaLabel="Language"
          />

          {/* Theme Toggle Button (Sun / Moon) */}
          <IconButton
            title={theme === 'dark' ? t('global.theme.light') : t('global.theme.dark')}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              // Sun icon for switching to light
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              // Moon icon for switching to dark
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </IconButton>

          {/* Settings Button */}
          <IconButton title={t('sidepanel.action.settings')} onClick={openOptions}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </IconButton>
        </div>
      </header>

      {/* Context bar */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: 'var(--hairline)',
          background: 'var(--paper)',
          fontSize: 'var(--fs-xs)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span className="text-eyebrow" style={{ flexShrink: 0 }}>
            {t('sidepanel.context.label')}:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '220px',
            }}
            title={activeTabUrl}
          >
            {activeTabTitle}
          </span>
        </div>
        <span className="badge badge-muted" style={{ fontSize: '10px' }}>
          PAGE
        </span>
      </div>

      {/* Message stream / Empty State */}
      <div className="panel-body">
        <div
          style={{
            margin: 'auto 0',
            textAlign: 'center',
            padding: '24px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '28px',
              fontStyle: 'italic',
              color: 'var(--ink)',
            }}
          >
            SideMind
          </div>
          <h2 className="text-headline" style={{ fontSize: '18px' }}>
            {t('sidepanel.empty.hero')}
          </h2>
          <p className="text-sm text-muted" style={{ maxWidth: '280px' }}>
            {t('sidepanel.empty.sub')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
            {['/summary', '/explain', '/translate', '/tldr'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                className="chip"
                style={{ cursor: 'pointer' }}
                onClick={() => setInputVal(cmd + ' ')}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat input footer */}
      <footer className="panel-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            className="input"
            rows={2}
            style={{ resize: 'none', paddingRight: '40px' }}
            placeholder={t('sidepanel.input.placeholder')}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputVal.trim()) {
                  alert(`Message sent: "${inputVal}" (AI connection will be wired in Phase 2)`);
                  setInputVal('');
                }
              }
            }}
          />
          <button
            type="button"
            className="btn btn-filled"
            style={{
              position: 'absolute',
              right: '6px',
              bottom: '6px',
              padding: '4px 8px',
              fontSize: '12px',
            }}
            onClick={() => {
              if (inputVal.trim()) {
                alert(`Message sent: "${inputVal}" (AI connection will be wired in Phase 2)`);
                setInputVal('');
              }
            }}
          >
            ↗
          </button>
        </div>

        <div className="row between" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{t('sidepanel.input.slashHint')}</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Ctrl+Shift+Y</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
