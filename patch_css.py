import re

with open("app/globals.css", "r") as f:
    content = f.read()

old_css = """.editor-inspector-card {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 0.5rem 1.5rem rgba(64, 47, 29, 0.05);
}"""

new_css = """.editor-inspector-card {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 0.5rem 1.5rem rgba(64, 47, 29, 0.05);
}

@media (min-width: 48rem) {
  .editor-inspector-card {
    position: sticky;
    top: 1rem;
    max-height: calc(100vh - 3rem);
    overflow-y: auto;
  }
}"""
content = content.replace(old_css, new_css)

with open("app/globals.css", "w") as f:
    f.write(content)

with open("components/gloss-editor.tsx", "r") as f:
    content2 = f.read()

# Change aside sticky position
old_aside = '<aside className="editor-inspector-card">'
new_aside = '<aside className="editor-inspector-card" style={{ position: "sticky", top: "1rem", maxHeight: "calc(100vh - 3rem)", overflowY: "auto" }}>'
content2 = content2.replace(old_aside, new_aside)

with open("components/gloss-editor.tsx", "w") as f:
    f.write(content2)
