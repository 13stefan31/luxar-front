import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

export async function GET(request) {
  const { apiRoot, carsPath } = getAdminEnv();
  const basePath = carsPath || "/api/admin/cars";
  const remoteUrl = buildRemoteUrl(apiRoot, basePath, request.nextUrl.search);

  if (!apiRoot || !basePath || !remoteUrl) {
    return NextResponse.json(
      { error: "Admin cars endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    null;
  const cookieToken = request.cookies.get("admin_token")?.value;
  const token =
    authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

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

export async function POST(request) {
  const { apiRoot, carsPath } = getAdminEnv();
  const basePath = carsPath || "/api/admin/cars";
  const remoteUrl = buildRemoteUrl(apiRoot, basePath, request.nextUrl.search);

  if (!apiRoot || !basePath || !remoteUrl) {
    return NextResponse.json(
      { error: "Admin cars endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    null;
  const cookieToken = request.cookies.get("admin_token")?.value;
  const token =
    authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.toLowerCase().includes("multipart/form-data");
  const body = isMultipart ? await request.formData() : await request.text();
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = contentType || "application/json";
  }
  if (token) {
    headers.Authorization = token;
  }

  const remoteResponse = await fetch(remoteUrl, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
}
