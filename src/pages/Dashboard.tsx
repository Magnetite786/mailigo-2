
import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmailForm from "@/components/email/EmailForm";
import { useAuth } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Terminal } from "lucide-react";

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
        
        <Alert className="mb-8 border-amber-500">
          <Terminal className="h-4 w-4" />
          <AlertTitle>How to run the email server</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>To send actual emails, you need to run the Node.js server locally. Follow these steps:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Download the project code (click on GitHub button in the top-right)</li>
              <li>Open a terminal in the project directory</li>
              <li>Run <code className="bg-muted px-1 py-0.5 rounded">npm install</code> to install dependencies</li>
              <li>Run <code className="bg-muted px-1 py-0.5 rounded">node server.js</code> to start the email server</li>
              <li>The server should be running on port 3001</li>
            </ol>
            <p className="text-sm mt-2">
              Remember: You'll need a Gmail account with app password enabled for authentication.
              <a 
                href="https://support.google.com/accounts/answer/185833" 
                target="_blank" 
                rel="noreferrer"
                className="underline ml-1"
              >
                Learn how to create an app password
              </a>
            </p>
          </AlertDescription>
        </Alert>
        
        <EmailForm />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
