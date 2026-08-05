export function truncateFilename(name: string, max = 25) {
  if (name.length <= max) return name;
  return `${name.slice(0, max)}...`;
}
