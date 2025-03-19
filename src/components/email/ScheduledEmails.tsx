import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ScheduledEmail {
  id: string;
  subject: string;
  recipients: number;
  scheduledTime: string;
  status: string;
  sentAt: string | null;
  deliveredCount: number;
}

const ScheduledEmails = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    loadScheduledEmails();
  }, []);

  const loadScheduledEmails = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(`http://localhost:3001/api/scheduled-emails?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled emails");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setScheduledEmails(data.scheduledEmails || []);
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error loading scheduled emails:", error);
      toast({
        title: "Error loading scheduled emails",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (email: ScheduledEmail) => {
    setSelectedEmail(email);
    setShowDetails(true);
  };

  const handleCancelEmail = async (id: string) => {
    setCancelingId(id);
    try {
      const response = await fetch(`http://localhost:3001/api/scheduled-emails/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Email cancelled",
          description: "The scheduled email has been cancelled successfully",
        });
        
        // Update the UI
        setScheduledEmails(scheduledEmails.filter(email => email.id !== id));
      } else {
        throw new Error(data.message || "Failed to cancel email");
      }
    } catch (error) {
      console.error("Error cancelling email:", error);
      toast({
        title: "Error cancelling email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "success" | "destructive" | "secondary" | "outline" } = {
      scheduled: "secondary",
      sending: "default",
      success: "success",
      partial: "secondary",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status.toLowerCase()] || "outline"}>
        {status === "scheduled" ? "Scheduled" : 
         status === "sending" ? "Sending" :
         status === "success" ? "Delivered" :
         status === "partial" ? "Partially Delivered" :
         status === "failed" ? "Failed" : status}
      </Badge>
    );
  };

  const formatScheduledTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "PPP 'at' p");
    } catch (error) {
      return timeString || "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Scheduled Emails</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadScheduledEmails}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading scheduled emails...</span>
          </div>
        ) : scheduledEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No scheduled emails found</p>
            <p className="text-sm mt-2">Scheduled emails will appear here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium truncate max-w-[150px]">
                    {email.subject}
                  </TableCell>
                  <TableCell>{email.recipients}</TableCell>
                  <TableCell className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatScheduledTime(email.scheduledTime)}
                  </TableCell>
                  <TableCell>{getStatusBadge(email.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(email)}
                      >
                        Details
                      </Button>
                      
                      {email.status === "scheduled" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={cancelingId === email.id}
                            >
                              {cancelingId === email.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Scheduled Email</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this scheduled email? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelEmail(email.id)}
                              >
                                Yes, Cancel Email
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scheduled Email Details</DialogTitle>
            <DialogDescription>
              Details of your scheduled email
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm">Subject</h4>
                  <p className="text-sm">{selectedEmail.subject}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Status</h4>
                  <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm">Recipients</h4>
                  <p className="text-sm">{selectedEmail.recipients}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Scheduled For</h4>
                  <p className="text-sm">{formatScheduledTime(selectedEmail.scheduledTime)}</p>
                </div>
              </div>
              
              {selectedEmail.status !== "scheduled" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm">Sent At</h4>
                    <p className="text-sm">
                      {selectedEmail.sentAt 
                        ? formatScheduledTime(selectedEmail.sentAt)
                        : "Not sent yet"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Delivery Count</h4>
                    <p className="text-sm">
                      {selectedEmail.deliveredCount} of {selectedEmail.recipients}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            
            {selectedEmail && selectedEmail.status === "scheduled" && (
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowDetails(false);
                  handleCancelEmail(selectedEmail.id);
                }}
              >
                Cancel Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ScheduledEmails; 