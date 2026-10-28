import { NextResponse } from "next/server";
import { getBooks, getPassage } from "@/lib/bible";
import { parseRef } from "@/lib/bible-core";

/** 본문을 직접 지정할 때 ("빌립보서 3:12-16"). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const loc = typeof body.ref === "string" ? parseRef(await getBooks(), body.ref) : null;
  const passage = loc && (await getPassage(loc));
  if (!passage) {
    return NextResponse.json(
      { error: "본문을 찾지 못했어요. 예: 빌립보서 3:12-16, 시편 23편" },
      { status: 400 },
    );
  }
  return NextResponse.json(passage);
}
