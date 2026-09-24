// SideMind · Multi-Tab Selector Modal (FR-11)

import React, { useState, useEffect } from "react";
import { useMultiTabStore } from "../../store/useMultiTab";
import { useContextStore } from "../../store/useContext";
import { useI18n } from "../../lib/i18n";

interface MultiTabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiTabModal: React.FC<MultiTabModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const [openTabs, setOpenTabs] = useState<chrome.tabs.Tab[]>([]);
  const { sources, addTab, removeTab } = useMultiTabStore();
  const currentTabId = useContextStore((state) => state.tabId);

  useEffect(() => {
    if (isOpen && typeof chrome !== "undefined" && chrome.tabs?.query) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        // Filter out side panel or internal chrome pages
        const valid = tabs.filter(
          (tab) =>
            tab.id &&
            tab.id !== currentTabId &&
            !tab.url?.startsWith("chrome://") &&
            !tab.url?.startsWith("chrome-extension://"),
        );
        setOpenTabs(valid);
      });
    }
  }, [isOpen, currentTabId]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--paper)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        className="row between"
        style={{
          padding: "12px 16px",
          borderBottom: "var(--hairline)",
          background: "var(--paper)",
        }}
      >
        <div className="row gap-2">
          <span style={{ fontWeight: 600, fontSize: "15px" }}>
            {t("sidepanel.context.sources")}
          </span>
          <span className="badge badge-accent" style={{ fontSize: "10px" }}>
            MULTI-TAB
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ fontSize: "16px", padding: "2px 8px" }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "8px 16px", borderBottom: "var(--hairline)" }}>
        <p className="text-xs text-muted">
          Select open browser tabs to include their content as active context
          for SideMind AI.
        </p>
      </div>

      {/* Tab list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {openTabs.length === 0 ? (
          <div
            className="text-xs text-muted"
            style={{ textAlign: "center", padding: "32px 0" }}
          >
            No other open tabs found in this window.
          </div>
        ) : (
          <div className="stack gap-2">
            {openTabs.map((tab) => {
              const isSelected = sources.some((s) => s.tabId === tab.id);
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    if (isSelected) {
                      if (tab.id) removeTab(tab.id);
                    } else {
                      addTab(tab);
                    }
                  }}
                  style={{
                    padding: "10px 12px",
                    border: "var(--hairline)",
                    background: isSelected
                      ? "var(--accent-soft)"
                      : "var(--paper)",
                    borderColor: isSelected ? "var(--accent)" : "var(--rule)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    transition: "background var(--motion-fast)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {tab.favIconUrl ? (
                      <img
                        src={tab.favIconUrl}
                        alt=""
                        style={{ width: "16px", height: "16px", flexShrink: 0 }}
                        onError={(e) =>
                          ((e.target as HTMLElement).style.display = "none")
                        }
                      />
                    ) : (
                      <span style={{ fontSize: "14px", flexShrink: 0 }}>
                        🌐
                      </span>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: "13px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tab.title}
                      </span>
                      <span
                        className="text-xs text-muted"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "11px",
                        }}
                      >
                        {tab.url}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by div click
                    style={{ cursor: "pointer", flexShrink: 0 }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "var(--hairline)",
          background: "var(--paper)",
        }}
      >
        <button
          type="button"
          className="btn btn-filled"
          style={{ width: "100%" }}
          onClick={onClose}
        >
          Done ({sources.length} tabs selected)
        </button>
      </div>
    </div>
  );
};
