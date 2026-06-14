export default function formatHost(host) {
  if (Array.isArray(host)) {
    return host.filter(Boolean).join(", ");
  }

  if (typeof host === "string") {
    return host;
  }

  return "";
}
