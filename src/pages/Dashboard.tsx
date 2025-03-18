import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, Users, CheckCircle, Clock, RefreshCcw, Send, History, Cog, Eye, Trash } from "lucide-react";
import EmailForm from "@/components/email/EmailForm";
import EmailHistory from "@/components/email/EmailHistory";
import EmailConfigForm from "@/components/email/EmailConfigForm";
import Navbar from "@/components/layout/Navbar";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

export default function Dashboard() {
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
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto pt-20 pb-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your email campaigns
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadDashboardData}
            className="hover:bg-gray-100"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEmails}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recipients</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</div>
              <p className="text-xs text-muted-foreground">Total reached</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Delivery rate</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime}s</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white shadow-sm p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="compose" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Send className="w-4 h-4 mr-2" />
              Compose Email
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Email History
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Cog className="w-4 h-4 mr-2" />
              Email Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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

          <TabsContent value="config">
            <EmailConfigForm />
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
      </main>
    </div>
  );
}
