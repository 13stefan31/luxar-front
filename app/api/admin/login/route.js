import { NextResponse } from "next/server";

const ADMIN_API_ROOT = process.env.NEXT_PUBLIC_ADMIN_API_ROOT;
const ADMIN_LOGIN_PATH = process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH;
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

const remoteUrl = `${ADMIN_API_ROOT || ""}${ADMIN_LOGIN_PATH || ""}`;

export async function POST(request) {
  if (!ADMIN_API_ROOT || !ADMIN_LOGIN_PATH || !ADMIN_API_KEY) {
    return NextResponse.json(
      { error: "Admin konfiguracija nije postavljena." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Telo zahteva mora biti JSON." },
      { status: 400 }
    );
  }

  const remoteResponse = await fetch(remoteUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ADMIN_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const payload =
    (await remoteResponse.json().catch(() => null)) ??
    { message: await remoteResponse.text() };

  const responseWithCookie = NextResponse.json(payload, {
    status: remoteResponse.status,
  });

  if (remoteResponse.ok && payload?.token) {
    responseWithCookie.cookies.set("admin_token", payload.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  return responseWithCookie;
}
