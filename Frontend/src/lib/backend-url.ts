export function getBackendUrl() {
  const backendUrl =
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    getDevelopmentFallbackUrl();

  if (!backendUrl) {
    return null;
  }

  return backendUrl.replace(/\/+$/, "");
}

function getDevelopmentFallbackUrl() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "http://localhost:3000";
}
