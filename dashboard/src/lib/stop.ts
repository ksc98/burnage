// Returns null for the common `end_turn` / `tool_use` cases so callers skip
// rendering the dot entirely — those stop reasons are implicit from the
// surrounding columns and just add visual noise. A dot means "look here."
export function stopDotClass(sr: string | null | undefined): string | null {
  if (sr === "max_tokens" || sr === "error") return "dot-danger";
  if (sr === "stop_sequence") return "dot-warn";
  return null;
}

// Matches stopDotClass but returns a CSS color value (for MixBar, legends,
// anywhere we can't hang a class off an element).
export function stopColorVar(sr: string | null | undefined): string {
  if (sr === "end_turn") return "var(--color-good)";
  if (sr === "tool_use") return "var(--color-subtle-foreground)";
  if (sr === "max_tokens" || sr === "error") return "var(--color-danger)";
  if (sr === "stop_sequence") return "var(--color-warn)";
  return "var(--color-subtle-foreground)";
}

export function stopLabel(sr: string | null | undefined): string {
  if (!sr) return "unknown";
  return sr;
}
