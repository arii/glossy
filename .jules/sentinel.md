## 2026-10-07 - Add missing noopener noreferrer to target blank links
**Vulnerability:** External links with target="_blank" without rel="noopener noreferrer" create a reverse tabnabbing vulnerability where the new tab can access the original window's location object.
**Learning:** In Next.js React applications, using `target="_blank"` opens links in new tabs, but leaves a security vulnerability that needs to be mitigated using `rel="noopener noreferrer"`.
**Prevention:** Always combine `target="_blank"` with `rel="noopener noreferrer"` when linking to untrusted external sites.
