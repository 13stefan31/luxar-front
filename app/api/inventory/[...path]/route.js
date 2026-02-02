import { NextResponse } from "next/server";
import {
  INVENTORY_API_REMOTE_ROOT,
  getInventoryApiHeaders,
} from "@/lib/inventoryApi";

export const dynamic = "force-dynamic";

const buildTargetUrl = (requestUrl, pathSegments) => {
  const url = new URL(requestUrl);
  const safeSegments = Array.isArray(pathSegments)
    ? pathSegments.filter(Boolean)
    : [];
  const path = safeSegments.length ? `/${safeSegments.join("/")}` : "";
  const base = INVENTORY_API_REMOTE_ROOT.replace(/\/$/, "");
  return `${base}${path}${url.search}`;
};

const buildHeaders = (request) => {
  const headers = new Headers();
  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("accept", accept);
  }
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  const apiHeaders = getInventoryApiHeaders();
  if (apiHeaders["x-api-key"]) {
    headers.set("x-api-key", apiHeaders["x-api-key"]);
  } else {
    const incomingApiKey = request.headers.get("x-api-key");
    if (incomingApiKey) {
      headers.set("x-api-key", incomingApiKey);
    }
  }
  return headers;
};

const proxyRequest = async (request, { params }) => {
  if (!INVENTORY_API_REMOTE_ROOT) {
    return NextResponse.json(
      { error: "Inventory API is not configured." },
      { status: 500 }
    );
  }

  const targetUrl = buildTargetUrl(request.url, params?.path);
  const init = {
    method: request.method,
    headers: buildHeaders(request),
    cache: "no-store",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers();
  const responseType = response.headers.get("content-type");
  if (responseType) {
    responseHeaders.set("content-type", responseType);
  }

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: responseHeaders,
  });
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
