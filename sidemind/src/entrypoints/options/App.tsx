// SideMind · Options / Settings Page (5 Tabs)

import React, { useState } from 'react';
import { useTheme } from '../../lib/theme';
import { useI18n } from '../../lib/i18n';
import { Seg } from '../../components/ui/Seg';
import { IconButton } from '../../components/ui/IconButton';
import { ApiKeysTab } from '../../components/settings/ApiKeysTab';
import { GeneralTab } from '../../components/settings/GeneralTab';
import { PrivacyTab } from '../../components/settings/PrivacyTab';
import { ShortcutsTab } from '../../components/settings/ShortcutsTab';
import { AboutTab } from '../../components/settings/AboutTab';

type SettingsTab = 'keys' | 'general' | 'privacy' | 'shortcuts' | 'about';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [activeTab, setActiveTab] = useState<SettingsTab>('keys');

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px', background: 'var(--paper)' }}>
      <main
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          background: 'var(--paper)',
          border: 'var(--hairline)',
          boxShadow: '0 12px 36px rgba(var(--shadow-rgb), 0.09)',
        }}
      >
        {/* Top Header */}
        <header
          style={{
            padding: '24px 28px',
            borderBottom: 'var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div className="row gap-2">
              <span className="font-heading" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Side<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Mind</span>
              </span>
              <span className="badge badge-accent" style={{ fontSize: '10px', padding: '2px 6px' }}>
                SETTINGS
              </span>
            </div>
            <p className="text-xs text-muted" style={{ marginTop: '4px' }}>
              Manifest V3 · Client-side Only · AES-GCM-256 Key Vault
            </p>
          </div>

          <div className="row gap-2">
            <Seg<'en' | 'vi'>
              options={[
                { value: 'en', label: 'EN' },
                { value: 'vi', label: 'VI' },
              ]}
              value={lang}
              onChange={setLang}
              ariaLabel="Language"
            />

            <IconButton
              title={theme === 'dark' ? t('global.theme.light') : t('global.theme.dark')}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </IconButton>
          </div>
        </header>

        {/* Tab Navigation Strip */}
        <nav className="tabs" style={{ padding: '0 20px' }}>
          <button
            type="button"
            className={`tab ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            <span>🔑</span> {t('settings.tab.keys')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span>⚙️</span> {t('settings.tab.general')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <span>🛡️</span> {t('settings.tab.privacy')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <span>⌨️</span> {t('settings.tab.shortcuts')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span>ℹ️</span> {t('settings.tab.about')}
          </button>
        </nav>

        {/* Tab Content Body */}
        <div style={{ padding: '28px' }}>
          {activeTab === 'keys' && <ApiKeysTab />}
          {activeTab === 'general' && <GeneralTab />}
          {activeTab === 'privacy' && <PrivacyTab />}
          {activeTab === 'shortcuts' && <ShortcutsTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>
      </main>
    </div>
  );
};

export default App;

