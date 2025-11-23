import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { logger } from "@tmac/shared/logger";

type VerificationStatus = "pending" | "success" | "error" | "not_found";

export default function VerifyDiscord() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [message, setMessage] = useState("");

  const email = searchParams.get("email");
  const discordId = searchParams.get("discordId");

  useEffect(() => {
    if (!email || !discordId) {
      setStatus("error");
      setMessage("Invalid verification link. Please try again.");
      return;
    }

    const verifyUser = async () => {
      try {
        const response = await fetch("/api/discord/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, discordId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(
            "Your Discord account has been successfully verified! You now have access to the community."
          );
        } else if (response.status === 404) {
          setStatus("not_found");
          setMessage(
            "Your email was not found in our system or hasn't been approved yet. Please contact an administrator."
          );
        } else {
          setStatus("error");
          setMessage(
            data.message ||
              "An error occurred during verification. Please try again."
          );
        }
      } catch (error) {
        logger.error(error, "Verification error");
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyUser();
  }, [email, discordId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Discord Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status === "pending" && (
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying your membership...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  Verification Successful!
                </h3>
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-500 mt-4">
                  You can now close this window and return to Discord.
                </p>
              </div>
            )}

            {status === "not_found" && (
              <div className="text-center">
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-yellow-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-yellow-600 mb-2">
                  Not Found
                </h3>
                <p className="text-gray-600">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">
                  Verification Failed
                </h3>
                <p className="text-gray-600">{message}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
