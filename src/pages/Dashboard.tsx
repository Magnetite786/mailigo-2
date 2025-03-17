
import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmailForm from "@/components/email/EmailForm";
import { useAuth } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();

  // If not logged in, redirect to login page
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-16 md:py-24">
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
        
        <Alert className="mb-8">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Server Setup Required</AlertTitle>
          <AlertDescription>
            To send actual emails, start the Node.js server with <code>node server.js</code> in your terminal.
            Make sure the server is running on localhost:3001 or update the SERVER_URL in emailService.ts.
            You'll need a Gmail account with app password enabled for authentication.
          </AlertDescription>
        </Alert>
        
        <EmailForm />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
