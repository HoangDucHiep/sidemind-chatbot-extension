// SideMind · WXT config
// Docs: https://wxt.dev/api/config.html
// Tuân thủ `.cursor/rules/chrome-mv3-rules.mdc`:
//   - Manifest V3
//   - CSP nghiêm ngặt
//   - Permissions tối thiểu (justify từng cái theo SRS Phụ lục B)

import { defineConfig } from 'wxt';

export default defineConfig({
  // srcDir tùy biến — mặc định của WXT là ./, ta dùng ./src
  srcDir: './src',

  // Output
  outDir: '../dist',
  // Không output ra root project để tránh conflict với docs/

  // Manifest V3
  manifest: {
    name: 'SideMind',
    description: 'AI chat sidebar with context awareness',
    version: '0.1.0',
    // Permissions — xem chrome-mv3-rules.mdc §3
    permissions: [
      'sidePanel',      // FR-01 — side panel API
      'storage',        // FR-02 / FR-08 — chrome.storage.local cho settings + history
      'activeTab',      // FR-01 — truy cập tab hiện tại khi user click FAB
      'scripting',      // FR-01 — inject content script khi cần
      'contextMenus',   // FR-07 — quick actions right-click
      'tabs',           // FR-11 — multi-tab context
      'commands',       // FR-10 — keyboard shortcuts
    ],
    // host_permissions — chỉ những API endpoint cần thiết + YouTube (FR-04)
    host_permissions: [
      'https://api.openai.com/*',
      'https://api.anthropic.com/*',
      'https://generativelanguage.googleapis.com/*',
      'https://www.youtube.com/*',
    ],
    // CSP — extension_pages nghiêm ngặt, không unsafe-inline/eval
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    // Action — icon cho toolbar (click mở side panel)
    action: {
      default_title: 'Open SideMind',
    },
    // Side panel — default path là sidepanel entrypoint
    side_panel: {
      default_path: 'sidepanel.html',
    },
    // Background service worker
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    // Commands — keyboard shortcuts (FR-10). User customize sau.
    commands: {
      'toggle-side-panel': {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y',
        },
        description: 'Toggle SideMind side panel',
      },
      'focus-input': {
        suggested_key: {
          default: 'Ctrl+Shift+L',
          mac: 'Command+Shift+L',
        },
        description: 'Focus chat input',
      },
      'new-chat': {
        suggested_key: {
          default: 'Ctrl+Shift+N',
          mac: 'Command+Shift+N',
        },
        description: 'Start a new chat',
      },
      'copy-last': {
        suggested_key: {
          default: 'Ctrl+Shift+C',
          mac: 'Command+Shift+C',
        },
        description: 'Copy last AI answer',
      },
    },
  },

  // Vite config — alias @/* → src/*
  vite: () => ({
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }),

  // Modules — modules được import trong entrypoints
  modules: ['@wxt-dev/module-react'],
});
