import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ChartContainer, LineChart, BarChart, PieChart, ChartTooltip } from "@/components/ui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Calendar, 
  Loader2,
  Users,
  Mail,
  MailCheck,
  User
} from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface EmailStat {
  date: string;
  sent: number;
  delivered: number;
  opened?: number;
  clicked?: number;
}

const EmailAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [emailStats, setEmailStats] = useState<EmailStat[]>([]);
  const [totalEmails, setTotalEmails] = useState(0);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [deliveryRate, setDeliveryRate] = useState(0);
  const [showProjected, setShowProjected] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    loadEmailStats();
  }, []);

  const loadEmailStats = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch this data from your backend
      // Here we're generating sample data for demonstration
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: emailsData, error } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate daily stats from the last 14 days
      const today = new Date();
      const twoWeeksAgo = subDays(today, 14);
      
      const interval = eachDayOfInterval({
        start: twoWeeksAgo,
        end: today
      });

      // Calculate overall stats
      const totalEmailCount = emailsData?.length || 0;
      const recipientCount = emailsData?.reduce((sum, email) => sum + email.total_recipients, 0) || 0;
      const deliveredCount = emailsData?.reduce((sum, email) => sum + email.delivered_count, 0) || 0;
      const calculatedDeliveryRate = recipientCount > 0 ? (deliveredCount / recipientCount) * 100 : 0;
      
      setTotalEmails(totalEmailCount);
      setTotalRecipients(recipientCount);
      setDeliveryRate(calculatedDeliveryRate);

      // Generate stats for each day
      const dailyStats = interval.map(date => {
        const dateString = format(date, "yyyy-MM-dd");
        
        // Find emails sent on this date
        const dayEmails = emailsData?.filter(email => {
          const emailDate = new Date(email.created_at);
          return format(emailDate, "yyyy-MM-dd") === dateString;
        }) || [];
        
        const sent = dayEmails.length;
        const delivered = dayEmails.reduce((sum, email) => sum + email.delivered_count, 0);
        
        // Simulate some opened/clicked data for visualization
        const opened = Math.floor(delivered * (0.3 + Math.random() * 0.4)); // 30-70% open rate
        const clicked = Math.floor(opened * (0.1 + Math.random() * 0.3)); // 10-40% click rate of opens
        
        return {
          date: dateString,
          sent,
          delivered,
          opened,
          clicked
        };
      });

      setEmailStats(dailyStats);
    } catch (error) {
      console.error("Error loading email stats:", error);
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for daily stats
  const prepareChartData = () => {
    if (emailStats.length === 0) return { daily: [], weekly: [], monthly: [] };

    // Daily data is already prepared
    const daily = emailStats.map(stat => ({
      date: format(new Date(stat.date), "MMM dd"),
      sent: stat.sent,
      delivered: stat.delivered,
      opened: stat.opened || 0,
      clicked: stat.clicked || 0,
      projected: showProjected ? Math.floor((stat.delivered || 0) * 1.2) : undefined
    }));

    // Weekly data (aggregate by week)
    const weekly = [];
    for (let i = 0; i < emailStats.length; i += 7) {
      const weekStats = emailStats.slice(i, Math.min(i + 7, emailStats.length));
      if (weekStats.length > 0) {
        const startDate = format(new Date(weekStats[0].date), "MMM dd");
        const endDate = format(new Date(weekStats[weekStats.length - 1].date), "MMM dd");
        
        weekly.push({
          date: `${startDate} - ${endDate}`,
          sent: weekStats.reduce((sum, stat) => sum + stat.sent, 0),
          delivered: weekStats.reduce((sum, stat) => sum + stat.delivered, 0),
          opened: weekStats.reduce((sum, stat) => sum + (stat.opened || 0), 0),
          clicked: weekStats.reduce((sum, stat) => sum + (stat.clicked || 0), 0)
        });
      }
    }

    // Monthly data (just the total in this demo)
    const monthly = [{
      date: format(new Date(), "MMMM yyyy"),
      sent: emailStats.reduce((sum, stat) => sum + stat.sent, 0),
      delivered: emailStats.reduce((sum, stat) => sum + stat.delivered, 0),
      opened: emailStats.reduce((sum, stat) => sum + (stat.opened || 0), 0),
      clicked: emailStats.reduce((sum, stat) => sum + (stat.clicked || 0), 0)
    }];

    return { daily, weekly, monthly };
  };

  const chartData = prepareChartData();

  // Get current data based on selected tab
  const currentData = chartData[activeTab as keyof typeof chartData] || [];

  // Calculate success metrics
  const calculateSuccessMetrics = () => {
    const totalSent = emailStats.reduce((sum, stat) => sum + stat.sent, 0);
    const totalDelivered = emailStats.reduce((sum, stat) => sum + stat.delivered, 0);
    const totalOpened = emailStats.reduce((sum, stat) => sum + (stat.opened || 0), 0);
    const totalClicked = emailStats.reduce((sum, stat) => sum + (stat.clicked || 0), 0);

    return {
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
    };
  };

  const metrics = calculateSuccessMetrics();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Email Analytics</h2>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <Label htmlFor="show-projected" className="text-sm">
            Show Projected Growth
          </Label>
          <Switch
            id="show-projected"
            checked={showProjected}
            onCheckedChange={setShowProjected}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmails}</div>
                <p className="text-xs text-muted-foreground">
                  Campaigns sent in the last 14 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRecipients}</div>
                <p className="text-xs text-muted-foreground">
                  Total recipients reached
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                <MailCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Successfully delivered emails
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Average email open rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="daily">
                    <Calendar className="h-4 w-4 mr-2" />
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="weekly">
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger value="monthly">
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Sent</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Delivered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">Opened</span>
                  </div>
                  {showProjected && (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Projected</span>
                    </div>
                  )}
                </div>
              </div>

              <TabsContent value="daily" className="mt-0">
                <div className="h-[300px]">
                  <ChartContainer>
                    <LineChart
                      data={chartData.daily}
                      categories={showProjected ? ['sent', 'delivered', 'opened', 'projected'] : ['sent', 'delivered', 'opened']}
                      index="date"
                      colors={['blue', 'green', 'amber', 'purple']}
                      valueFormatter={(value) => `${value} emails`}
                      showLegend={false}
                      showAnimation={true}
                    />
                  </ChartContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="weekly" className="mt-0">
                <div className="h-[300px]">
                  <ChartContainer>
                    <BarChart
                      data={chartData.weekly}
                      categories={['sent', 'delivered', 'opened']}
                      index="date"
                      colors={['blue', 'green', 'amber']}
                      valueFormatter={(value) => `${value} emails`}
                      showLegend={false}
                    />
                  </ChartContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-0">
                <div className="h-[300px]">
                  <ChartContainer>
                    <PieChart
                      data={[
                        { name: 'Delivered', value: metrics.deliveryRate },
                        { name: 'Opened', value: metrics.openRate },
                        { name: 'Clicked', value: metrics.clickRate },
                      ]}
                      category="value"
                      index="name"
                      colors={['green', 'amber', 'red']}
                      valueFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                  </ChartContainer>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">{metrics.deliveryRate.toFixed(1)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(metrics.deliveryRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics.deliveryRate > 95 
                    ? "Excellent delivery rate!" 
                    : metrics.deliveryRate > 85
                    ? "Good delivery rate"
                    : "Needs improvement"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open Rate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">{metrics.openRate.toFixed(1)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(metrics.openRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics.openRate > 25 
                    ? "Excellent open rate!" 
                    : metrics.openRate > 15
                    ? "Good open rate"
                    : "Needs improvement"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Click Rate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold mb-2">{metrics.clickRate.toFixed(1)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-amber-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(metrics.clickRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics.clickRate > 5 
                    ? "Excellent click rate!" 
                    : metrics.clickRate > 2
                    ? "Good click rate"
                    : "Needs improvement"}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailAnalytics; 