
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, logout } from "@/lib/firebase";
import { Mail, Menu, X, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out",
      });
    }
  };

  const navLinks = [
    { title: "Home", path: "/" },
    { title: "Features", path: "/#features" },
    { title: "Pricing", path: "/#pricing" },
  ];

  return (
    <nav className="border-b fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">BulkMailer</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.title} 
              to={link.path} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.title}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="gradient-bg">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-6 mt-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.title} 
                    to={link.path} 
                    className="text-foreground text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.title}
                  </Link>
                ))}
                
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-foreground text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="justify-start p-0 h-auto font-normal text-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to="/login"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button className="w-full gradient-bg">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
