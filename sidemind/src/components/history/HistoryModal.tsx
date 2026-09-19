// SideMind · History Modal Component

import React, { useState, useEffect } from 'react';
import { historyService, type ConversationMeta } from '../../lib/history';
import { useChatStore } from '../../store/useChat';
import { useI18n } from '../../lib/i18n';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [list, setList] = useState<ConversationMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadList();
    }
  }, [isOpen]);

  const loadList = async () => {
    setIsLoading(true);
    const items = await historyService.getList();
    setList(items);
    setIsLoading(false);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    const results = await historyService.search(q);
    setList(results);
  };

  const handleSelectConvo = async (id: string) => {
    const fullConvo = await historyService.getById(id);
    if (fullConvo && fullConvo.messages) {
      useChatStore.setState({
        messages: fullConvo.messages,
        activeProvider: fullConvo.provider,
        activeModel: fullConvo.model,
      });
      onClose();
    }
  };

  const handleDeleteConvo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await historyService.delete(id);
    await loadList();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--paper)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Modal Header */}
      <div
        className="row between"
        style={{
          padding: '12px 16px',
          borderBottom: 'var(--hairline)',
          background: 'var(--paper)',
        }}
      >
        <div className="row gap-2">
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{t('history.title')}</span>
          <span className="badge badge-muted" style={{ fontSize: '10px' }}>
            {list.length}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ fontSize: '16px', padding: '2px 8px' }}
        >
          ✕
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '8px 16px', borderBottom: 'var(--hairline)' }}>
        <input
          type="text"
          className="input input-mono"
          placeholder={t('history.search')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ fontSize: '12px', padding: '6px 10px' }}
        />
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        {isLoading ? (
          <div className="text-xs text-muted" style={{ padding: '24px 0', textAlign: 'center' }}>
            Loading history…
          </div>
        ) : list.length === 0 ? (
          <div className="text-xs text-muted" style={{ padding: '32px 0', textAlign: 'center' }}>
            {t('history.empty')}
          </div>
        ) : (
          <div className="stack gap-2">
            {list.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectConvo(item.id)}
                style={{
                  padding: '10px 12px',
                  border: 'var(--hairline)',
                  cursor: 'pointer',
                  background: 'var(--paper)',
                  transition: 'background var(--motion-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--paper)')}
              >
                <div className="row between" style={{ marginBottom: '4px' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '220px',
                    }}
                  >
                    {item.title}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '11px', color: 'var(--muted)', padding: '2px 4px' }}
                    onClick={(e) => handleDeleteConvo(e, item.id)}
                    title="Delete conversation"
                  >
                    🗑
                  </button>
                </div>

                <div className="row between text-xs text-muted" style={{ fontSize: '11px' }}>
                  <span>
                    {item.model} · {item.messageCount} msgs
                  </span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
