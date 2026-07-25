import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [resFrontend, resApi] = await Promise.all([
      fetch("https://hub.docker.com/v2/repositories/akshatsaini08/srevox-frontend/", {
        next: { revalidate: 60 },
      }),
      fetch("https://hub.docker.com/v2/repositories/akshatsaini08/srevox-api/", {
        next: { revalidate: 60 },
      }),
    ]);

    const dataFrontend = await resFrontend.json().catch(() => null);
    const dataApi = await resApi.json().catch(() => null);

    let maxPulls = 2102;

    if (dataFrontend?.pull_count && dataFrontend.pull_count > maxPulls) {
      maxPulls = dataFrontend.pull_count;
    }

    if (dataApi?.pull_count && dataApi.pull_count > maxPulls) {
      maxPulls = dataApi.pull_count;
    }

    const token = Buffer.from(String(maxPulls)).toString("base64");

    // Returns empty body (No response data in DevTools Preview/Response)
    return new NextResponse(null, {
      status: 200,
      headers: {
        "x-srevox-v": token,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    const token = Buffer.from("2102").toString("base64");
    return new NextResponse(null, {
      status: 200,
      headers: {
        "x-srevox-v": token,
        "Cache-Control": "no-store",
      },
    });
  }
}
