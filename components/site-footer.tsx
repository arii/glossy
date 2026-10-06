export function SiteFooter() {
  return (
    <footer className="site-footer" style={{ marginTop: "4rem", borderTop: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", padding: "1.75rem 1.5rem" }}>
      <div style={{ maxWidth: "76rem", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: "0.82rem", color: "var(--muted-ink)" }}>
        <div>
          <span style={{ fontFamily: "'Charis SIL', Georgia, serif", fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", marginRight: "0.5rem" }}>
            Glossy
          </span>
          <span>— Old English Interlinear Glossing &amp; Morphology</span>
        </div>

        <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }} aria-label="Footer Navigation">
          <a href="/admin/index.html" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Admin Login
          </a>
        </nav>
      </div>
    </footer>
  );
}

