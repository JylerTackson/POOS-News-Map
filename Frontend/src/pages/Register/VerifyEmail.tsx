import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "@/api";
import { CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

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
        } catch (error) {
          // Silent fail
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white">
      {/* Single glowing black orb in the background */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="w-96 h-96 bg-black rounded-full filter blur-3xl opacity-20"></div>
      </div>

      {/* Main content card */}
      <div className="relative bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success icon */}
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

        {/* Success message */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Email Verified!
        </h1>
        <p className="text-gray-600">
          Your email address has been successfully verified.
        </p>
        <Button
            variant="outline"
            className="px-4 py-1 text-sm font-medium hover:bg-blue-50 transition"
          >
            <a href="/pages/Login">Login</a>
          </Button>
      </div>
    </div>
  );
}