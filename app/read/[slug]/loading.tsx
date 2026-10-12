import { SiteNav } from "../../../components/site-nav";
import { SiteFooter } from "../../../components/site-footer";

export default function ReadingPageLoading() {
  return (
    <>
      <SiteNav current="read" slug="ohthere" />
      <main className="site-shell" aria-busy="true" aria-label="Loading passage">
        <div className="reading-surface">
          <div style={{ padding: "2rem 0", textAlign: "center" }}>
            <p style={{ color: "var(--muted-ink)", fontSize: "1.1rem" }}>
              Loading interlinear passage...
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
