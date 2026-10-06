"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const handleReset = () => {
    if (typeof reset === "function") {
      try {
        reset();
      } catch {
        window.location.reload();
      }
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <>
      <SiteNav slug="ohthere-wulfstan" />
      <main className="site-shell">
        <div className="reading-surface">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred while rendering the page.</p>
          <p style={{ marginTop: "1.5rem" }}>
            <button className="workspace-button" type="button" onClick={handleReset}>
              Try again
            </button>{" "}
            <Link href="/" className="workspace-link">
              Return to Glossy Home
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
