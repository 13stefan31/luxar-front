import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildCarPath = (carsPath, carId) => {
  const basePath = (carsPath || "/api/admin/cars").replace(/\/+$/, "");
  const encoded = encodeURIComponent(carId || "");
  return `${basePath}/${encoded}`;
};

const proxy = async (request, params, method) => {
  const { apiRoot, carsPath } = getAdminEnv();
  const carPath = buildCarPath(carsPath, params?.carId);
  const remoteUrl = buildRemoteUrl(apiRoot, carPath, request.nextUrl.search);

  if (!apiRoot || !carPath || !remoteUrl) {
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
  const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

  const headers = {};
  let body;
  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
    body = await request.text();
  }
  if (token) {
    headers.Authorization = token;
  }

  const remoteResponse = await fetch(remoteUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
};

export async function GET(request, context) {
  return proxy(request, context?.params, "GET");
}

export async function PUT(request, context) {
  return proxy(request, context?.params, "PUT");
}
