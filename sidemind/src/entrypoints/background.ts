export default defineBackground(() => {
  console.log('[SideMind] Background service worker initialized.');

  // Open side panel on action toolbar button click
  chrome.sidePanel
    ?.setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch((err) => console.warn('[SideMind] Failed to set side panel behavior:', err));

  // Fallback action click handler
  chrome.action?.onClicked?.addListener((tab) => {
    if (tab.id) {
      chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
    }
  });

  // Listen for runtime messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_SIDE_PANEL') {
      const target = sender.tab?.id
        ? { tabId: sender.tab.id }
        : sender.tab?.windowId
          ? { windowId: sender.tab.windowId }
          : null;

      if (target) {
        chrome.sidePanel
          .open(target)
          .then(() => sendResponse({ success: true }))
          .catch((err) => {
            console.error('[SideMind] Error opening side panel:', err);
            sendResponse({ success: false, error: String(err) });
          });
        return true;
      }
      sendResponse({ success: false, error: 'No tab id or windowId found' });
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
