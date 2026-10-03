"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="workspace-shell">
          <div className="reading-surface">
            <h1>Application Error</h1>
            <p>An unexpected error occurred in the root layout.</p>
            <p style={{ marginTop: "1.5rem" }}>
              <button className="workspace-button" type="button" onClick={() => reset()}>
                Try again
              </button>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
