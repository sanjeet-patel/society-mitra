import { NextResponse } from "next/server";
import { searchDirectory } from "@/lib/actions/directory";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ societySlug: string }> }
) {
  const { societySlug } = await params;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const members = await searchDirectory(societySlug, q);
  return NextResponse.json({ members });
}
