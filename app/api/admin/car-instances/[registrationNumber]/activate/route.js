import { NextResponse } from "next/server";
import { buildRemoteUrl, getAdminEnv } from "@/lib/adminEnv";

const buildInstancesBasePath = (carsPath) => {
  const basePath = carsPath || "/api/admin/cars";
  if (basePath.includes("/cars")) {
    return basePath.replace("/cars", "/car-instances");
  }
  return `${basePath.replace(/\/$/, "")}/car-instances`;
};

const buildActivatePath = (carsPath, registrationNumber) => {
  const basePath = buildInstancesBasePath(carsPath);
  const encoded = encodeURIComponent(registrationNumber || "");
  return `${basePath}/${encoded}/activate`;
};

const proxy = async (request, params) => {
  const { apiRoot, carsPath } = getAdminEnv();
  const activatePath = buildActivatePath(carsPath, params?.registrationNumber);
  const remoteUrl = buildRemoteUrl(
    apiRoot,
    activatePath,
    request.nextUrl.search
  );

  if (!apiRoot || !activatePath || !remoteUrl) {
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
    method: "PUT",
    headers,
    cache: "no-store",
  });

  return new NextResponse(remoteResponse.body, {
    status: remoteResponse.status,
    headers: remoteResponse.headers,
  });
};

export async function PUT(request, context) {
  return proxy(request, context?.params);
}
