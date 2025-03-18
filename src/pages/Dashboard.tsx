import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmailForm from "@/components/email/EmailForm";
import EmailHistory, { EmailHistoryItem } from "@/components/email/EmailHistory";
import { useAuth } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Terminal, Mail, Users, Clock, CheckCircle, ShieldCheck, Plus, History, Settings, Trash2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  getEmailHistory, 
  deleteEmailHistory, 
  getUserSettings, 
  saveUserSettings,
  getEmailStats,
  handleConnectionIssues,
  UserSettings,
  saveEmailHistory,
  getCachedHistory
} from "@/lib/firebaseServices";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalEmails: 0,
    totalRecipients: 0,
    successRate: "0",
    avgDeliveryTime: "0s"
  });
  const [settings, setSettings] = useState<UserSettings>({
    appPassword: "",
    batchSize: 10,
    delayBetweenBatches: 1
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newAppPassword, setNewAppPassword] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("compose");
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online!");
      loadData(); // Reload data when back online
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You're offline. Some features may be limited.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    if (!user?.uid) {
      console.warn('Cannot load data: No user ID available');
      return;
    }
    
    console.log('Loading dashboard data for user:', user.uid);
    setDataLoading(true);
    
    try {
      // Start by clearing the cache to ensure fresh data
      if (typeof window !== 'undefined') {
        try {
          console.log('Clearing cache before loading fresh data');
          if ('cachedStats' in window) window.cachedStats = null;
          if ('cachedHistory' in window) window.cachedHistory = null;
        } catch (e) {
          console.warn('Failed to clear cache:', e);
        }
      }
      
      console.log('Fetching all data from Firebase...');
      
      // Force online mode to ensure fresh data
      try {
        await handleConnectionIssues(true); // Force online
        console.log('Forced online mode for data fetching');
      } catch (error) {
        console.warn('Could not force online mode:', error);
      }
      
      // Load settings and stats, but use real-time listener for history
      console.log('Starting data fetching for settings and stats');
      const [userSettings, emailStats] = await Promise.all([
        getUserSettings(user.uid).catch(error => {
          console.warn("Could not load user settings:", error);
          toast.error("Could not load settings", {
            description: "Using default settings instead"
          });
          return settings; // Use current settings as fallback
        }),
        getEmailStats(user.uid).catch(error => {
          console.warn("Could not load email stats:", error);
          toast.error("Could not load statistics", {
            description: "Using default statistics instead"
          });
          return stats; // Use current stats as fallback
        })
      ]);
      
      console.log('Data received from Firebase:', {
        settingsReceived: !!userSettings,
        statsReceived: !!emailStats
      });
      
      // Update state with loaded data
      setSettings(userSettings);
      setStats(emailStats);
      
      // Get email history with real-time updates
      console.log('Setting up real-time listener for email history');
      getEmailHistory(user.uid, true, (history) => {
        console.log('Received real-time history update:', history.length, 'items');
        setEmailHistory(history || []);
        
        // Save history in localStorage as backup
        try {
          localStorage.setItem('lastEmailHistory', JSON.stringify({
            userId: user.uid,
            timestamp: new Date().toISOString(),
            count: history.length
          }));
        } catch (e) {
          console.warn('Failed to save history info to localStorage:', e);
        }
      });
      
      console.log("Dashboard data loaded successfully");
      
      // If no email history is currently available, check permissions
      const cachedHistory = getCachedHistory();
      if (!cachedHistory || cachedHistory.length === 0) {
        console.log('No cached email history found. Checking permissions...');
        try {
          // Test if we can write to the collection
          const testData = {
            subject: "_TEST_ENTRY_",
            recipients: 0,
            status: 'success' as const,
            body: "Test entry to verify permissions",
            fromEmail: user.email || "",
          };
          
          console.log('Creating test entry to verify Firebase permissions');
          const testId = await saveEmailHistory(user.uid, testData);
          
          if (testId) {
            console.log('Test entry created successfully with ID:', testId);
            // Delete the test entry
            await deleteEmailHistory(testId);
            console.log('Test entry deleted');
            
            // Show success message
            toast.success('Firebase permissions verified', {
              description: 'Your next email will be saved correctly'
            });
          }
        } catch (error) {
          console.error('Error testing Firebase permissions:', error);
          toast.error('Firebase permission issue detected', {
            description: 'Please check console for details'
          });
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data", {
        description: "Please check your internet connection",
        action: {
          label: "Retry",
          onClick: () => loadData()
        }
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Only load data when component mounts or user changes (not on every render)
  useEffect(() => {
    if (user?.uid) {
      console.log('Dashboard mounted or user changed - loading data for user:', user.uid);
      
      // Reset any existing data
      setEmailHistory([]);
      setStats({
        totalEmails: 0,
        totalRecipients: 0,
        successRate: "0",
        avgDeliveryTime: "0s"
      });
      
      // Try to recover email history from localStorage if available
      try {
        const savedHistoryInfo = localStorage.getItem('lastEmailHistory');
        if (savedHistoryInfo) {
          const historyInfo = JSON.parse(savedHistoryInfo);
          if (historyInfo.userId === user.uid && historyInfo.count > 0) {
            console.log('Found saved history info with', historyInfo.count, 'items from', new Date(historyInfo.timestamp).toLocaleString());
          }
        }
      } catch (e) {
        console.warn('Failed to check saved history info:', e);
      }
      
      // Load fresh data
      loadData();
      
      // Also set up an interval to periodically refresh data
      const intervalId = setInterval(() => {
        console.log('Auto-refreshing dashboard data');
        if (user?.uid) {
          // Only refresh settings and stats; history is handled by the real-time listener
          Promise.all([
            getUserSettings(user.uid),
            getEmailStats(user.uid)
          ]).then(([newSettings, newStats]) => {
            setSettings(newSettings);
            setStats(newStats);
          }).catch(error => {
            console.warn('Error in periodic refresh:', error);
          });
        }
      }, 60000); // Refresh every minute
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [user?.uid]);
  
  // Add another useEffect for additional data refreshing every 30 seconds
  useEffect(() => {
    if (!user?.uid) return;
    
    // Set up a timer to refresh data periodically
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log("Refreshing dashboard data automatically");
        loadData();
      }
    }, 30000); // Refresh every 30 seconds when tab is visible
    
    // Listen for visibility changes to refresh data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, refreshing data");
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.uid]);

  // If not logged in, redirect to login page
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveAppPassword = async () => {
    if (!user?.uid) return;
    
    try {
      const newSettings = {
        ...settings,
        appPassword: newAppPassword
      };
      const success = await saveUserSettings(user.uid, newSettings);
      
      if (success) {
        setSettings(newSettings);
        setShowPasswordDialog(false);
        toast.success('App password saved successfully');
      } else {
        toast.error("Could not save app password", {
          description: "Please try again later"
        });
      }
    } catch (error) {
      console.error("Error saving app password:", error);
      toast.error("Failed to save app password");
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const success = await deleteEmailHistory(id);
      
      if (success) {
        // Update local state immediately
        setEmailHistory(prev => {
          const newHistory = prev.filter(item => item.id !== id);
          
          // Also update stats
          updateStatsAfterDelete(prev.find(item => item.id === id));
          
          return newHistory;
        });
        
        toast.success('History item deleted');
      } else {
        toast.error("Could not delete history item", {
          description: "Please try again later"
        });
      }
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("Failed to delete history item");
    }
  };
  
  const updateStatsAfterDelete = (deletedItem?: EmailHistoryItem) => {
    if (!deletedItem) return;
    
    // Update stats locally (this is an approximation, will be refreshed on next load)
    setStats(prev => {
      const newTotalEmails = Math.max(0, prev.totalEmails - 1);
      const newTotalRecipients = Math.max(0, prev.totalRecipients - (deletedItem.recipients || 0));
      
      // Determine if the deleted email was successful based on:
      // 1. Status being 'success', OR
      // 2. All recipients were delivered (deliveredCount === recipients)
      const wasSuccessful = 
        deletedItem.status === 'success' || 
        (deletedItem.deliveredCount && deletedItem.deliveredCount === deletedItem.recipients);
      
      // Recalculate success rate based on current history minus the deleted item
      const remainingItems = emailHistory.filter(item => item.id !== deletedItem.id);
      const successCount = remainingItems.filter(item => 
        item.status === 'success' || 
        (item.deliveredCount && item.deliveredCount === item.recipients)
      ).length;
      
      const newSuccessRate = newTotalEmails > 0 
        ? (successCount / newTotalEmails * 100).toFixed(1)
        : "0";
      
      console.log('Stats update after delete:', {
        totalEmails: newTotalEmails,
        totalRecipients: newTotalRecipients,
        successCount,
        wasDeleted: wasSuccessful ? 'successful email' : 'failed email',
        newSuccessRate
      });
      
      const newStats = {
        totalEmails: newTotalEmails,
        totalRecipients: newTotalRecipients,
        successRate: newSuccessRate,
        avgDeliveryTime: prev.avgDeliveryTime
      };
      
      // Also update the cached stats in firebaseServices - safely access window
      try {
        if (typeof window !== 'undefined' && 'cachedStats' in window) {
          window.cachedStats = newStats;
        }
      } catch (error) {
        console.warn('Failed to update cached stats:', error);
      }
      
      return newStats;
    });
  };

  const handleSettingsChange = async (key: keyof UserSettings, value: string | number) => {
    if (!user?.uid) return;
    
    try {
      const newSettings = {
        ...settings,
        [key]: value
      };
      const success = await saveUserSettings(user.uid, newSettings);
      
      if (success) {
        setSettings(newSettings);
        toast.success('Settings updated');
      } else {
        toast.error("Could not save settings", {
          description: "Please try again later"
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };
  
  const handleRefreshData = () => {
    if (user?.uid) {
      toast.info("Refreshing data...");
      loadData();
    }
  };
  
  const toggleNetworkMode = async () => {
    try {
      const success = await handleConnectionIssues(isOnline);
      if (success) {
        setIsOnline(!isOnline);
        toast.success(isOnline ? "Switched to offline mode" : "Switched to online mode");
        loadData();
      }
    } catch (error) {
      console.error("Failed to toggle network mode:", error);
      toast.error("Failed to change network mode");
    }
  };
  
  // Handle email sent event - update the dashboard with new data without full refresh
  const handleEmailSent = async (success: boolean, data?: any) => {
    console.log('Email sent callback received:', { success, data });
    
    if (success && data) {
      console.log('Email sent successfully, updating dashboard with new data:', data);

      try {
        // Create new email history item
        const newEmailItem = {
          id: data.id,
          subject: data.subject,
          recipients: data.recipients,
          status: data.status,
          date: new Date().toISOString(),
          body: data.body,
          fromEmail: data.fromEmail,
          deliveredCount: data.deliveredCount,
          failedEmails: data.failedEmails,
          batchSize: data.batchSize,
          delayBetweenBatches: data.delayBetweenBatches
        };
        
        console.log('Adding new email item to history:', newEmailItem);
        
        // Update local state immediately
        setEmailHistory(prev => {
          const newHistory = [newEmailItem, ...prev];
          console.log('Updated email history:', newHistory.length, 'items');
          return newHistory;
        });
        
        // Also update the cached history
        try {
          if (typeof window !== 'undefined' && 'cachedHistory' in window) {
            console.log('Updating cached history in window object');
            window.cachedHistory = [newEmailItem, ...(window.cachedHistory || [])];
          }
        } catch (error) {
          console.warn('Failed to update cached history:', error);
        }
        
        // Update stats immediately
        setStats(prev => {
          const newTotalEmails = prev.totalEmails + 1;
          const newTotalRecipients = prev.totalRecipients + data.recipients;
          
          // Determine if this email was successful
          const wasSuccessful = 
            data.status === 'success' || 
            (data.deliveredCount && data.deliveredCount === data.recipients);
          
          // Calculate success rate
          const existingSuccessfulEmails = emailHistory.filter(item => 
            item.status === 'success' || 
            (item.deliveredCount && item.deliveredCount === item.recipients)
          ).length;
          
          const totalSuccessfulEmails = existingSuccessfulEmails + (wasSuccessful ? 1 : 0);
          const newSuccessRate = ((totalSuccessfulEmails / newTotalEmails) * 100).toFixed(1);
          
          console.log('Stats update:', {
            totalEmails: newTotalEmails,
            totalRecipients: newTotalRecipients,
            successfulEmails: totalSuccessfulEmails,
            wasSuccessful,
            newSuccessRate
          });
          
          const newStats = {
            totalEmails: newTotalEmails,
            totalRecipients: newTotalRecipients,
            successRate: newSuccessRate,
            avgDeliveryTime: prev.avgDeliveryTime
          };
          
          // Update cached stats
          try {
            if (typeof window !== 'undefined' && 'cachedStats' in window) {
              window.cachedStats = newStats;
            }
          } catch (error) {
            console.warn('Failed to update cached stats:', error);
          }
          
          return newStats;
        });
        
        // Switch to history tab to show the new email after a short delay
        setTimeout(() => {
          setActiveTab("history");
        }, 500);
        
        // Show success message
        toast.success(`Email campaign saved to history`);
        
        // Do a full reload of data after a delay to ensure Firebase data is properly fetched
        if (user?.uid) {
          console.log('Scheduling full data refresh in 3 seconds');
          setTimeout(() => {
            loadData();
          }, 3000);
        }
      } catch (error) {
        console.error('Error updating dashboard after email sent:', error);
        
        // If we encounter an error, do a full data reload
        if (user?.uid) {
          loadData();
        }
      }
    }
    else if (success) {
      console.log('Email sent successfully but no data provided, doing full refresh');
      // If we don't have data, do a full refresh immediately
      toast.info("Refreshing dashboard data...");
      loadData();
    } else {
      console.log('Email sending failed, no UI update needed');
    }
  };

  const statsCards = [
    {
      title: "Total Emails Sent",
      value: stats.totalEmails.toString(),
      icon: Mail,
      description: "Last 30 days"
    },
    {
      title: "Total Recipients",
      value: stats.totalRecipients.toString(),
      icon: Users,
      description: "Last 30 days"
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      description: "Last 30 days"
    },
    {
      title: "Avg. Delivery Time",
      value: stats.avgDeliveryTime,
      icon: Clock,
      description: "Last 30 days"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Connection Status Banner */}
        {!isOnline && (
          <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950">
            <WifiOff className="h-4 w-4 text-amber-500" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Some features may be limited until your connection is restored.</span>
              <Button variant="outline" size="sm" onClick={toggleNetworkMode}>
                <Wifi className="mr-2 h-4 w-4" />
                Try to reconnect
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.email?.split('@')[0]}
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your email campaigns
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            disabled={dataLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {dataLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        stat.value
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="history">Email History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose New Email</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailForm 
                  storedAppPassword={settings.appPassword}
                  storedGmailAddress={user?.email || null}
                  onEmailSent={handleEmailSent}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Email History</CardTitle>
                {dataLoading && <span className="text-sm text-muted-foreground">Loading...</span>}
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
                    <p>Loading email history...</p>
                  </div>
                ) : (
                  <EmailHistory 
                    history={emailHistory}
                    onDelete={handleDeleteHistoryItem}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* App Password Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Gmail App Password</h4>
                        <p className="text-sm text-muted-foreground">
                          {settings.appPassword ? 'Password is stored' : 'No password stored'}
                        </p>
                      </div>
                      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                        <DialogTrigger asChild>
                          <Button variant={settings.appPassword ? "outline" : "default"}>
                            {settings.appPassword ? 'Update Password' : 'Add Password'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Store App Password</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="appPassword">Gmail App Password</Label>
                              <Input
                                id="appPassword"
                                type="password"
                                value={newAppPassword}
                                onChange={(e) => setNewAppPassword(e.target.value)}
                                placeholder="Enter your Gmail app password"
                              />
                            </div>
                            <Button onClick={handleSaveAppPassword} className="w-full">
                              Save Password
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Other Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Batch Size</p>
                          <p className="text-sm text-muted-foreground">
                            Number of emails sent per batch
                          </p>
                        </div>
                        <Input 
                          type="number" 
                          value={settings.batchSize}
                          onChange={(e) => handleSettingsChange('batchSize', parseInt(e.target.value))}
                          className="w-24" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Delay Between Batches</p>
                          <p className="text-sm text-muted-foreground">
                            Seconds to wait between sending batches
                          </p>
                        </div>
                        <Input 
                          type="number" 
                          value={settings.delayBetweenBatches}
                          onChange={(e) => handleSettingsChange('delayBetweenBatches', parseInt(e.target.value))}
                          className="w-24" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
