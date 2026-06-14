export function getDefaultGradient() {
  return "linear-gradient(45deg, rgba(0, 212, 255, 1) 0%, rgba(255, 255, 255, 1) 35%, rgba(255, 255, 255, 1) 63%, rgba(0, 212, 255, 1) 100%)";
}

export function buildFlagGradient(colors = []) {
  const normalized = colors.filter(Boolean).slice(0, 3);

  if (normalized.length === 0) {
    return getDefaultGradient();
  }

  if (normalized.length === 1) {
    const [color] = normalized;
    return `linear-gradient(45deg, ${color} 0%, #ffffff 35%, #ffffff 63%, ${color} 100%)`;
  }

  if (normalized.length === 2) {
    const [first, second] = normalized;
    return `linear-gradient(45deg, ${first} 0%, #ffffff 35%, #ffffff 63%, ${second} 100%)`;
  }

  const [first, second, third] = normalized;
  return `linear-gradient(45deg, ${first} 0%, ${second} 35%, ${second} 63%, ${third} 100%)`;
}
