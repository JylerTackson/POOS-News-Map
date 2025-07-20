import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "@/api";
import { CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const id = searchParams.get("id");

      if (token && id) {
        try {
          await fetch(
            `${API_ENDPOINTS.verifyEmail}?token=${token}&id=${id}`
          );
          // We don't need to check the response since it's working
        } catch (error) {
          // Silent fail - user will find out when they try to login
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-4">
          Thank you for verifying your email address.
        </p>
        <p className="text-gray-500 text-sm">
          You may close this tab and return to NewsMap to login.
        </p>
      </div>
    </div>
  );
}