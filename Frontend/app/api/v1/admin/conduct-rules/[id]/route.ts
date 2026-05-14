import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/conduct-rules/${id}`, {
      method: "PATCH",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(body),
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error updating conduct rule:", error);
    return NextResponse.json(
      { message: "Khong the cap nhat luat ung xu" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/conduct-rules/${id}`, {
      method: "DELETE",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error deleting conduct rule:", error);
    return NextResponse.json(
      { message: "Khong the xoa luat ung xu" },
      { status: 500 },
    );
  }
}
