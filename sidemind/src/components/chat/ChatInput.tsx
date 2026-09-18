// SideMind · Chat Input Component

import React, { useState, useRef, useEffect } from 'react';
import { SlashMenu } from './SlashMenu';
import { useChatStore } from '../../store/useChat';
import { useI18n } from '../../lib/i18n';
import { SLASH_COMMANDS } from '../../lib/context/prompts';

export const ChatInput: React.FC = () => {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming, sendMessage, stopStreaming } = useChatStore();

  useEffect(() => {
    setShowSlashMenu(text.startsWith('/'));
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    // Check if user entered a slash command exactly
    if (SLASH_COMMANDS[trimmed]) {
      sendMessage(SLASH_COMMANDS[trimmed].prompt);
    } else {
      sendMessage(trimmed);
    }

    setText('');
    setShowSlashMenu(false);
  };

  const handleSlashSelect = (command: string) => {
    const cmd = SLASH_COMMANDS[command];
    if (cmd) {
      sendMessage(cmd.prompt);
      setText('');
      setShowSlashMenu(false);
    } else {
      setText(command + ' ');
      setShowSlashMenu(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showSlashMenu && (
        <SlashMenu
          filter={text}
          onSelect={handleSlashSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className="input"
          rows={2}
          style={{
            resize: 'none',
            paddingRight: '48px',
            fontSize: '13px',
            lineHeight: 1.4,
          }}
          placeholder={t('sidepanel.input.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {isStreaming ? (
          <button
            type="button"
            className="btn btn-accent"
            style={{
              position: 'absolute',
              right: '6px',
              bottom: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
            }}
            onClick={stopStreaming}
            title="Stop streaming"
          >
            ⏹ Stop
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-filled"
            style={{
              position: 'absolute',
              right: '6px',
              bottom: '6px',
              padding: '4px 8px',
              fontSize: '13px',
            }}
            onClick={handleSend}
            disabled={!text.trim()}
            title="Send message (Enter)"
          >
            ↗
          </button>
        )}
      </div>

      <div
        className="row between"
        style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', padding: '0 2px' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)' }}>{t('sidepanel.input.slashHint')}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>Ctrl+Shift+Y</span>
      </div>
    </div>
  );
};
