import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Mail,
  Send,
  History,
  Settings,
  Users,
  TestTube2,
  AlarmCheck,
  UserRound,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  onLogout?: () => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  variant: "default" | "ghost";
  value?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success";
}

const Sidebar = ({ user, onLogout, isOpen: controlledIsOpen, setIsOpen: setControlledIsOpen, onTabChange, activeTab }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [internalIsOpen, setInternalIsOpen] = useState(!isMobile);
  
  // Use either controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = setControlledIsOpen || setInternalIsOpen;

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      variant: activeTab === "overview" ? "default" : "ghost",
      value: "overview"
    },
    {
      title: "Compose Email",
      href: "/dashboard?tab=compose",
      icon: <Send className="h-5 w-5" />,
      variant: activeTab === "compose" ? "default" : "ghost",
      value: "compose"
    },
    {
      title: "A/B Testing",
      href: "/dashboard?tab=ab-testing",
      icon: <TestTube2 className="h-5 w-5" />,
      variant: activeTab === "ab-testing" ? "default" : "ghost",
      value: "ab-testing",
      badge: "New",
      badgeVariant: "success"
    },
    {
      title: "Scheduled",
      href: "/dashboard?tab=scheduled",
      icon: <AlarmCheck className="h-5 w-5" />,
      variant: activeTab === "scheduled" ? "default" : "ghost",
      value: "scheduled",
      badge: "3",
      badgeVariant: "secondary"
    },
    {
      title: "Personalization",
      href: "/dashboard?tab=personalize",
      icon: <UserRound className="h-5 w-5" />,
      variant: activeTab === "personalize" ? "default" : "ghost",
      value: "personalize"
    },
    {
      title: "Analytics",
      href: "/dashboard?tab=analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      variant: activeTab === "analytics" ? "default" : "ghost",
      value: "analytics"
    },
    {
      title: "History",
      href: "/dashboard?tab=history",
      icon: <History className="h-5 w-5" />,
      variant: activeTab === "history" ? "default" : "ghost",
      value: "history"
    },
    {
      title: "Templates",
      href: "/dashboard?tab=templates",
      icon: <FileText className="h-5 w-5" />,
      variant: activeTab === "templates" ? "default" : "ghost",
      value: "templates"
    },
    {
      title: "Settings",
      href: "/dashboard?tab=config",
      icon: <Settings className="h-5 w-5" />,
      variant: activeTab === "config" ? "default" : "ghost",
      value: "config"
    }
  ];

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, item: SidebarItem) => {
    e.preventDefault();
    if (onTabChange && item.value) {
      onTabChange(item.value);
    }
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white border-r transition-all duration-300 overflow-y-auto",
          isOpen ? "w-64" : "w-0 md:w-16",
          "md:transition-width"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header/Logo */}
          <div className={cn(
            "flex items-center p-4 border-b h-16",
            !isOpen && "md:justify-center"
          )}>
            <Mail className="h-6 w-6 text-primary" />
            {isOpen && (
              <span className="ml-2 font-bold text-lg">MaiiGo</span>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-6">
            <nav className="px-2 space-y-1">
              {sidebarItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={(e) => handleItemClick(e, item)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isOpen ? "justify-start" : "md:justify-center",
                    item.variant === "default"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  {isOpen && (
                    <span className="ml-3 whitespace-nowrap">{item.title}</span>
                  )}
                  {isOpen && item.badge && (
                    <Badge 
                      variant={item.badgeVariant || "default"} 
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          {user && (
            <div 
              className={cn(
                "p-4 border-t flex items-center",
                !isOpen && "md:justify-center"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image} />
                <AvatarFallback>
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isOpen && (
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                </div>
              )}
              {isOpen && onLogout && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="ml-auto"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar; 