import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

export const dynamic = "force-dynamic";

const resolveAuth = (request) => {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    null;
  const cookieToken = request.cookies.get("admin_token")?.value;
  return authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);
};

export async function GET(request) {
  const { apiRoot } = getAdminEnv();
  const remoteUrl = buildRemoteUrl(
    apiRoot,
    "/admin/available-vehicles",
    request.nextUrl.search
  );

  if (!remoteUrl) {
    return NextResponse.json(
      { error: "Available vehicles endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const token = resolveAuth(request);
  const headers = {};
  if (token) {
    headers.Authorization = token;
  }

  const remoteResponse = await fetch(remoteUrl, {
    headers,
    cache: "no-store",
  });

  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
}
