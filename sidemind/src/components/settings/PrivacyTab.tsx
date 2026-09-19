// SideMind · Privacy & Data Control Tab

import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../../lib/storage';
import { historyService } from '../../lib/history';
import { useI18n } from '../../lib/i18n';

export const PrivacyTab: React.FC = () => {
  const { t } = useI18n();
  const [telemetry, setTelemetry] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storage.get('sidemind_telemetry_enabled').then((val) => setTelemetry(Boolean(val)));
  }, []);

  const handleTelemetryToggle = () => {
    const nextVal = !telemetry;
    setTelemetry(nextVal);
    storage.set('sidemind_telemetry_enabled', nextVal);
  };

  const handleExportData = async () => {
    try {
      const history = await historyService.getAll();
      const provider = await storage.get('sidemind_active_provider');
      const model = await storage.get('sidemind_active_model');
      const temp = await storage.get('sidemind_temperature');
      const maxTok = await storage.get('sidemind_max_tokens');
      const lang = await storage.get('sidemind_lang');

      const backup = {
        sidemind_version: '0.3.0',
        exported_at: new Date().toISOString(),
        settings: {
          active_provider: provider,
          active_model: model,
          temperature: temp,
          max_tokens: maxTok,
          lang,
        },
        history,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sidemind_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMsg('Data exported successfully.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      setStatusMsg('Failed to export data.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.history && Array.isArray(data.history)) {
        for (const item of data.history) {
          if (item.id && item.messages) {
            await historyService.save(item);
          }
        }
      }

      if (data.settings) {
        if (data.settings.active_provider) await storage.set('sidemind_active_provider', data.settings.active_provider);
        if (data.settings.active_model) await storage.set('sidemind_active_model', data.settings.active_model);
        if (data.settings.temperature !== undefined) await storage.set('sidemind_temperature', data.settings.temperature);
        if (data.settings.max_tokens !== undefined) await storage.set('sidemind_max_tokens', data.settings.max_tokens);
      }

      setStatusMsg('Backup imported successfully. Reloading...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setStatusMsg('Invalid backup file format.');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to delete all saved conversation history? This cannot be undone.')) {
      await historyService.clearAll();
      setStatusMsg('Conversation history cleared successfully.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        'DANGER: This will delete all encrypted API keys, conversation history, and reset all settings to defaults. Proceed?'
      )
    ) {
      await storage.clear();
      setStatusMsg('All extension data and API keys have been wiped.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="stack gap-6">
      {/* Zero Telemetry & Privacy Policy */}
      <div className="card">
        <h4 className="card-title">{t('settings.privacy.title')}</h4>
        <p className="text-sm text-muted" style={{ margin: '8px 0 16px' }}>
          {t('settings.privacy.policy')}
        </p>

        <div className="row between" style={{ padding: '12px 0', borderTop: 'var(--hairline)' }}>
          <div>
            <div className="text-sm" style={{ fontWeight: 600 }}>{t('settings.privacy.telemetry')}</div>
            <div className="text-xs text-muted">{t('settings.privacy.telemetryDesc')}</div>
          </div>
          <button
            type="button"
            className="toggle"
            role="switch"
            aria-checked={telemetry}
            onClick={handleTelemetryToggle}
            aria-label="Toggle telemetry"
          />
        </div>
      </div>

      {/* Backup & Export */}
      <div className="card">
        <h4 className="card-title">{t('settings.privacy.backupTitle')}</h4>
        <p className="text-sm text-muted" style={{ margin: '8px 0 16px' }}>
          {t('settings.privacy.backupDesc')}
        </p>

        <div className="row gap-3">
          <button type="button" className="btn btn-sm" onClick={handleExportData}>
            📥 {t('settings.privacy.exportBtn')}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>
            📤 {t('settings.privacy.importBtn')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div
        style={{
          border: '2px solid var(--accent)',
          padding: '16px',
          background: 'var(--paper)',
        }}
      >
        <h4
          className="card-title"
          style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>⚠</span> {t('settings.privacy.dangerTitle')}
        </h4>
        <p className="text-sm text-muted" style={{ margin: '8px 0 16px' }}>
          Permanently erase stored data, conversation logs, or reset the extension completely.
        </p>

        <div className="row gap-3">
          <button type="button" className="btn btn-sm" onClick={handleClearHistory}>
            {t('settings.privacy.clearHistoryBtn')}
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={handleClearAllData}>
            {t('settings.privacy.wipeBtn')}
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)',
            }}
          >
            ✓ {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};

