/** Serializes a flat query-params object into a `?a=b&c=d` string, dropping undefined/null values. */
export function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}
