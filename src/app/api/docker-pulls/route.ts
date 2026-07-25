import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ v: 2102 });
}
