// SideMind · Slash Command Menu Component

import React, { useEffect, useState } from 'react';
import { SLASH_COMMANDS } from '../../lib/context/prompts';
import { useI18n } from '../../lib/i18n';

interface SlashMenuProps {
  filter: string;
  onSelect: (command: string) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ filter, onSelect, onClose }) => {
  const { lang } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const cleanFilter = filter.toLowerCase().trim();
  const matchingKeys = Object.keys(SLASH_COMMANDS).filter((key) =>
    key.toLowerCase().includes(cleanFilter)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  // Auto-scroll selected item into view
  useEffect(() => {
    const activeEl = itemRefs.current[selectedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchingKeys.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % matchingKeys.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + matchingKeys.length) % matchingKeys.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(matchingKeys[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [matchingKeys, selectedIndex, onSelect, onClose]);

  if (matchingKeys.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        marginBottom: '6px',
        background: 'var(--paper)',
        border: 'var(--hairline-strong)',
        boxShadow: '0 -4px 12px rgba(var(--shadow-rgb), 0.12)',
        maxHeight: '220px',
        overflowY: 'auto',
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '6px 10px',
          borderBottom: 'var(--hairline)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Slash Commands
      </div>

      {matchingKeys.map((key, idx) => {
        const item = SLASH_COMMANDS[key];
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={key}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: isSelected ? 'var(--ink)' : 'transparent',
              color: isSelected ? 'var(--paper)' : 'var(--ink)',
              borderBottom: 'var(--hairline)',
              transition: 'background var(--motion-fast)',
            }}
            onClick={() => onSelect(key)}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '13px',
                color: isSelected ? 'var(--paper)' : 'var(--accent)',
              }}
            >
              {key}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: isSelected ? 'var(--paper)' : 'var(--muted)',
                marginLeft: '12px',
              }}
            >
              {lang === 'vi' ? item.descVi : item.descEn}
            </span>
          </div>
        );
      })}
    </div>
  );
};
