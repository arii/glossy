"use client";

import React, { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import type { PdfToastState } from "../lib/use-pdf-export";

export interface PdfExportToastProps {
  toast: PdfToastState | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function PdfExportToast({ toast, onDismiss, onRetry }: PdfExportToastProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!toast) return null;

  const handleCopyDetails = async () => {
    if (!toast.errorDetails) return;
    try {
      await navigator.clipboard.writeText(toast.errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const currentStep = toast.step || 1;
  const totalSteps = toast.totalSteps || 4;
  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        maxWidth: "24rem",
        width: "calc(100vw - 3rem)",
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--rule, #e2e8f0)",
        borderRadius: "0.5rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        padding: "1rem 1.25rem",
        color: "var(--ink, #0f172a)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        {/* State Icon */}
        <div style={{ flexShrink: 0, marginTop: "0.1rem" }}>
          {toast.type === "progress" && (
            <Loader2
              className="animate-spin"
              style={{ width: "1.35rem", height: "1.35rem", color: "var(--accent, #7b3f2a)" }}
            />
          )}
          {toast.type === "success" && (
            <CheckCircle2
              style={{ width: "1.35rem", height: "1.35rem", color: "#16a34a" }}
            />
          )}
          {toast.type === "error" && (
            <AlertCircle
              style={{ width: "1.35rem", height: "1.35rem", color: "#dc2626" }}
            />
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4
              style={{
                margin: 0,
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--ink, #0f172a)",
                fontFamily: "'Charis SIL', Georgia, serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {toast.type === "progress" && `Generating PDF...`}
              {toast.type === "success" && `PDF Export Complete`}
              {toast.type === "error" && `PDF Export Failed`}
            </h4>

            <button
              type="button"
              onClick={onDismiss}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted-ink, #64748b)",
                cursor: "pointer",
                padding: "0.2rem",
                borderRadius: "0.25rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Dismiss notification"
            >
              <X style={{ width: "1rem", height: "1rem" }} />
            </button>
          </div>

          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.82rem",
              color: "var(--muted-ink, #64748b)",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {toast.title}
          </p>

          {/* Progress Stage Badge & Bar */}
          {toast.type === "progress" && (
            <div style={{ marginTop: "0.75rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--accent, #7b3f2a)",
                  marginBottom: "0.35rem",
                }}
              >
                <span>{toast.stage || "Processing..."}</span>
                <span>{percent}%</span>
              </div>
              <div
                style={{
                  height: "0.35rem",
                  width: "100%",
                  background: "#e2e8f0",
                  borderRadius: "0.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${percent}%`,
                    background: "var(--accent, #7b3f2a)",
                    borderRadius: "0.25rem",
                    transition: "width 0.3s ease-out",
                  }}
                />
              </div>
            </div>
          )}

          {/* Success Filename Note */}
          {toast.type === "success" && (
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "0.8rem",
                color: "#15803d",
                fontWeight: 600,
              }}
            >
              Saved as {toast.filename || `${toast.title}.pdf`}
            </p>
          )}

          {/* Error Details & Actions */}
          {toast.type === "error" && (
            <div style={{ marginTop: "0.6rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "var(--accent, #7b3f2a)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw style={{ width: "0.75rem", height: "0.75rem" }} />
                    Retry Export
                  </button>
                )}

                {toast.errorDetails && (
                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: "transparent",
                      color: "#b91c1c",
                      border: "1px solid #f87171",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp style={{ width: "0.75rem", height: "0.75rem" }} /> Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} /> View Details
                      </>
                    )}
                  </button>
                )}
              </div>

              {showDetails && toast.errorDetails && (
                <div style={{ marginTop: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.25rem" }}>
                    <button
                      type="button"
                      onClick={handleCopyDetails}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.15rem 0.4rem",
                        fontSize: "0.7rem",
                        background: "rgba(0,0,0,0.05)",
                        border: "none",
                        borderRadius: "0.2rem",
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      {copied ? (
                        <>
                          <Check style={{ width: "0.7rem", height: "0.7rem" }} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: "0.7rem", height: "0.7rem" }} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: "0.5rem 0.65rem",
                      background: "rgba(0, 0, 0, 0.05)",
                      color: "#991b1b",
                      borderRadius: "0.25rem",
                      fontSize: "0.72rem",
                      lineHeight: 1.35,
                      maxHeight: "6rem",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {toast.errorDetails}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
