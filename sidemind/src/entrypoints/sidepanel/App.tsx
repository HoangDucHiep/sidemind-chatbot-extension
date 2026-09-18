// SideMind · Main Side Panel Application

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../lib/theme';
import { useI18n } from '../../lib/i18n';
import { Seg } from '../../components/ui/Seg';
import { IconButton } from '../../components/ui/IconButton';
import { ChatInput } from '../../components/chat/ChatInput';
import { MessageItem } from '../../components/chat/MessageItem';
import { useChatStore } from '../../store/useChat';
import { useContextStore } from '../../store/useContext';
import { type AiProvider } from '../../lib/ai';
import { SLASH_COMMANDS } from '../../lib/context/prompts';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const {
    messages,
    isStreaming,
    activeProvider,
    setProvider,
    sendMessage,
    clearChat,
  } = useChatStore();

  const {
    title: pageTitle,
    url: pageUrl,
    context,
    isLoading: isContextLoading,
    refreshContext,
  } = useContextStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-fetch context on mount
  useEffect(() => {
    refreshContext();

    // Listen to tab changes
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const handleTabActivated = () => refreshContext();
      const handleTabUpdated = (_tabId: number, changeInfo: { status?: string }) => {
        if (changeInfo.status === 'complete') refreshContext();
      };

      chrome.tabs.onActivated?.addListener(handleTabActivated);
      chrome.tabs.onUpdated?.addListener(handleTabUpdated);

      return () => {
        chrome.tabs.onActivated?.removeListener(handleTabActivated);
        chrome.tabs.onUpdated?.removeListener(handleTabUpdated);
      };
    }
    return undefined;
  }, [refreshContext]);

  // Scroll to bottom on new messages or stream chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      alert('Options page (Configure API keys in Phase 3)');
    }
  };

  const pageTypeBadge = context?.pageType ? context.pageType.toUpperCase() : 'PAGE';

  return (
    <div className="panel">
      {/* Header */}
      <header className="panel-header">
        <div className="row gap-2" style={{ flexShrink: 0 }}>
          <span className="font-heading" style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Side<span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Mind</span>
          </span>

          {/* Provider Selector */}
          <select
            value={activeProvider}
            onChange={(e) => setProvider(e.target.value as AiProvider)}
            style={{
              padding: '2px 4px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--paper)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: 0,
              cursor: 'pointer',
              outline: 'none',
            }}
            title="Choose AI Provider"
          >
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Claude</option>
          </select>
        </div>

        <div className="row gap-1" style={{ flexShrink: 0 }}>
          {/* New Chat Button */}
          {messages.length > 0 && (
            <IconButton title={t('sidepanel.action.newChat')} onClick={clearChat}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </IconButton>
          )}

          {/* Language Seg */}
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
          padding: '6px 12px',
          borderBottom: 'var(--hairline)',
          background: 'var(--paper)',
          fontSize: 'var(--fs-xs)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexShrink: 0,
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
              maxWidth: '180px',
            }}
            title={pageUrl}
          >
            {isContextLoading ? 'Extracting page…' : pageTitle}
          </span>
        </div>

        <div className="row gap-1" style={{ flexShrink: 0 }}>
          <span className="badge badge-muted" style={{ fontSize: '9px', padding: '1px 4px' }}>
            {pageTypeBadge}
          </span>
          <IconButton
            title={t('sidepanel.context.refresh')}
            onClick={() => refreshContext()}
            style={{ width: '22px', height: '22px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}>
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Message stream / Empty State Body */}
      <div className="panel-body">
        {messages.length === 0 ? (
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
              {(['/summary', '/explain', '/translate', '/tldr'] as const).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  className="chip"
                  style={{ cursor: 'pointer' }}
                  onClick={() => sendMessage(SLASH_COMMANDS[cmd].prompt)}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="stack gap-3">
            {messages.map((msg, idx) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input footer */}
      <footer className="panel-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <ChatInput />
      </footer>
    </div>
  );
};

export default App;
