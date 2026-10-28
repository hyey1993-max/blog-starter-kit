import { NextResponse } from "next/server";
import { drawPassage } from "@/lib/bible";
import type { DrawMode, DrawScope } from "@/lib/bible-core";

const MODES: DrawMode[] = ["range", "chapter", "verse"];
const SCOPES: DrawScope[] = ["all", "OT", "NT"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode: DrawMode = MODES.includes(body.mode) ? body.mode : "range";
  const scope: DrawScope = SCOPES.includes(body.scope) ? body.scope : "all";
  return NextResponse.json(await drawPassage(mode, scope));
}
