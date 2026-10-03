"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="workspace-shell">
      <div className="reading-surface">
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred while rendering the page.</p>
        <p style={{ marginTop: "1.5rem" }}>
          <button className="workspace-button" type="button" onClick={() => reset()}>
            Try again
          </button>{" "}
          <Link href="/" className="workspace-link">
            Return to Glossy Home
          </Link>
        </p>
      </div>
    </main>
  );
}
