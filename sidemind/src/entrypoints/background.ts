export default defineBackground(() => {
  console.log('[SideMind] Background service worker initialized.');

  // Open side panel on action toolbar button click
  chrome.sidePanel
    ?.setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch((err) => console.warn('[SideMind] Failed to set side panel behavior:', err));

  // Listen for runtime messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_SIDE_PANEL') {
      if (sender.tab?.windowId) {
        chrome.sidePanel
          .open({ windowId: sender.tab.windowId })
          .then(() => sendResponse({ success: true }))
          .catch((err) => {
            console.error('[SideMind] Error opening side panel:', err);
            sendResponse({ success: false, error: String(err) });
          });
        return true; // Keep channel open for async response
      }
      sendResponse({ success: false, error: 'No tab windowId' });
      return false;
    }

    if (message.type === 'PING') {
      sendResponse({ status: 'PONG', timestamp: Date.now() });
      return false;
    }

    return false;
  });

  // Handle keyboard shortcuts
  chrome.commands?.onCommand?.addListener(async (command) => {
    console.log('[SideMind] Received command:', command);
    if (command === 'toggle-side-panel') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
      }
    }
  });
});
