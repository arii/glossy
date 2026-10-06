import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer" style={{ marginTop: "4rem", borderTop: "1px solid var(--rule)", background: "var(--surface)", color: "var(--ink)", padding: "3rem 1.5rem 2.5rem" }}>
      <div className="site-footer-inner" style={{ maxWidth: "76rem", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "2.5rem" }}>
        {/* Col 1: Brand & Mission */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>
              Glossy
            </span>
            <span style={{ fontSize: "0.7rem", fontFamily: "monospace", background: "#f3eadb", padding: "0.15rem 0.4rem", borderRadius: "0.2rem", color: "var(--accent)", fontWeight: 700 }}>
              v0.1.0
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted-ink)", margin: "0 0 1rem" }}>
            A digital humanities platform for reading, morphologically annotating, and publishing Old English interlinear texts with Leipzig alignment and LaTeX <code>gb4e</code> export.
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-ink)", margin: 0 }}>
            Inspired by the pioneering Old English digital glosses of Peter S. Baker&apos;s{" "}
            <a
              href="https://oldenglishaerobics.net/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline", fontWeight: 600 }}
            >
              Old English Aerobics <ExternalLink style={{ width: "0.7rem", height: "0.7rem", display: "inline" }} />
            </a>.
          </p>
        </div>

        {/* Col 2: Navigation & Quick Links */}
        <div>
          <h4 style={{ fontSize: "0.8rem", font: "700 0.8rem Arial, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", margin: "0 0 0.85rem" }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
            <li>
              <Link href="/read/ohthere-wulfstan" style={{ color: "var(--ink)", textDecoration: "none" }}>
                📖 Read: <em>Voyages of Ohthere &amp; Wulfstan</em>
              </Link>
            </li>
            <li>
              <Link href="/read/beowulf-prologue" style={{ color: "var(--ink)", textDecoration: "none" }}>
                📖 Read: <em>Beowulf: Prologue</em>
              </Link>
            </li>
            <li>
              <Link href="/edit/new" style={{ color: "var(--ink)", textDecoration: "none" }}>
                ✍️ Ingest &amp; Lemmatize New Text
              </Link>
            </li>
            <li>
              <Link href="/docs?tab=linguistics" style={{ color: "var(--ink)", textDecoration: "none" }}>
                📜 Linguistic &amp; Editorial Standards
              </Link>
            </li>
            <li>
              <Link href="/docs?tab=architecture" style={{ color: "var(--ink)", textDecoration: "none" }}>
                ⚙️ Technical Architecture &amp; Data Model
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Scholarly Attribution & Sources */}
        <div>
          <h4 style={{ fontSize: "0.8rem", font: "700 0.8rem Arial, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", margin: "0 0 0.85rem" }}>
            Scholarly Attribution
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
            <li>
              <strong style={{ color: "var(--ink)" }}>Master Edition:</strong> Tyler Lemon (2026), <em>The voyages of Ohthere and Wulfstan</em>.
            </li>
            <li>
              <strong style={{ color: "var(--ink)" }}>Manuscript:</strong> London, British Library, Cotton MS Tiberius B. i (King Alfred&apos;s Orosius).
            </li>
            <li>
              <strong style={{ color: "var(--ink)" }}>Lexicography:</strong> Bosworth-Toller Anglo-Saxon Dictionary, Clark Hall, Sweet, &amp; Wiktionary.
            </li>
            <li>
              <strong style={{ color: "var(--ink)" }}>Standards:</strong> Leipzig Glossing Rules (Max Planck Institute) &amp; LaTeX <code>gb4e</code>.
            </li>
            <li>
              <strong style={{ color: "var(--ink)" }}>Typography:</strong> Charis SIL (SIL International).
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright / Attribution Bar */}
      <div style={{ maxWidth: "76rem", margin: "2rem auto 0", paddingTop: "1.25rem", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
        <div>
          <span>Glossy — Open Source Scholarly Old English Interlinear Annotation Suite</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span>gb4e XeLaTeX Compatible</span>
          <span>•</span>
          <span>Next.js + TinaCMS Dual-Write</span>
        </div>
      </div>
    </footer>
  );
}
