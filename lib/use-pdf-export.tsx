"use client";

import React, { useState, useCallback, useRef } from "react";
import type { TextDocument } from "./types";
import { exportToPdf, type ProgressCallback } from "./export-pdf";
import { PdfExportToast } from "../components/pdf-export-toast";

export interface PdfToastState {
  type: "progress" | "success" | "error";
  title: string;
  filename?: string;
  stage?: string;
  step?: number;
  totalSteps?: number;
  errorDetails?: string;
  doc?: TextDocument;
}

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progressStage, setProgressStage] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<number>(1);
  const [toast, setToast] = useState<PdfToastState | null>(null);
  const lastDocRef = useRef<TextDocument | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const exportPdf = useCallback(async (doc: TextDocument) => {
    if (!doc) return;
    lastDocRef.current = doc;
    setIsExporting(true);
    const docTitle = doc.title || doc.slug || "Document";

    setToast({
      type: "progress",
      title: docTitle,
      stage: "Fetching fonts...",
      step: 1,
      totalSteps: 4,
      doc,
    });
    setProgressStage("Fetching fonts...");
    setProgressStep(1);

    const onProgress: ProgressCallback = (stage, step = 1, totalSteps = 4) => {
      setProgressStage(stage);
      setProgressStep(step);
      setToast((prev) => {
        if (prev?.type !== "progress") return prev;
        return {
          ...prev,
          stage,
          step,
          totalSteps,
        };
      });
    };

    try {
      const result = await exportToPdf(doc, onProgress);
      setIsExporting(false);
      setProgressStage(null);

      setToast({
        type: "success",
        title: result.title || docTitle,
        filename: result.filename,
        doc,
      });

      // Auto dismiss success toast after 5 seconds
      setTimeout(() => {
        setToast((current) => (current?.type === "success" ? null : current));
      }, 5000);
    } catch (err: unknown) {
      setIsExporting(false);
      setProgressStage(null);
      const errMsg = err instanceof Error ? err.message : String(err);

      setToast({
        type: "error",
        title: docTitle,
        errorDetails: errMsg,
        doc,
      });
    }
  }, []);

  const retryExport = useCallback(() => {
    if (lastDocRef.current) {
      exportPdf(lastDocRef.current);
    }
  }, [exportPdf]);

  const ToastComponent = (
    <PdfExportToast
      toast={toast}
      onDismiss={dismissToast}
      onRetry={retryExport}
    />
  );

  return {
    isExporting,
    progressStage,
    progressStep,
    toast,
    exportPdf,
    dismissToast,
    retryExport,
    ToastComponent,
  };
}
