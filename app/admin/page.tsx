"use client";

import { useEffect } from "react";

export default function AdminRedirectPage() {
  useEffect(() => {
    window.location.replace("/admin/index.html");
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-system)",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>TinaCMS Admin Dashboard</h1>
      <p style={{ color: "var(--muted-ink)", marginBottom: "1.5rem" }}>
        Redirecting to TinaCMS editorial suite...
      </p>
      <a
        href="/admin/index.html"
        style={{
          display: "inline-block",
          padding: "0.6rem 1.25rem",
          background: "var(--ink)",
          color: "#fff",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Open Tina CMS Admin
      </a>
    </main>
  );
}
