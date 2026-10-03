import Link from "next/link";

export default function NotFound() {
  return (
    <main className="workspace-shell">
      <div className="reading-surface">
        <h1>404 - Not Found</h1>
        <p>The requested passage or editor workspace could not be found.</p>
        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="workspace-link">
            Return to Glossy Home
          </Link>
        </p>
      </div>
    </main>
  );
}
