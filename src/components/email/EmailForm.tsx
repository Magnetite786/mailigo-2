
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendEmails } from "@/lib/emailService";
import { Loader2, Send, Plus, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmailUploader from "./EmailUploader";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmailForm = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [gmailAddress, setGmailAddress] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    
    try {
      await sendEmails({
        to: emailList,
        subject,
        body,
        fromEmail: gmailAddress,
        appPassword,
      });
      
      // Reset form after successful send
      setSubject("");
      setBody("");
      setEmailList([]);
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        variant: "destructive",
        title: "Failed to send emails",
        description: "Please check your credentials and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Send Bulk Emails</CardTitle>
        <CardDescription>Compose and send emails to multiple recipients</CardDescription>
      </CardHeader>
      
      <Alert className="mx-6 mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This is a frontend-only demo. In a real application, emails would be sent through a server-side API using Nodemailer.
        </AlertDescription>
      </Alert>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
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
            
            <EmailUploader onEmailsAdded={handleEmailsAdded} />
          </div>
          
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
        </CardContent>
        
        <CardFooter className="flex justify-between">
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
                <Send size={16} className="mr-2" />
                Send Emails
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmailForm;
