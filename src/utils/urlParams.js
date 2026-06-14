export function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

export function getParam(key) {
  return getSearchParams().get(key);
}

export function updateSearchParams(updates) {
  const params = getSearchParams();

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const query = params.toString();
  const newUrl = query
    ? `${window.location.pathname}?${query}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`;

  window.history.replaceState({}, "", newUrl);
}

export function buildShareUrl({ countrySlug, lang }) {
  const params = new URLSearchParams();

  if (countrySlug) {
    params.set("pais", countrySlug);
  }

  if (lang && lang !== "es") {
    params.set("lang", lang);
  }

  const query = params.toString();
  return query
    ? `${window.location.origin}${window.location.pathname}?${query}`
    : `${window.location.origin}${window.location.pathname}`;
}

export function isEmbedMode() {
  return getParam("embed") === "1";
}
