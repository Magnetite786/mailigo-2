import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, Users, CheckCircle, Clock, RefreshCcw, Send, History, Cog, Eye, Trash, UserRound, TestTube2, BrainCircuit, LayoutDashboard, BarChart3, FileText, Settings, Home, Menu, X, LogOut, Gauge } from "lucide-react";
import EmailForm from "@/components/email/EmailForm";
import EmailHistory from "@/components/email/EmailHistory";
import EmailConfigForm from "@/components/email/EmailConfigForm";
import { EmailHealthScorePredictor } from "@/components/email/EmailHealthScorePredictor";
import Navbar from "@/components/layout/Navbar";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ScheduledEmails from "@/components/email/ScheduledEmails";
import { AlarmCheck } from "lucide-react";
import EmailPersonalizer from "@/components/email/EmailPersonalizer";
import ABTesting from "@/components/email/ABTesting";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import EmailAssistant from "@/components/email/EmailAssistant";
import { useAuth } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailRecord {
  id: string;
  subject: string;
  content: string;
  total_recipients: number;
  delivered_count: number;
  status: string;
  from_email: string;
  created_at: string;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  variant: "default" | "ghost";
  value: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success";
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState({
    totalEmails: 0,
    totalRecipients: 0,
    successRate: 0,
    avgDeliveryTime: 2.3,
  });
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: emailsData, error: emailsError } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (emailsError) throw emailsError;

      setEmails(emailsData || []);

      if (emailsData) {
        const totalEmails = emailsData.length;
        const totalRecipients = emailsData.reduce((sum, email) => sum + email.total_recipients, 0);
        const successfulDeliveries = emailsData.reduce((sum, email) => sum + email.delivered_count, 0);
        const successRate = totalRecipients > 0 
          ? (successfulDeliveries / totalRecipients) * 100 
          : 0;

        setStats({
          totalEmails,
          totalRecipients,
          successRate,
          avgDeliveryTime: 2.3,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", emailId);

      if (error) throw error;
      loadDashboardData();
      toast({
        title: "Email deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({
        variant: "destructive",
        title: "Error deleting email",
        description: "There was an error deleting the email",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "success" | "destructive" | "secondary" } = {
      success: "success",
      failed: "destructive",
      pending: "secondary",
      completed: "success",
    };

    return (
      <Badge variant={variants[status.toLowerCase()] || "default"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
      title: "AI Assistant",
      href: "/dashboard?tab=assistant",
      icon: <BrainCircuit className="h-5 w-5" />,
      variant: activeTab === "assistant" ? "default" : "ghost",
      value: "assistant",
      badge: "New",
      badgeVariant: "success"
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
      href: "/dashboard?tab=settings",
      icon: <Settings className="h-5 w-5" />,
      variant: activeTab === "settings" ? "default" : "ghost",
      value: "settings"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="container flex h-14 items-center gap-4">
          <Button 
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            <span className="font-semibold">MailiGo</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[61px]">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <Mail className="h-6 w-6" />
                <span>MailiGo</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid gap-1 px-2">
                {sidebarItems.map((item, index) => (
                  <Button
                    key={index}
                    variant={activeTab === item.value ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 font-normal",
                      activeTab === item.value && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      handleTabChange(item.value);
                      if (isMobile) setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant={item.badgeVariant} className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <UserRound className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="ml-auto"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden lg:block">
            <div className="container flex h-14 items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex-1" />
              <nav className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.reload()}
                  title="Refresh"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLogout()}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'compose' && 'Compose Email'}
                {activeTab === 'ab-testing' && 'A/B Testing'}
                {activeTab === 'scheduled' && 'Scheduled Emails'}
                {activeTab === 'personalization' && 'Smart Personalization'}
                {activeTab === 'analytics' && 'Analytics & Reports'}
                {activeTab === 'ai-assistant' && 'AI Assistant'}
                {activeTab === 'history' && 'Email History'}
                {activeTab === 'templates' && 'Email Templates'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="hidden">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="compose">Compose</TabsTrigger>
                <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="personalization">Personalization</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                      <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold">{stats.totalEmails}</div>
                      <p className="text-xs text-muted-foreground">
                        Total campaigns sent
                      </p>
            </CardContent>
          </Card>
                  <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold">{stats.totalRecipients}</div>
                      <p className="text-xs text-muted-foreground">
                        Recipients reached
                      </p>
            </CardContent>
          </Card>
                  <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold">
                {stats.successRate.toFixed(1)}%
              </div>
                      <p className="text-xs text-muted-foreground">
                        Average delivery rate
                      </p>
            </CardContent>
          </Card>
                  <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                      <div className="text-2xl font-bold">{stats.avgDeliveryTime}s</div>
                      <p className="text-xs text-muted-foreground">
                        Average sending time
                      </p>
            </CardContent>
          </Card>
        </div>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest email campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emails.slice(0, 5).map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium truncate">{email.subject}</h3>
                          {getStatusBadge(email.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="inline-block mr-4">
                            From: {email.from_email}
                          </span>
                          <span className="inline-block mr-4">
                            Recipients: {email.total_recipients}
                          </span>
                          <span className="inline-block">
                            {format(new Date(email.created_at), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                  </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-100"
                        onClick={() => setSelectedEmail(email)}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                  </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose">
                <div className="space-y-4">
                  <Card className="bg-white shadow-sm mb-4">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>Email Health Score™</CardTitle>
                        <CardDescription>
                          Analyze your email before sending to maximize deliverability and engagement
                        </CardDescription>
                      </div>
                      <Button 
                        variant="default" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          const dialog = document.getElementById("health-score-dialog") as HTMLDialogElement;
                          if (dialog) dialog.showModal();
                        }}
                      >
                        <Gauge className="mr-2 h-4 w-4" />
                        Analyze Email Health
                      </Button>
                    </CardHeader>
                  </Card>
                  
                  <dialog id="health-score-dialog" className="modal bg-transparent backdrop:bg-black/50 w-full max-w-5xl rounded-lg p-0">
                    <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                      <div className="p-4 flex justify-between items-center border-b">
                        <h3 className="text-lg font-semibold">Email Health Score™ Predictor</h3>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const dialog = document.getElementById("health-score-dialog") as HTMLDialogElement;
                            if (dialog) dialog.close();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <EmailHealthScorePredictor />
                      </div>
                    </div>
                  </dialog>
                  
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Compose New Email</CardTitle>
                <CardDescription>
                  Create and send a new email campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailForm />
              </CardContent>
            </Card>
                </div>
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                <ScheduledEmails />
              </TabsContent>

              <TabsContent value="personalization" className="space-y-4">
                <EmailPersonalizer 
                  emailContent={selectedEmail?.content || ""}
                  onApplyPersonalization={(content) => {
                    // In a real app, you would update the email content in the database
                    toast({
                      title: "Personalization applied",
                      description: "Your email has been updated with personalization variables",
                    });
                  }}
                />
              </TabsContent>

              <TabsContent value="ab-testing" className="space-y-4">
                <ABTesting />
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Email History</CardTitle>
                <CardDescription>
                  View and manage your sent emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium truncate">{email.subject}</h3>
                          {getStatusBadge(email.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="inline-block mr-4">
                            From: {email.from_email}
                          </span>
                          <span className="inline-block mr-4">
                            Recipients: {email.total_recipients}
                          </span>
                          <span className="inline-block">
                            {format(new Date(email.created_at), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-gray-100"
                          onClick={() => setSelectedEmail(email)}
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-50 text-red-600"
                          onClick={() => handleDelete(email.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

              <TabsContent value="settings">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and email configurations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue="email" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="email">Email Settings</TabsTrigger>
                          <TabsTrigger value="account">Account Settings</TabsTrigger>
                        </TabsList>
                        <TabsContent value="email" className="space-y-4">
            <EmailConfigForm />
                        </TabsContent>
                        <TabsContent value="account" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Account Information</CardTitle>
                              <CardDescription>
                                View and update your account details.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input value={user?.email || ''} readOnly />
                                </div>
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input value={user?.name || 'User'} readOnly />
                                </div>
                                <div className="flex justify-between items-center">
                                  <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-assistant">
                <EmailAssistant 
                  onApplySuggestion={(type, content) => {
                    // Handle applying suggestions
                    toast({
                      title: "Suggestion applied",
                      description: `The ${type} suggestion has been applied to your email.`,
                    });
                  }}
                />
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Campaign Details</DialogTitle>
              <DialogDescription>
                View the details of your email campaign
              </DialogDescription>
            </DialogHeader>
            {selectedEmail && (
              <div className="space-y-6 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Overview</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Subject:</span>{" "}
                        {selectedEmail.subject}
                      </div>
                      <div>
                        <span className="text-muted-foreground">From:</span>{" "}
                        {selectedEmail.from_email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>{" "}
                        {format(new Date(selectedEmail.created_at), "dd/MM/yyyy HH:mm")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {getStatusBadge(selectedEmail.status)}
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Delivery Stats</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Total Recipients:</span>{" "}
                        <span className="text-gray-900">{selectedEmail.total_recipients}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivered:</span>{" "}
                        <span className="text-green-600">{selectedEmail.delivered_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>{" "}
                        <span className="text-red-600">
                          {selectedEmail.total_recipients - selectedEmail.delivered_count}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Email Content Preview</h4>
                  <div
                    className="max-h-[50vh] overflow-y-auto rounded-lg bg-white p-4"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                  />
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
          </div>
      </main>
      </div>
    </div>
  );
}
