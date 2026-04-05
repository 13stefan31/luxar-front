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
  return `${base}/car-reservations`;
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
      { error: "Reservation endpoint nije konfigurisan." },
      { status: 500 }
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json(
      { error: "Nedostaju podaci za rezervaciju." },
      { status: 400 }
    );
  }

  const headers = new Headers();
  headers.set("content-type", "application/json");

  const apiHeaders = getInventoryApiHeaders();
  if (apiHeaders["x-api-key"]) {
    headers.set("x-api-key", apiHeaders["x-api-key"]);
  }

  const remoteResponse = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
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
