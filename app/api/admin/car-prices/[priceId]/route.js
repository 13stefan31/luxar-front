import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildCarPricesPath = (carsPath, priceId) => {
  const basePath = carsPath || "/api/admin/cars";
  const base =
    basePath.includes("/cars")
      ? basePath.replace("/cars", "/car-prices")
      : `${basePath.replace(/\/$/, "")}/car-prices`;
  const encoded = encodeURIComponent(priceId || "");
  return `${base}/${encoded}`;
};

const resolveAuthToken = (request) => {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    null;
  const cookieToken = request.cookies.get("admin_token")?.value;
  return authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);
};

const proxyRequest = async (request, params, method) => {
  const { apiRoot, carsPath, apiKey } = getAdminEnv();
  const pricesPath = buildCarPricesPath(carsPath, params?.priceId);
  const remoteUrl = buildRemoteUrl(
    apiRoot,
    pricesPath,
    request.nextUrl.search
  );

  if (!apiRoot || !pricesPath || !remoteUrl) {
    return NextResponse.json(
      { error: "Admin prices endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const token = resolveAuthToken(request);
  const headers = {};
  let body;

  if (method !== "GET") {
    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.toLowerCase().includes("multipart/form-data");
    body = isMultipart ? await request.formData() : await request.text();
    if (!isMultipart) {
      headers["Content-Type"] = contentType || "application/json";
    }
  }

  if (token) {
    headers.Authorization = token;
  }
  if (apiKey) {
    headers["x-api-key"] = apiKey;
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

export async function PUT(request, context) {
  return proxyRequest(request, context?.params, "PUT");
}

export async function DELETE(request, context) {
  return proxyRequest(request, context?.params, "DELETE");
}

export async function GET(request, context) {
  return proxyRequest(request, context?.params, "GET");
}
