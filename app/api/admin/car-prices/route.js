import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildCarPricesPath = (carsPath) => {
  const basePath = carsPath || "/api/admin/cars";
  if (basePath.includes("/cars")) {
    return basePath.replace("/cars", "/car-prices");
  }
  return `${basePath.replace(/\/$/, "")}/car-prices`;
};

const resolveAuthToken = (request) => {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    null;
  const cookieToken = request.cookies.get("admin_token")?.value;
  return authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);
};

const proxyRequest = async (request, method) => {
  const { apiRoot, carsPath, apiKey } = getAdminEnv();
  const pricesPath = buildCarPricesPath(carsPath);
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

export async function POST(request) {
  return proxyRequest(request, "POST");
}

export async function GET(request) {
  return proxyRequest(request, "GET");
}
