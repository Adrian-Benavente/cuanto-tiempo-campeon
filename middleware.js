const BOT_PATTERN =
  /bot|facebookexternalhit|twitterbot|whatsapp|linkedinbot|slackbot|telegrambot|discordbot|pinterest|embedly|quora link preview/i;

export const config = {
  matcher: ["/((?!api/|static/|favicon.ico|manifest.json|sw.js|robots.txt).*)"],
};

export default function middleware(request) {
  const url = new URL(request.url);
  const pais = url.searchParams.get("pais");

  if (!pais) {
    return;
  }

  const userAgent = request.headers.get("user-agent") || "";

  if (!BOT_PATTERN.test(userAgent)) {
    return;
  }

  const previewUrl = new URL("/api/share-preview", url.origin);
  previewUrl.search = url.search;

  return Response.redirect(previewUrl, 302);
}
