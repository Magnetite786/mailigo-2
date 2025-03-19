import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "@/components/auth/SignupForm";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 lg:gap-0">
      {/* Left side - Branding */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="relative z-10 flex flex-col p-12 text-white">
          <div className="flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            MailiGo
          </div>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Join thousands of users who trust MailiGo for their email campaigns.
              </p>
            </blockquote>
          </div>
        </div>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-sm" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
      </div>

      {/* Right side - Signup Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
