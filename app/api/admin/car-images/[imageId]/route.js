import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildCarImagesPath = (carsPath, imageId) => {
  const basePath = carsPath || "/api/admin/cars";
  const base = basePath.includes("/cars")
    ? basePath.replace("/cars", "/car-images")
    : `${basePath.replace(/\/$/, "")}/car-images`;
  const encoded = encodeURIComponent(imageId || "");
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

const proxyRequest = async (request, params) => {
  const { apiRoot, carsPath, apiKey } = getAdminEnv();
  const imagesPath = buildCarImagesPath(carsPath, params?.imageId);
  const remoteUrl = buildRemoteUrl(apiRoot, imagesPath, request.nextUrl.search);

  if (!apiRoot || !imagesPath || !remoteUrl) {
    return NextResponse.json(
      { error: "Admin images endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const token = resolveAuthToken(request);
  const headers = {};
  if (token) {
    headers.Authorization = token;
  }
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const remoteResponse = await fetch(remoteUrl, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
};

export async function DELETE(request, context) {
  return proxyRequest(request, context?.params);
}
