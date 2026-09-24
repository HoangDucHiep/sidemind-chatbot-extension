// SideMind · Message Item Component (Markdown + Citations)

import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { type ChatMessage } from '../../store/useChat';
import { useContextStore } from '../../store/useContext';
import { highlightOnPage } from '../../lib/citation';

interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const { tabId, context } = useContextStore();

  // Convert markdown to HTML and inject interactive citation buttons
  const renderFormattedContent = () => {
    if (isUser) {
      return (
        <div>
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: message.content ? '8px' : '0' }}>
              {message.attachments.map((att) => (
                <div key={att.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {att.isImage && att.base64 ? (
                    <img
                      src={att.base64}
                      alt={att.name}
                      style={{
                        maxWidth: '180px',
                        maxHeight: '140px',
                        objectFit: 'cover',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    />
                  ) : (
                    <span
                      className="chip"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'inherit',
                        fontSize: '11px',
                      }}
                    >
                      📄 {att.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {message.content && <span>{message.content}</span>}
        </div>
      );
    }

    // Convert raw markdown to html
    const rawHtml = marked.parse(message.content || '') as string;

    // Transform [1], [2] citations into clickable buttons
    const withCitations = rawHtml.replace(
      /\[(\d+)\]/g,
      '<button type="button" class="citation" data-citation="$1">[$1]</button>'
    );

    // Sanitize with DOMPurify
    const cleanHtml = DOMPurify.sanitize(withCitations, {
      ADD_TAGS: ['button'],
      ADD_ATTR: ['data-citation', 'type', 'class'],
    });

    return (
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
        onClick={(e) => {
          const btn = (e.target as HTMLElement).closest('[data-citation]');
          if (btn) {
            const citeId = parseInt(btn.getAttribute('data-citation') || '', 10);
            if (!isNaN(citeId) && tabId) {
              const target = context?.sentences.find((s) => s.id === citeId);
              highlightOnPage(tabId, citeId, target?.text);
            }
          }
        }}
      />
    );
  };

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`message ${isUser ? 'user' : ''}`}>
      {!isUser && (
        <div className="message-avatar" title="SideMind AI">
          SM
        </div>
      )}

      <div className="message-bubble" style={{ position: 'relative' }}>
        {renderFormattedContent()}
        {isStreaming && <span className="caret" />}

        {!isUser && message.content && (
          <div className="message-actions" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="chip"
              style={{ fontSize: '10px', cursor: 'pointer', padding: '1px 4px' }}
              onClick={copyText}
              title="Copy message text"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="message-avatar" title="User">
          U
        </div>
      )}
    </div>
  );
};
