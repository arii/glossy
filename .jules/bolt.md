
## 2026-10-07 - Memoizing expensive map/flatMap in reading-page.tsx
**Learning:** Nested array flatMapping (like generating footnotes/apparatus for large text documents) triggers severe main-thread lag if allowed to run on every state change in React components.
**Action:** Always wrap heavy list derivations in `useMemo` when rendering components that display many items or handle frequently changing state (like hover highlighting `selectedId`), and ensure legacy fallbacks and hard-coded values are purged during the optimization.
