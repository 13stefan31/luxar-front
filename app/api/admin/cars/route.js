import { NextResponse } from "next/server";

const ADMIN_API_ROOT = process.env.NEXT_PUBLIC_ADMIN_API_ROOT;
const ADMIN_CARS_PATH =
  process.env.NEXT_PUBLIC_ADMIN_CARS_PATH || "/api/admin/cars";

const buildRemoteUrl = (search) => {
  if (!ADMIN_API_ROOT || !ADMIN_CARS_PATH) {
    return null;
  }
  try {
    const remoteUrl = new URL(`${ADMIN_API_ROOT}${ADMIN_CARS_PATH}`);
    remoteUrl.search = search ?? "";
    return remoteUrl.toString();
  } catch (error) {
    return null;
  }
};

export async function GET(request) {
  if (!ADMIN_API_ROOT || !ADMIN_CARS_PATH) {
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

  const remoteUrl = buildRemoteUrl(request.nextUrl.search);
  if (!remoteUrl) {
    return NextResponse.json(
      { error: "Neuspešna konstrukcija udaljenog URL-a." },
      { status: 500 }
    );
  }

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
  if (!ADMIN_API_ROOT || !ADMIN_CARS_PATH) {
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

  const remoteUrl = buildRemoteUrl(request.nextUrl.search);
  if (!remoteUrl) {
    return NextResponse.json(
      { error: "Neuspešna konstrukcija udaljenog URL-a." },
      { status: 500 }
    );
  }

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
