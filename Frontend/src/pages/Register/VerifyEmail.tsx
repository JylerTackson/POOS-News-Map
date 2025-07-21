import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "@/api";
import { CheckCircle, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Main content card */}
        <div className="relative bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-500 hover:scale-105">
          {/* Success icon with animation */}
          <div className="relative inline-block">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
          </div>

          {/* Success message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Email Verified!
          </h1>
          
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 rounded-full"></div>
          
          <p className="text-gray-600 mb-6">
            Your email address has been successfully verified.
          </p>

          {/* NewsMap branding */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Welcome to NewsMap! 🗺️
            </p>
            <p className="text-xs text-gray-500">
              Your gateway to global news at your fingertips
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              You can now close this tab and return to the main site to log in with your verified account.
            </p>
          </div>

          {/* Decorative footer */}
          <div className="mt-8 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}