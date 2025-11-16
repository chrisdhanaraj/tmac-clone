import type { LoaderFunctionArgs } from "react-router";

import { syncIntakeFromGoogleSheet } from "./sync";

const SYNC_SECRET_HEADER = "x-sync-secret";

export async function loader({ request }: LoaderFunctionArgs) {
  const expectedSecret = process.env.SYNC_SECRET;

  if (!expectedSecret) {
    console.error("SYNC_SECRET env var is not configured");
    return Response.json(
      {
        success: false,
        error: "Sync is not configured",
      },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get(SYNC_SECRET_HEADER);

  if (!providedSecret || providedSecret !== expectedSecret) {
    console.warn("Unauthorized sync attempt");
    return Response.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const result = await syncIntakeFromGoogleSheet();
    return Response.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("Failed to sync intake form", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
