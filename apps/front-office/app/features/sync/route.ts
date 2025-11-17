import type { LoaderFunctionArgs } from "react-router";
import { logger } from "@tmac/shared/logger";

import { syncIntakeFromGoogleSheet } from "./sync";

const SYNC_SECRET_HEADER = "x-sync-secret";

export async function loader({ request }: LoaderFunctionArgs) {
  const expectedSecret = process.env.SYNC_SECRET;

  if (!expectedSecret) {
    logger.error("SYNC_SECRET env var is not configured");
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
    logger.warn("Unauthorized sync attempt");
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
    logger.error(error, "Failed to sync intake form");
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
