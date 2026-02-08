import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

export async function POST(request) {
  const { apiRoot, loginPath, apiKey } = getAdminEnv();
  const remoteUrl = buildRemoteUrl(apiRoot, loginPath);

  if (!apiRoot || !loginPath || !apiKey || !remoteUrl) {
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
      "x-api-key": apiKey,
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
