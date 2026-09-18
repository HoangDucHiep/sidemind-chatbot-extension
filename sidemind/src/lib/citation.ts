// SideMind · Citation & Host Page Highlight Anchor

export interface CitationMatch {
  chunkId: number;
  fullMatch: string;
}

export function parseCitations(text: string): CitationMatch[] {
  const regex = /\[(\d+)\]/g;
  const matches: CitationMatch[] = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    const chunkId = parseInt(m[1], 10);
    if (!isNaN(chunkId)) {
      matches.push({ chunkId, fullMatch: m[0] });
    }
  }

  return matches;
}

export async function highlightOnPage(tabId: number, chunkId: number, targetText?: string): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.tabs) return;

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'HIGHLIGHT_TEXT',
      chunkId,
      text: targetText,
    });
  } catch (err) {
    console.warn('[SideMind] Failed to send highlight message to tab:', err);
  }
}
