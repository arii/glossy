"use client";

import Link from "next/link";

export function SiteFooter() {
  const feedbackUrl = "https://github.com/arii/glossy/issues/new?template=feedback.yml&title=Feedback%20%2F%20Report";

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
            <a
              href="https://boomtick.blog/services"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-author-link"
            >
              Ariel Anders
            </a>{" "}
            with{" "}
            <a
              href="https://sites.google.com/view/tyler-lemon"
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-author-link"
            >
              Tyler Lemon
            </a>
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
