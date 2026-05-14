import { NextRequest, NextResponse } from "next/server";
import {
  buildGeoapifyAutocompleteUrl,
  buildGeoapifyAutocompleteUrlWorldwide,
  type GeoapifyAddressItem,
} from "@/lib/geoapify-address";

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim() ?? "";
  const scope = req.nextUrl.searchParams.get("scope")?.trim().toLowerCase();
  const worldwide = scope === "world";
  const serverKey = process.env.GEOAPIFY_API_KEY?.trim();

  if (text.length < 2) {
    return NextResponse.json({
      results: [] as GeoapifyAddressItem[],
      serverKeyConfigured: Boolean(serverKey),
    });
  }

  if (!serverKey) {
    return NextResponse.json({
      results: [] as GeoapifyAddressItem[],
      serverKeyConfigured: false,
    });
  }

  try {
    const url = worldwide
      ? buildGeoapifyAutocompleteUrlWorldwide(text, serverKey)
      : buildGeoapifyAutocompleteUrl(text, serverKey);
    const r = await fetch(url, {
      cache: "no-store",
    });
    if (!r.ok) {
      return NextResponse.json({
        results: [] as GeoapifyAddressItem[],
        serverKeyConfigured: true,
      });
    }
    const data = (await r.json()) as { results?: GeoapifyAddressItem[] };
    return NextResponse.json({
      results: Array.isArray(data.results) ? data.results : [],
      serverKeyConfigured: true,
    });
  } catch {
    return NextResponse.json({
      results: [] as GeoapifyAddressItem[],
      serverKeyConfigured: true,
    });
  }
}
