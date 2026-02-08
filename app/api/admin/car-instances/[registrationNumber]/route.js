import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildInstancesBasePath = (carsPath) => {
  const basePath = carsPath || "/api/admin/cars";
  if (basePath.includes("/cars")) {
    return basePath.replace("/cars", "/car-instances");
  }
  return `${basePath.replace(/\/$/, "")}/car-instances`;
};

const buildInstancePath = (carsPath, registrationNumber) => {
  const basePath = buildInstancesBasePath(carsPath);
  const encoded = encodeURIComponent(registrationNumber || "");
  return `${basePath}/${encoded}`;
};

const proxy = async (request, params, method) => {
  const { apiRoot, carsPath } = getAdminEnv();
  const instancePath = buildInstancePath(
    carsPath,
    params?.registrationNumber
  );
  const remoteUrl = buildRemoteUrl(
    apiRoot,
    instancePath,
    request.nextUrl.search
  );

  if (!apiRoot || !instancePath || !remoteUrl) {
    return NextResponse.json(
      { error: "Admin endpoint nije konfigurisan." },
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
  if (method !== "DELETE") {
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
  return proxy(request, context?.params, "POST");
}

export async function POST(request, context) {
  return proxy(request, context?.params, "POST");
}

export async function DELETE(request, context) {
  return proxy(request, context?.params, "DELETE");
}
