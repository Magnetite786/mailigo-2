import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { Mail, LogOut, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate("/login");
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out",
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white shadow-sm">
      <div className="container flex h-14 items-center px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block text-xl">
            Bulk Mail
          </span>
        </Link>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center space-x-1">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              onClick={() => navigate("/dashboard")}
              className={isActive("/dashboard") ? "bg-primary text-white" : "hover:bg-primary/10"}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="hover:bg-primary/10"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
