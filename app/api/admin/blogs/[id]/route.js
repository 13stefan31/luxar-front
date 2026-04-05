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
  const remoteUrl = buildRemoteUrl(apiRoot, `/admin/blogs/${encodeURIComponent(params.id)}`);
  if (!remoteUrl) {
    return NextResponse.json({ error: "Blog endpoint nije konfigurisan." }, { status: 500 });
  }
  const token = resolveAuth(request);
  const headers = {};
  if (token) headers.Authorization = token;

  const remoteResponse = await fetch(remoteUrl, { headers, cache: "no-store" });
  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
}

export async function POST(request, { params }) {
  const { apiRoot } = getAdminEnv();
  const remoteUrl = buildRemoteUrl(apiRoot, `/admin/blogs/${encodeURIComponent(params.id)}`);
  if (!remoteUrl) {
    return NextResponse.json({ error: "Blog endpoint nije konfigurisan." }, { status: 500 });
  }
  const token = resolveAuth(request);
  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.toLowerCase().includes("multipart/form-data");
  const body = isMultipart ? await request.formData() : await request.text();
  const headers = {};
  if (!isMultipart) headers["Content-Type"] = contentType || "application/json";
  if (token) headers.Authorization = token;

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

export async function DELETE(request, { params }) {
  const { apiRoot } = getAdminEnv();
  const remoteUrl = buildRemoteUrl(apiRoot, `/admin/blogs/${encodeURIComponent(params.id)}`);
  if (!remoteUrl) {
    return NextResponse.json({ error: "Blog endpoint nije konfigurisan." }, { status: 500 });
  }
  const token = resolveAuth(request);
  const headers = {};
  if (token) headers.Authorization = token;

  const remoteResponse = await fetch(remoteUrl, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
}
