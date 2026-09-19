// SideMind · General Settings Tab

import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { useTheme, type Theme } from '../../lib/theme';
import { useI18n, type Lang } from '../../lib/i18n';
import { Seg } from '../ui/Seg';
import { AVAILABLE_MODELS, type AiProvider } from '../../lib/ai/types';

export const GeneralTab: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [provider, setProviderState] = useState<AiProvider>('gemini');
  const [model, setModelState] = useState('gemini-3.6-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    storage.get('sidemind_active_provider').then((p) => p && setProviderState(p));
    storage.get('sidemind_active_model').then((m) => m && setModelState(m));
    storage.get('sidemind_temperature').then((t) => t !== undefined && setTemperature(t));
    storage.get('sidemind_max_tokens').then((tok) => tok !== undefined && setMaxTokens(tok));
    storage.get('sidemind_font_size').then((f) => f && setFontSize(f));
  }, []);

  const triggerSaveIndicator = () => {
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleProviderChange = (p: AiProvider) => {
    setProviderState(p);
    storage.set('sidemind_active_provider', p);
    const defaultModel = AVAILABLE_MODELS[p][0].id;
    setModelState(defaultModel);
    storage.set('sidemind_active_model', defaultModel);
    triggerSaveIndicator();
  };

  const handleModelChange = (m: string) => {
    setModelState(m);
    storage.set('sidemind_active_model', m);
    triggerSaveIndicator();
  };

  const handleTemperatureChange = (val: number) => {
    setTemperature(val);
    storage.set('sidemind_temperature', val);
    triggerSaveIndicator();
  };

  const handleMaxTokensChange = (val: number) => {
    setMaxTokens(val);
    storage.set('sidemind_max_tokens', val);
    triggerSaveIndicator();
  };

  const handleFontSizeChange = (f: 'sm' | 'md' | 'lg') => {
    setFontSize(f);
    storage.set('sidemind_font_size', f);
    triggerSaveIndicator();
  };

  return (
    <div className="stack gap-6">
      {/* Theme & Language */}
      <div className="card">
        <div className="row between">
          <h4 className="card-title">{t('settings.general.appearance')}</h4>
          {saveStatus && (
            <span className="badge badge-accent" style={{ fontSize: '10px' }}>
              ✓ {t('settings.general.saved')}
            </span>
          )}
        </div>
        <div className="stack gap-3" style={{ marginTop: '8px' }}>
          <div className="row between">
            <span className="text-sm">{t('settings.general.theme')}</span>
            <Seg<Theme>
              options={[
                { value: 'light', label: t('global.theme.light') },
                { value: 'dark', label: t('global.theme.dark') },
                { value: 'auto', label: t('global.theme.auto') },
              ]}
              value={theme}
              onChange={setTheme}
            />
          </div>

          <div className="row between">
            <span className="text-sm">{t('settings.general.language')}</span>
            <Seg<Lang>
              options={[
                { value: 'en', label: 'English' },
                { value: 'vi', label: 'Tiếng Việt' },
              ]}
              value={lang}
              onChange={setLang}
            />
          </div>

          <div className="row between">
            <span className="text-sm">{t('settings.general.fontSize')}</span>
            <Seg<'sm' | 'md' | 'lg'>
              options={[
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
              ]}
              value={fontSize}
              onChange={handleFontSizeChange}
            />
          </div>
        </div>
      </div>

      {/* Model Parameters */}
      <div className="card">
        <h4 className="card-title">{t('settings.general.models')}</h4>
        <div className="stack gap-4" style={{ marginTop: '8px' }}>
          <div className="row between">
            <span className="text-sm">{t('settings.general.defaultProvider')}</span>
            <select
              className="input"
              style={{ width: '200px', padding: '4px 8px' }}
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>

          <div className="row between">
            <span className="text-sm">{t('settings.general.defaultModel')}</span>
            <select
              className="input"
              style={{ width: '240px', padding: '4px 8px' }}
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
            >
              {AVAILABLE_MODELS[provider].map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <span className="text-sm">{t('settings.general.temperature')}</span>
              <span className="text-mono" style={{ fontSize: '13px', fontWeight: 600 }}>
                {temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
            />
            <div className="row between text-xs text-muted" style={{ marginTop: '2px' }}>
              <span>Precise / Factual (0.0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative / Diverse (1.0)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="row between">
            <div>
              <div className="text-sm">{t('settings.general.maxTokens')}</div>
              <div className="text-xs text-muted">Limits output tokens per generation</div>
            </div>
            <input
              type="number"
              className="input input-mono"
              style={{ width: '110px', textAlign: 'right' }}
              min={256}
              max={8192}
              step={256}
              value={maxTokens}
              onChange={(e) => handleMaxTokensChange(parseInt(e.target.value, 10) || 2048)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
