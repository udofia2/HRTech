export function validateMeloPrompt(body: unknown) {
  if (!body) return { ok: false, error: "empty body" };
  // narrow unknown to any-like for runtime checks
  const b = body as { prompt?: unknown };
  if (typeof b.prompt !== "string" || b.prompt.trim() === "")
    return { ok: false, error: "prompt required" };
  return { ok: true };
}
