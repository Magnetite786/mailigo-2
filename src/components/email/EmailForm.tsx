import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendEmails } from "@/lib/emailService";
import { Loader2, Send, Plus, X, AlertTriangle, Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmailUploader from "./EmailUploader";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { saveEmailHistory } from "@/lib/firebaseServices";
import { useAuth } from "@/lib/firebase";

type EmailFormProps = {
  storedAppPassword?: string | null;
  storedGmailAddress?: string | null;
  onEmailSent?: (success: boolean, data?: any) => void;
};

interface EmailResponse {
  success: boolean;
  message: string;
  status: 'success' | 'failed' | 'partial';
  results?: any[];
  failedEmails?: string[];
}

const EmailForm: React.FC<EmailFormProps> = ({ 
  storedAppPassword, 
  storedGmailAddress,
  onEmailSent 
}) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [gmailAddress, setGmailAddress] = useState(storedGmailAddress || "");
  const [appPassword, setAppPassword] = useState(storedAppPassword || "");
  const [manualEmail, setManualEmail] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Added for rate limiting
  const [batchSize, setBatchSize] = useState(10);
  const [delayBetweenBatches, setDelayBetweenBatches] = useState(1);

  const handleEmailsAdded = (emails: string[]) => {
    // Filter out duplicates
    const newEmails = emails.filter(email => !emailList.includes(email));
    setEmailList(prev => [...prev, ...newEmails]);
    
    toast({
      title: "Emails added",
      description: `${newEmails.length} new emails added to the list.`,
    });
  };

  const addManualEmail = () => {
    if (!manualEmail) return;
    
    // Simple email validation
    if (!manualEmail.includes('@') || !manualEmail.includes('.')) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    if (!emailList.includes(manualEmail)) {
      setEmailList(prev => [...prev, manualEmail]);
      setManualEmail("");
    } else {
      toast({
        variant: "destructive",
        title: "Duplicate email",
        description: "This email is already in your list",
      });
    }
  };

  const removeEmail = (email: string) => {
    setEmailList(prev => prev.filter(e => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      console.error("Cannot submit form: user is not authenticated");
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to send emails",
      });
      return;
    }
    
    // Store the user ID locally to ensure persistence
    try {
      localStorage.setItem('lastActiveUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        timestamp: new Date().toISOString()
      }));
      console.log('Stored active user in localStorage for persistence');
    } catch (e) {
      console.warn('Could not store user in localStorage:', e);
    }
    
    if (emailList.length === 0) {
      toast({
        variant: "destructive",
        title: "No recipients",
        description: "Please add at least one email recipient",
      });
      return;
    }
    
    if (!gmailAddress.endsWith('@gmail.com')) {
      toast({
        variant: "destructive",
        title: "Invalid sender email",
        description: "Sender email must be a Gmail address",
      });
      return;
    }
    
    if (!appPassword) {
      toast({
        variant: "destructive",
        title: "App password required",
        description: "Please enter your Gmail app password",
      });
      return;
    }
    
    setLoading(true);
    let historyId = null;
    console.log("Starting email sending process with", emailList.length, "recipients");
    
    try {
      // Show sending toast
      toast({
        title: "Sending emails...",
        description: `Attempting to send ${emailList.length} emails. This may take a moment.`,
      });
      
      // Call the email service and get the response
      console.log("Making request to email server");
      const response = await fetch(`http://localhost:3001/api/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailList,
          subject,
          body,
          fromEmail: gmailAddress,
          appPassword,
          batchSize,
          delayBetweenBatches
        }),
      });
      
      console.log("Received response from server:", response.status);
      const data: EmailResponse = await response.json();
      console.log("Email server response data:", JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send emails');
      }
      
      // Save more detailed email history
      try {
        console.log("Saving email history to Firebase");
        // Fix: Determine status based on deliveredCount rather than server status when emails are actually delivered
        let emailStatus = data.status;
        
        // If we have a successful delivery but status says failed, correct it
        if (data.status === 'failed' && emailList.length > 0 && (!data.failedEmails || data.failedEmails.length < emailList.length)) {
          emailStatus = data.failedEmails?.length ? 'partial' : 'success';
          console.log('Corrected status from failed to:', emailStatus);
        }
        
        const historyData = {
          subject,
          recipients: emailList.length,
          status: emailStatus, // Use the corrected status
          body,
          fromEmail: gmailAddress,
          deliveredCount: emailList.length - (data.failedEmails?.length || 0),
          failedEmails: data.failedEmails,
          batchSize,
          delayBetweenBatches
        };
        
        console.log("Saving email history with data:", JSON.stringify(historyData, null, 2));
        console.log("Current user ID:", user.uid);
        
        // Store history data in localStorage before saving to Firebase
        try {
          const tempId = 'temp_' + Date.now();
          localStorage.setItem(`pendingHistory_${tempId}`, JSON.stringify({
            userId: user.uid,
            data: historyData,
            timestamp: new Date().toISOString()
          }));
          console.log('Stored history data in localStorage as backup');
        } catch (e) {
          console.warn('Could not store history in localStorage:', e);
        }
        
        historyId = await saveEmailHistory(user.uid, historyData);
        console.log("Email history saved with ID:", historyId);
        
        // Remove from localStorage after successful save
        try {
          const pendingSaves = Object.keys(localStorage)
            .filter(key => key.startsWith('pendingHistory_'));
          
          if (pendingSaves.length > 0) {
            console.log('Cleaning up pending history saves:', pendingSaves.length);
            pendingSaves.forEach(key => {
              localStorage.removeItem(key);
            });
          }
        } catch (e) {
          console.warn('Error cleaning up pending history saves:', e);
        }
        
        // Reset form after successful send
        setSubject("");
        setBody("");
        setEmailList([]);
        
        // Success notification
        toast({
          title: emailStatus === 'success' ? "Success!" : emailStatus === 'partial' ? "Partially Successful" : "Failed",
          description: data.message,
        });
        
        // Call the callback if provided with success=true and data
        if (onEmailSent) {
          console.log("Calling onEmailSent callback with success=true");
          onEmailSent(true, { ...historyData, id: historyId });
        }
      } catch (historyError) {
        console.error("Error saving email history:", historyError);
        
        // Try to save email history again after a short delay
        setTimeout(async () => {
          try {
            console.log("Retrying to save email history after error");
            const historyData = {
              subject,
              recipients: emailList.length,
              status: data.status,
              body,
              fromEmail: gmailAddress,
              deliveredCount: emailList.length - (data.failedEmails?.length || 0),
              failedEmails: data.failedEmails,
              batchSize,
              delayBetweenBatches
            };
            
            historyId = await saveEmailHistory(user.uid, historyData);
            console.log("Email history saved on retry with ID:", historyId);
            
            if (onEmailSent && historyId) {
              onEmailSent(true, { ...historyData, id: historyId });
            }
          } catch (retryError) {
            console.error("Failed retry to save email history:", retryError);
          }
        }, 2000);
        
        // Continue without crashing if history saving fails
        toast({
          title: "Emails sent successfully",
          description: "But we couldn't save to your history. Please try refreshing.",
        });
        
        // Still call callback but with no data
        if (onEmailSent) {
          onEmailSent(true);
        }
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      
      // Save failed attempt to history
      try {
        console.log("Saving failed email attempt to history");
        const failedData = {
          subject,
          recipients: emailList.length,
          status: 'failed' as const,
          body,
          fromEmail: gmailAddress,
          batchSize,
          delayBetweenBatches
        };
        
        historyId = await saveEmailHistory(user.uid, failedData);
        console.log("Failed email history saved with ID:", historyId);
        
        // Call callback with failure
        if (onEmailSent) {
          onEmailSent(false, { ...failedData, id: historyId });
        }
      } catch (historyError) {
        console.error("Error saving failed email history:", historyError);
        // Call callback with failure but no data
        if (onEmailSent) {
          onEmailSent(false);
        }
      }
      
      toast({
        variant: "destructive",
        title: "Failed to send emails",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Email Settings */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gmailAddress">Your Gmail Address</Label>
            <Input
              id="gmailAddress"
              type="email"
              placeholder="your@gmail.com"
              value={gmailAddress}
              onChange={(e) => setGmailAddress(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">Must be a Gmail address to use nodemailer</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="appPassword">Gmail App Password</Label>
            <Input
              id="appPassword"
              type="password"
              placeholder="Your app password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              <a 
                href="https://support.google.com/accounts/answer/185833" 
                target="_blank" 
                rel="noreferrer"
                className="underline"
              >
                How to generate an app password
              </a>
            </p>
          </div>
          
          {/* Rate Limiting Settings */}
          <div className="space-y-2">
            <Label>Rate Limiting</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchSize" className="text-xs">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  max="100"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="delayBetweenBatches" className="text-xs">Delay (seconds)</Label>
                <Input
                  id="delayBetweenBatches"
                  type="number"
                  min="1"
                  max="10"
                  value={delayBetweenBatches}
                  onChange={(e) => setDelayBetweenBatches(parseInt(e.target.value))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Adjust these settings to avoid Gmail rate limits</p>
          </div>
        </div>

        {/* Right Column - Recipients */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {emailList.map((email) => (
                <Badge key={email} className="flex items-center gap-1">
                  {email}
                  <button 
                    type="button" 
                    onClick={() => removeEmail(email)}
                    className="ml-1 rounded-full hover:bg-primary-foreground/20"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add email manually"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addManualEmail}
              >
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {emailList.length} recipients in the list
            </p>
          </div>

          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Import from CSV/Excel</span>
              </div>
              <EmailUploader onEmailsAdded={handleEmailsAdded} />
            </div>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Email Content */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">Email Body</Label>
          <Textarea
            id="body"
            placeholder="Write your message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            required
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" type="button" onClick={() => setEmailList([])}>
          Clear Recipients
        </Button>
        <Button 
          type="submit" 
          className="gradient-bg" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Emails
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmailForm;
