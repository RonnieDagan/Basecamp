const PALETTE = ["#D89A6E", "#E6C784", "#7FA084", "#7FC9BE", "#8FAFC9", "#B79FD1", "#D18FA6"];

export function categoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
