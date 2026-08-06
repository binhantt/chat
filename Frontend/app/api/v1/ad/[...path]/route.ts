import { handleProxyRoute } from "@/app/api/_utils/genericProxy";

export async function GET(request: Request) {
  return handleProxyRoute(request);
}
export async function POST(request: Request) {
  return handleProxyRoute(request);
}
export async function PATCH(request: Request) {
  return handleProxyRoute(request);
}
export async function DELETE(request: Request) {
  return handleProxyRoute(request);
}
