// SideMind · Clickable Citation Reference Component

import React from 'react';
import { highlightOnPage } from '../../lib/citation';
import { useContextStore } from '../../store/useContext';

interface CitationRefProps {
  chunkId: number;
}

export const CitationRef: React.FC<CitationRefProps> = ({ chunkId }) => {
  const { tabId, context } = useContextStore();

  const handleClick = () => {
    const targetSentence = context?.sentences.find((s) => s.id === chunkId);
    if (tabId) {
      highlightOnPage(tabId, chunkId, targetSentence?.text);
    }
  };

  return (
    <button
      type="button"
      className="citation"
      title={`Citation [${chunkId}] — Click to highlight source`}
      onClick={handleClick}
    >
      [{chunkId}]
    </button>
  );
};
