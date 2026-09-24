// SideMind · Chat Input Component (with File & Image Attachment - FR-12)

import React, { useState, useRef, useEffect } from "react";
import { SlashMenu } from "./SlashMenu";
import { useChatStore } from "../../store/useChat";
import { useI18n } from "../../lib/i18n";
import { SLASH_COMMANDS } from "../../lib/context/prompts";
import { processFile, type FileAttachment } from "../../lib/file-extractor";

export const ChatInput: React.FC = () => {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isStreaming, sendMessage, stopStreaming } = useChatStore();

  useEffect(() => {
    setShowSlashMenu(text.startsWith("/"));
  }, [text]);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFile(true);
    try {
      const processed: FileAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const item = await processFile(files[i]);
        processed.push(item);
      }
      setAttachments((prev) => [...prev, ...processed]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || isStreaming) return;

    // Check if user entered a slash command exactly
    if (SLASH_COMMANDS[trimmed]) {
      sendMessage(SLASH_COMMANDS[trimmed].prompt, attachments);
    } else {
      sendMessage(trimmed, attachments);
    }

    setText("");
    setAttachments([]);
    setShowSlashMenu(false);
  };

  const handleSlashSelect = (command: string) => {
    if (command === "/attach") {
      fileInputRef.current?.click();
      setText("");
      setShowSlashMenu(false);
      return;
    }

    const cmd = SLASH_COMMANDS[command];
    if (cmd) {
      sendMessage(cmd.prompt, attachments);
      setText("");
      setAttachments([]);
      setShowSlashMenu(false);
    } else {
      setText(command + " ");
      setShowSlashMenu(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
          handleFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,.pdf,.txt,.md,.csv,.json,.log,.docx,.xlsx,.pptx,.js,.ts,.py,.java,.cpp,.go,.rs,.html,.css"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      {/* Slash Autocomplete Menu */}
      {showSlashMenu && (
        <SlashMenu
          filter={text}
          onSelect={handleSlashSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Attachment Preview Strip */}
      {attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            padding: "6px 8px",
            background: "var(--accent-soft)",
            border: "var(--hairline)",
            borderBottom: "none",
          }}
        >
          {attachments.map((att) => (
            <div
              key={att.id}
              className="chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                background: "var(--paper)",
                padding: "2px 6px",
              }}
            >
              {att.isImage && att.base64 ? (
                <img
                  src={att.base64}
                  alt={att.name}
                  style={{ width: "18px", height: "18px", objectFit: "cover" }}
                />
              ) : (
                <span>📄</span>
              )}
              <span
                style={{
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={att.name}
              >
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: "11px",
                  padding: "0 2px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Textarea Input Box */}
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          className="input"
          rows={2}
          style={{
            resize: "none",
            paddingRight: "76px",
            paddingLeft: "32px",
            fontSize: "13px",
            lineHeight: 1.4,
            borderColor: isDragging ? "var(--accent)" : undefined,
          }}
          placeholder={
            isProcessingFile
              ? "Extracting file content…"
              : isDragging
                ? "Drop files here to attach"
                : t("sidepanel.input.placeholder")
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !showSlashMenu) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* Attach File Button (Paperclip) */}
        <button
          type="button"
          className="icon-btn"
          style={{
            position: "absolute",
            left: "4px",
            bottom: "6px",
            width: "24px",
            height: "24px",
            color: "var(--muted)",
          }}
          onClick={() => fileInputRef.current?.click()}
          title="Attach files (Images, PDFs, Docs, Code)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: "15px", height: "15px" }}
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Send / Stop Streaming Button */}
        {isStreaming ? (
          <button
            type="button"
            className="btn btn-accent"
            style={{
              position: "absolute",
              right: "6px",
              bottom: "6px",
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
            }}
            onClick={stopStreaming}
            title="Stop streaming"
          >
            ⏹ Stop
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-filled"
            style={{
              position: "absolute",
              right: "6px",
              bottom: "6px",
              padding: "4px 8px",
              fontSize: "13px",
            }}
            onClick={handleSend}
            disabled={!text.trim() && attachments.length === 0}
            title="Send message (Enter)"
          >
            ↗
          </button>
        )}
      </div>

      {/* Keyboard shortcut hint footer */}
      <div
        className="row between"
        style={{
          fontSize: "11px",
          color: "var(--muted)",
          marginTop: "4px",
          padding: "0 2px",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {t("sidepanel.input.slashHint")}
        </span>
        <span style={{ fontFamily: "var(--font-mono)" }}>Ctrl+Shift+Y</span>
      </div>
    </div>
  );
};
