import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildInstancesBasePath = (carsPath) => {
  const basePath = carsPath || "/api/admin/cars";
  if (basePath.includes("/cars")) {
    return basePath.replace("/cars", "/car-instances");
  }
  return `${basePath.replace(/\/$/, "")}/car-instances`;
};

export async function POST(request) {
  const { apiRoot, carsPath } = getAdminEnv();
  const instancesPath = buildInstancesBasePath(carsPath);
  const remoteUrl = buildRemoteUrl(
    apiRoot,
    instancesPath,
    request.nextUrl.search
  );

  if (!apiRoot || !instancesPath || !remoteUrl) {
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

  const body = await request.text();
  const headers = { "Content-Type": "application/json" };
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

export async function GET(request) {
  const { apiRoot, carsPath } = getAdminEnv();
  const instancesPath = buildInstancesBasePath(carsPath);
  const remoteUrl = buildRemoteUrl(
    apiRoot,
    instancesPath,
    request.nextUrl.search
  );

  if (!apiRoot || !instancesPath || !remoteUrl) {
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
