export function hashCode(s: string) {
  let h = 0
  const l = s.length
  let i = 0
  if (l > 0) while (i < l) h = ((h << 5) + h + s.charCodeAt(i++)) | 0
  return h
}
