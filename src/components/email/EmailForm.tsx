import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload, X, Trash, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailConfig {
  id: string;
  email: string;
  app_password: string;
  created_at: string;
}

const EmailForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    manualEmails: "",
  });
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);

  useEffect(() => {
    loadEmailConfigs();
  }, []);

  const loadEmailConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("email_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmailConfigs(data || []);
      
      // Set the first config as default if available
      if (data && data.length > 0 && !selectedConfig) {
        setSelectedConfig(data[0].id);
      }
    } catch (error) {
      toast({
        title: "Error loading email configurations",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validEmails = new Set<string>();

        // Add existing manual emails
        formData.manualEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => emailRegex.test(email))
          .forEach((email) => validEmails.add(email.toLowerCase()));

        // Add emails from file
        jsonData.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach((cell) => {
              const str = String(cell).trim();
              if (emailRegex.test(str)) {
                validEmails.add(str.toLowerCase());
              }
            });
          }
        });

        setExtractedEmails(Array.from(validEmails));
        toast({
          title: "File processed successfully",
          description: `Found ${validEmails.size} valid email addresses`,
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleManualEmailsChange = (value: string) => {
    setFormData({ ...formData, manualEmails: value });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = new Set<string>();
    
    // Add existing file-extracted emails
    extractedEmails.forEach((email) => validEmails.add(email));
    
    // Add manual emails
    value
      .split(",")
      .map((email) => email.trim())
      .filter((email) => emailRegex.test(email))
      .forEach((email) => validEmails.add(email.toLowerCase()));
    
    setExtractedEmails(Array.from(validEmails));
  };

  const removeEmail = (emailToRemove: string) => {
    setExtractedEmails(extractedEmails.filter((email) => email !== emailToRemove));
    setFormData({
      ...formData,
      manualEmails: formData.manualEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email !== emailToRemove)
        .join(", "),
    });
  };

  const handleHtmlFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setHtmlContent(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConfig || !formData.subject || !(formData.content || htmlContent) || !extractedEmails.length) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and add at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const config = emailConfigs.find((c) => c.id === selectedConfig);
      if (!config) throw new Error("Selected email configuration not found");

      const response = await fetch("http://localhost:3001/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: extractedEmails,
          subject: formData.subject,
          body: isHtmlMode ? htmlContent : formData.content,
          fromEmail: config.email,
          appPassword: config.app_password,
          batchSize: 10,
          delayBetweenBatches: 1,
          isHtml: isHtmlMode,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      // Save email record to Supabase
      const { error: dbError } = await supabase.from("emails").insert({
        subject: formData.subject,
        content: isHtmlMode ? htmlContent : formData.content,
        total_recipients: extractedEmails.length,
        delivered_count: result.deliveredCount || 0,
        status: result.status || "completed",
        from_email: config.email,
        user_id: user.id,
        is_html: isHtmlMode,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: result.message,
      });

      // Reset form
      setFormData({ subject: "", content: "", manualEmails: "" });
      setHtmlContent("");
      setExtractedEmails([]);
    } catch (error) {
      toast({
        title: "Error sending emails",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="sender">Sender Email</Label>
          <Select value={selectedConfig} onValueChange={setSelectedConfig}>
            <SelectTrigger>
              <SelectValue placeholder="Select sender email" />
            </SelectTrigger>
            <SelectContent>
              {emailConfigs.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Email subject"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="content">Content</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="html-mode">HTML Mode</Label>
              <Switch
                id="html-mode"
                checked={isHtmlMode}
                onCheckedChange={setIsHtmlMode}
              />
            </div>
          </div>

          {isHtmlMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".html"
                  onChange={handleHtmlFileUpload}
                  className="hidden"
                  id="html-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("html-file")?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload HTML File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Paste your HTML code here..."
                className="min-h-[200px] font-mono"
              />
            </div>
          ) : (
            <div className="min-h-[200px] border rounded-md">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={quillModules}
                placeholder="Compose your email..."
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="manualEmails">Recipients (Enter emails separated by commas)</Label>
            <Textarea
              id="manualEmails"
              value={formData.manualEmails}
              onChange={(e) => handleManualEmailsChange(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              className="h-20"
            />
          </div>

          <div>
            <Label htmlFor="file">Or Upload Recipients (CSV/Excel file)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              {extractedEmails.length > 0 && (
                <Badge variant="secondary">
                  {extractedEmails.length} email{extractedEmails.length !== 1 && "s"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {extractedEmails.length > 0 && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Recipients List</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExtractedEmails([]);
                    setFormData({ ...formData, manualEmails: "" });
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {extractedEmails.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div
            className="mt-4"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </DialogContent>
      </Dialog>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Send Emails
      </Button>
    </form>
  );
};

export default EmailForm;
