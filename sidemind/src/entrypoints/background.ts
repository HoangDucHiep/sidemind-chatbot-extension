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

  // Create Context Menus on install (FR-07)
  chrome.runtime.onInstalled?.addListener(() => {
    if (typeof chrome !== 'undefined' && chrome.contextMenus) {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: 'sidemind-summarize',
          title: 'SideMind: Summarize page',
          contexts: ['page'],
        });

        chrome.contextMenus.create({
          id: 'sidemind-explain',
          title: 'SideMind: Explain "%s"',
          contexts: ['selection'],
        });

        chrome.contextMenus.create({
          id: 'sidemind-translate',
          title: 'SideMind: Translate "%s"',
          contexts: ['selection'],
        });

        chrome.contextMenus.create({
          id: 'sidemind-code',
          title: 'SideMind: Explain code in selection',
          contexts: ['selection'],
        });
      });
    }
  });

  // Handle Context Menu clicks (FR-07)
  chrome.contextMenus?.onClicked?.addListener(async (info, tab) => {
    if (!tab?.id) return;

    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);

    // Wait a brief tick for side panel to be ready then dispatch quick action
    setTimeout(() => {
      let prompt = '';
      if (info.menuItemId === 'sidemind-summarize') {
        prompt = 'Summarize the main content of this page into 5 concise bullet points.';
      } else if (info.menuItemId === 'sidemind-explain' && info.selectionText) {
        prompt = `Explain the following text in simple terms:\n"${info.selectionText}"`;
      } else if (info.menuItemId === 'sidemind-translate' && info.selectionText) {
        prompt = `Translate the following text into Vietnamese (or English if Vietnamese):\n"${info.selectionText}"`;
      } else if (info.menuItemId === 'sidemind-code' && info.selectionText) {
        prompt = `Explain this code snippet and how it works:\n\`\`\`\n${info.selectionText}\n\`\`\``;
      }

      if (prompt) {
        chrome.runtime.sendMessage({ type: 'EXECUTE_PROMPT', prompt }).catch(() => {});
      }
    }, 400);
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

  // Handle keyboard shortcuts (FR-10)
  chrome.commands?.onCommand?.addListener(async (command) => {
    console.log('[SideMind] Received command:', command);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (command === 'toggle-side-panel' && tab?.windowId) {
      chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
    } else if (command === 'focus-input') {
      chrome.runtime.sendMessage({ type: 'COMMAND_FOCUS_INPUT' }).catch(() => {});
    } else if (command === 'new-chat') {
      chrome.runtime.sendMessage({ type: 'COMMAND_NEW_CHAT' }).catch(() => {});
    } else if (command === 'copy-last') {
      chrome.runtime.sendMessage({ type: 'COMMAND_COPY_LAST' }).catch(() => {});
    }
  });
});
