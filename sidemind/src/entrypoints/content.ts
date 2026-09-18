export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  main() {
    // Only inject in top-level window (not iframes)
    if (window.self !== window.top) return;

    // Check if host element already exists
    if (document.getElementById('sidemind-fab-host')) return;

    const host = document.createElement('div');
    host.id = 'sidemind-fab-host';
    host.style.position = 'fixed';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Styles for FAB in Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
      }
      .sidemind-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 44px;
        height: 44px;
        border: 2px solid #1a1a1a;
        background: #f5f1e8;
        color: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Newsreader', Cambria, Georgia, serif;
        font-weight: 700;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 3px 3px 0 #1a1a1a;
        transition: transform 120ms cubic-bezier(0.2, 0, 0, 1), box-shadow 120ms cubic-bezier(0.2, 0, 0, 1), border-color 120ms cubic-bezier(0.2, 0, 0, 1);
        user-select: none;
        pointer-events: auto;
        border-radius: 0;
        box-sizing: border-box;
      }
      .sidemind-fab:hover {
        transform: translate(-2px, -2px);
        box-shadow: 5px 5px 0 #c8392f;
        border-color: #c8392f;
      }
      .sidemind-fab.dragging {
        cursor: grabbing;
        box-shadow: 5px 5px 0 #c8392f;
        transition: none;
      }
      .sidemind-fab-mark {
        font-style: italic;
        color: #c8392f;
      }
    `;
    shadow.appendChild(style);

    const fab = document.createElement('button');
    fab.className = 'sidemind-fab';
    fab.setAttribute('title', 'SideMind (Ctrl+Shift+Y)');
    fab.setAttribute('aria-label', 'Open SideMind Sidebar');
    fab.innerHTML = 'S<span class="sidemind-fab-mark">M</span>';
    shadow.appendChild(fab);

    // Restore saved position if any
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get('sidemind_fab_position', (res) => {
          if (res.sidemind_fab_position) {
            const { x, y } = res.sidemind_fab_position;
            fab.style.left = `${Math.min(Math.max(10, x), window.innerWidth - 54)}px`;
            fab.style.top = `${Math.min(Math.max(10, y), window.innerHeight - 54)}px`;
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
          }
        });
      }
    } catch {
      // Ignore storage errors on restricted pages
    }

    // Drag and Drop logic
    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = fab.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      fab.classList.add('dragging');
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }

      const newLeft = Math.min(Math.max(10, initialLeft + dx), window.innerWidth - 54);
      const newTop = Math.min(Math.max(10, initialTop + dy), window.innerHeight - 54);

      fab.style.left = `${newLeft}px`;
      fab.style.top = `${newTop}px`;
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      fab.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (hasMoved) {
        const rect = fab.getBoundingClientRect();
        try {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({
              sidemind_fab_position: { x: rect.left, y: rect.top },
            });
          }
        } catch {
          // Ignore
        }
      }
    };

    fab.addEventListener('mousedown', onMouseDown);

    // Click handler (only if not dragged)
    fab.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Send message to open side panel
      try {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      } catch (err) {
        console.warn('[SideMind] Error sending OPEN_SIDE_PANEL message:', err);
      }
    });
  },
});
