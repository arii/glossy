## 2026-10-07 - Prevent Data Loss on Discard Edits
**Learning:** Destructive actions without confirmation dialogs can cause significant user frustration and data loss. The 'Discard edits' button directly erased user work immediately.
**Action:** Always add a native `window.confirm` dialog or similar confirmation step before executing destructive client-side actions like discarding local edits.
