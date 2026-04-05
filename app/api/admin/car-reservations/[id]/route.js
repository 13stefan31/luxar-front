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

export async function GET(request, { params }) {
  const { apiRoot } = getAdminEnv();
  const remotePath = `/admin/car-reservations/${encodeURIComponent(params.id)}`;
  const remoteUrl = buildRemoteUrl(apiRoot, remotePath);

  if (!remoteUrl) {
    return NextResponse.json(
      { error: "Admin reservation endpoint nije konfigurisan." },
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

export async function PUT(request, { params }) {
  const { apiRoot } = getAdminEnv();
  const remotePath = `/admin/car-reservations/${encodeURIComponent(params.id)}`;
  const remoteUrl = buildRemoteUrl(apiRoot, remotePath);

  if (!remoteUrl) {
    return NextResponse.json(
      { error: "Admin reservation endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const token = resolveAuth(request);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = token;
  }

  const body = await request.text();

  const remoteResponse = await fetch(remoteUrl, {
    method: "PUT",
    headers,
    body,
    cache: "no-store",
  });

  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
}
