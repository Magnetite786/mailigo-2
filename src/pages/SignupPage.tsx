
import { Navigate } from "react-router-dom";
import SignupForm from "@/components/auth/SignupForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/lib/firebase";

const SignupPage = () => {
  const { user, loading } = useAuth();

  // If already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;
