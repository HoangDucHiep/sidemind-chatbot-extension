// SideMind · Keyboard Shortcuts & Slash Commands Tab

import React from 'react';
import { useI18n } from '../../lib/i18n';
import { SLASH_COMMANDS } from '../../lib/context/prompts';

interface ShortcutDef {
  action: string;
  defaultKey: string;
  macKey: string;
  description: string;
}

const SHORTCUTS: ShortcutDef[] = [
  {
    action: 'Toggle Side Panel',
    defaultKey: 'Ctrl+Shift+Y',
    macKey: 'Cmd+Shift+Y',
    description: 'Opens or closes the SideMind chat sidebar on the active tab.',
  },
  {
    action: 'Focus Chat Input',
    defaultKey: 'Ctrl+Shift+L',
    macKey: 'Cmd+Shift+L',
    description: 'Instantly focuses the message textarea in the sidebar.',
  },
  {
    action: 'New Conversation',
    defaultKey: 'Ctrl+Shift+N',
    macKey: 'Cmd+Shift+N',
    description: 'Clears the current chat session and starts a fresh conversation.',
  },
  {
    action: 'Copy Last Response',
    defaultKey: 'Ctrl+Shift+C',
    macKey: 'Cmd+Shift+C',
    description: 'Copies the last generated AI response text to clipboard.',
  },
];

export const ShortcutsTab: React.FC = () => {
  const { t } = useI18n();
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const openChromeShortcuts = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    } else {
      window.open('chrome://extensions/shortcuts', '_blank');
    }
  };

  const renderKeycap = (combo: string) => {
    const keys = combo.split('+');
    return (
      <div className="row gap-1">
        {keys.map((k) => (
          <span key={k} className="keycap">
            {k}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="stack gap-6">
      {/* Chrome Level Hotkeys */}
      <div className="card">
        <div className="row between" style={{ marginBottom: '12px' }}>
          <div>
            <h4 className="card-title">{t('settings.shortcuts.title')}</h4>
            <p className="text-xs text-muted" style={{ marginTop: '2px' }}>
              {t('settings.shortcuts.subtitle')}
            </p>
          </div>
          <button type="button" className="btn btn-sm" onClick={openChromeShortcuts}>
            {t('settings.shortcuts.customize')}
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--hairline)', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                Action
              </th>
              <th style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                Shortcut
              </th>
              <th style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS.map((item) => (
              <tr key={item.action} style={{ borderBottom: 'var(--hairline)' }}>
                <td style={{ padding: '12px 4px', fontWeight: 500 }}>{item.action}</td>
                <td style={{ padding: '12px 4px' }}>
                  {renderKeycap(isMac ? item.macKey : item.defaultKey)}
                </td>
                <td style={{ padding: '12px 4px', color: 'var(--muted)', fontSize: '12px' }}>
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slash Commands Cheat Sheet */}
      <div className="card">
        <h4 className="card-title">{t('settings.shortcuts.slashTitle')}</h4>
        <p className="text-xs text-muted" style={{ marginTop: '2px', marginBottom: '12px' }}>
          Type slash <code>/</code> into the chat input anytime to instantly execute these tasks.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {Object.entries(SLASH_COMMANDS).map(([cmd, item]) => (
            <div
              key={cmd}
              style={{
                padding: '12px 14px',
                border: 'var(--hairline)',
                background: 'var(--paper)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div className="row gap-2">
                <span className="chip chip-filled" style={{ fontSize: '11px', fontWeight: 600 }}>
                  {cmd}
                </span>
              </div>
              <span className="text-xs text-muted" style={{ lineHeight: 1.4 }}>
                {t(`slash.${cmd.replace('/', '')}.desc`, item.descEn)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

