import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipient: string;
  status: string;
  created_at: string;
  error?: string;
}

export default function EmailHistory() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading emails",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from("emails")
        .delete()
        .match({ id });

      if (error) throw error;

      setEmails((prev) => prev.filter((email) => email.id !== id));
      toast({
        title: "Email deleted",
        description: "The email has been removed from your history",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting email",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-lg text-muted-foreground">No emails sent yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Card key={email.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              {email.subject}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteEmail(email.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">To:</span>
                <span>{email.recipient}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={
                    email.status === "sent"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {email.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sent:</span>
                <span>
                  {new Date(email.created_at).toLocaleDateString()}
                </span>
              </div>
              {email.error && (
                <div className="mt-2 text-sm text-red-500">
                  Error: {email.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 