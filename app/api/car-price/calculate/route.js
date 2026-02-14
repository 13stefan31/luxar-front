import { NextResponse } from "next/server";
import {
  INVENTORY_API_REMOTE_ROOT,
  getInventoryApiHeaders,
} from "@/lib/inventoryApi";

export const dynamic = "force-dynamic";

const normalizeTextValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const buildTargetUrl = () => {
  const base = normalizeTextValue(INVENTORY_API_REMOTE_ROOT).replace(/\/$/, "");
  if (!base) {
    return "";
  }
  return `${base}/car-price/calculate`;
};

const readJsonBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export async function POST(request) {
  const targetUrl = buildTargetUrl();
  if (!targetUrl) {
    return NextResponse.json(
      { error: "Car price endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const body = await readJsonBody(request);
  const code = normalizeTextValue(body?.code);
  const startingDate = normalizeTextValue(body?.startingDate);
  const endingDate = normalizeTextValue(body?.endingDate);

  if (!code || !startingDate || !endingDate) {
    return NextResponse.json(
      { error: "Nedostaju obavezna polja." },
      { status: 400 }
    );
  }

  const headers = new Headers();
  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("accept", accept);
  }
  headers.set("content-type", "application/json");

  const apiHeaders = getInventoryApiHeaders();
  if (apiHeaders["x-api-key"]) {
    headers.set("x-api-key", apiHeaders["x-api-key"]);
  } else {
    const incomingApiKey = request.headers.get("x-api-key");
    if (incomingApiKey) {
      headers.set("x-api-key", incomingApiKey);
    }
  }

  const authHeader =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader) {
    headers.set("authorization", authHeader);
  }

  const remoteResponse = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ code, startingDate, endingDate }),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const responseType = remoteResponse.headers.get("content-type");
  if (responseType) {
    responseHeaders.set("content-type", responseType);
  }

  return new NextResponse(await remoteResponse.arrayBuffer(), {
    status: remoteResponse.status,
    headers: responseHeaders,
  });
}

