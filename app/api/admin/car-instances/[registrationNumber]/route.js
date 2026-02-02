import { NextResponse } from "next/server";

const ADMIN_API_ROOT = process.env.NEXT_PUBLIC_ADMIN_API_ROOT;
const ADMIN_CARS_PATH =
  process.env.NEXT_PUBLIC_ADMIN_CARS_PATH || "/api/admin/cars";

const buildInstancesBasePath = () => {
  if (!ADMIN_CARS_PATH) {
    return null;
  }
  if (ADMIN_CARS_PATH.includes("/cars")) {
    return ADMIN_CARS_PATH.replace("/cars", "/car-instances");
  }
  return `${ADMIN_CARS_PATH.replace(/\/$/, "")}/car-instances`;
};

const buildRemoteUrl = (registrationNumber, search) => {
  if (!ADMIN_API_ROOT) {
    return null;
  }
  const basePath = buildInstancesBasePath();
  if (!basePath) {
    return null;
  }
  try {
    const encoded = encodeURIComponent(registrationNumber || "");
    const remoteUrl = new URL(`${ADMIN_API_ROOT}${basePath}/${encoded}`);
    remoteUrl.search = search ?? "";
    return remoteUrl.toString();
  } catch {
    return null;
  }
};

const proxy = async (request, params, method) => {
  if (!ADMIN_API_ROOT) {
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

  const remoteUrl = buildRemoteUrl(params?.registrationNumber, request.nextUrl.search);
  if (!remoteUrl) {
    return NextResponse.json(
      { error: "Neuspešna konstrukcija udaljenog URL-a." },
      { status: 500 }
    );
  }

  const headers = {};
  let body;
  if (method !== "DELETE") {
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

export async function PUT(request, context) {
  return proxy(request, context?.params, "PUT");
}

export async function DELETE(request, context) {
  return proxy(request, context?.params, "DELETE");
}
