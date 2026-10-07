"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import attributionData from "../content/pages/attribution.json";
import { formatRelativeTime } from "../lib/utils";

export interface SiteFooterProps {
  platformCreator?: string;
  platformCreatorUrl?: string;
  defaultEditor?: string;
  defaultEditorUrl?: string;
}

export function SiteFooter(props: SiteFooterProps) {
  const platformCreator = props.platformCreator ?? attributionData.platformCreator;
  const platformCreatorUrl = props.platformCreatorUrl ?? attributionData.platformCreatorUrl;
  const defaultEditor = props.defaultEditor ?? attributionData.defaultEditor;
  const defaultEditorUrl = props.defaultEditorUrl ?? attributionData.defaultEditorUrl;

  const feedbackUrl = "https://github.com/arii/glossy/issues/new?template=feedback.yml&title=Feedback%20%2F%20Report";

  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_BUILD_TIME) {
      setLastUpdated(formatRelativeTime(process.env.NEXT_PUBLIC_BUILD_TIME));
    }
  }, []);

  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev";
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
  const displayCommit = commitSha.slice(0, 7);

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-title">
            <span className="site-footer-name">Glossy</span>
            <span className="site-footer-tagline">— Old English Interlinear Glossing &amp; Morphology</span>
          </div>
          <div className="site-footer-credits">
            Developed by{" "}
            {platformCreatorUrl ? (
              <a
                href={platformCreatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-author-link"
              >
                {platformCreator}
              </a>
            ) : (
              platformCreator
            )}{" "}
            with{" "}
            {defaultEditorUrl ? (
              <a
                href={defaultEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-author-link"
              >
                {defaultEditor}
              </a>
            ) : (
              defaultEditor
            )}
          </div>
          <div className="site-footer-version">
            v{appVersion} (
            <a
              href={`https://github.com/arii/glossy/commit/${commitSha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-author-link"
            >
              {displayCommit}
            </a>
            )
            {lastUpdated ? ` · Last updated ${lastUpdated}` : ""}
          </div>
        </div>

        <nav className="site-footer-nav" aria-label="Footer Navigation">
          <Link href="/about" className="site-footer-link">
            About
          </Link>
          <Link href="/attribution" className="site-footer-link">
            Attribution
          </Link>
          <Link href="/privacy" className="site-footer-link">
            Privacy
          </Link>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer-link"
          >
            Feedback / Report Bug
          </a>
          <a
            href="/admin/index.html"
            className="site-footer-link site-footer-admin-link"
          >
            Admin Login
          </a>
        </nav>
      </div>
    </footer>
  );
}
