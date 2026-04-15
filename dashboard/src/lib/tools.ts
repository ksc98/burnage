// Strip the verbose `mcp__<server>__` prefix from MCP tool names and
// replace underscores with dots for a compact chip label.
// `mcp__claude-in-chrome__form_input` → `chrome.form.input`
export function shortToolName(raw: string): string {
  const m = raw.match(/^mcp__([^_]+(?:-[^_]+)*)__(.+)$/);
  if (!m) return raw;
  const server = m[1].replace(/^claude-in-/, "").replace(/-/g, ".");
  const op = m[2].replace(/_/g, ".");
  return `${server}.${op}`;
}
