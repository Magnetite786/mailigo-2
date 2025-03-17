
import { Navigate } from "react-router-dom";
import { Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmailForm from "@/components/email/EmailForm";
import { useAuth } from "@/lib/firebase";

const Dashboard = () => {
  const { user, loading } = useAuth();

  // If not logged in, redirect to login page
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>
          {user && (
            <p className="text-muted-foreground">
              Welcome, {user.email}
            </p>
          )}
        </div>
        
        <EmailForm />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
