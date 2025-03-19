import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload, X, Trash, Eye, Sparkles, Save, Send } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AIContentGenerator from "./AIContentGenerator";
import EmailTemplates from "./EmailTemplates";
import SentimentAnalyzer from "./SentimentAnalyzer";
import EmailScheduler, { ScheduleData } from "./EmailScheduler";

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
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSentimentAnalyzer, setShowSentimentAnalyzer] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    scheduled: false,
    date: null,
    time: "",
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [htmlInputMode, setHtmlInputMode] = useState<'editor' | 'code'>('editor');

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

  const handleAiContentApply = (content: string) => {
    if (isHtmlMode) {
      setHtmlContent(content);
    } else {
      setFormData({ ...formData, content });
    }
    setShowAiGenerator(false);
  };

  const handleTemplateSelect = (template: any) => {
    if (template.is_html) {
      setIsHtmlMode(true);
      setHtmlContent(template.content);
    } else {
      setIsHtmlMode(false);
      setFormData({
        ...formData,
        subject: template.subject,
        content: template.content
      });
    }
    setShowTemplates(false);
    toast({
      title: "Template applied",
      description: `"${template.name}" template has been applied to your email`,
    });
  };
  
  const handleSaveCurrentAsTemplate = () => {
    // Save current email as a template
    const content = isHtmlMode ? htmlContent : formData.content;
    if (!formData.subject || !content) {
      toast({
        title: "Missing content",
        description: "Please add a subject and content before saving as a template",
        variant: "destructive",
      });
      return;
    }
    
    // Open the save template dialog in EmailTemplates component
    // This would be handled by showing the dialog and passing the current email data
    setShowTemplates(true);
  };

  const handleScheduleUpdate = (data: ScheduleData) => {
    setScheduleData(data);
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

      // Calculate scheduled date if scheduling is enabled
      let scheduledDate = null;
      if (scheduleData.scheduled && scheduleData.date) {
        const scheduledDateTime = new Date(scheduleData.date);
        const [hours, minutes] = scheduleData.time.split(":").map(Number);
        scheduledDateTime.setHours(hours, minutes);
        scheduledDate = scheduledDateTime.toISOString();
      }

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
          scheduled: scheduleData.scheduled,
          scheduledDate
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      // Save email record to Supabase
      const { error: dbError } = await supabase.from("emails").insert({
        subject: formData.subject,
        content: isHtmlMode ? htmlContent : formData.content,
        total_recipients: extractedEmails.length,
        delivered_count: scheduleData.scheduled ? 0 : (result.deliveredCount || 0),
        status: scheduleData.scheduled ? "scheduled" : (result.status || "completed"),
        from_email: config.email,
        user_id: user.id,
        is_html: isHtmlMode,
        scheduled: scheduleData.scheduled,
        scheduled_for: scheduledDate,
      });

      if (dbError) throw dbError;

      toast({
        title: scheduleData.scheduled ? "Email Scheduled" : "Success",
        description: result.message,
      });

      // Reset form
      setFormData({ subject: "", content: "", manualEmails: "" });
      setHtmlContent("");
      setExtractedEmails([]);
      setScheduleData({
        scheduled: false,
        date: null,
        time: "",
      });
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const handleModeSwitch = (enableHtml: boolean) => {
    if (enableHtml) {
      // Convert plain text to basic HTML if switching to HTML mode
      const plainText = formData.content;
      const basicHtml = plainText
        .split('\n')
        .map(line => `<p>${line}</p>`)
        .join('');
      setHtmlContent(basicHtml);
    } else {
      // Convert HTML to plain text if switching to plain mode
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      const plainText = div.innerText || div.textContent || '';
      setFormData({ ...formData, content: plainText });
    }
    setIsHtmlMode(enableHtml);
    setPreviewMode(false);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card className="p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Compose Email</h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    Templates
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {isHtmlMode ? "HTML Mode" : "Plain Text"}
                  </span>
                  <Switch
                    checked={isHtmlMode}
                    onCheckedChange={handleModeSwitch}
                  />
                </div>
              </div>

              {showTemplates && (
                <div className="mb-2">
                  <EmailTemplates onSelectTemplate={handleTemplateSelect} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailConfig">From Email</Label>
                <Select
                  value={selectedConfig}
                  onValueChange={setSelectedConfig}
                >
                  <SelectTrigger id="emailConfig">
                    <SelectValue placeholder="Select email configuration" />
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
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">Message</Label>
                  <div className="flex items-center gap-2">
                    {isHtmlMode && (
                      <div className="flex items-center gap-2 mr-4">
                        <Button
                          type="button"
                          variant={htmlInputMode === 'editor' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setHtmlInputMode('editor')}
                        >
                          Visual Editor
                        </Button>
                        <Button
                          type="button"
                          variant={htmlInputMode === 'code' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setHtmlInputMode('code')}
                        >
                          HTML Code
                        </Button>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex gap-1 items-center"
                      onClick={() => setShowAiGenerator(!showAiGenerator)}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      {showAiGenerator ? "Hide AI Helper" : "AI Helper"}
                    </Button>
                  </div>
                </div>

                {showAiGenerator && (
                  <div className="mb-4">
                    <AIContentGenerator onApplyContent={handleAiContentApply} />
                  </div>
                )}

                {isHtmlMode ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('html-file')?.click()}
                          className="text-sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Import HTML File
                        </Button>
                        <input
                          id="html-file"
                          type="file"
                          accept=".html,.htm"
                          onChange={handleHtmlFileUpload}
                          className="hidden"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={togglePreview}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                    </div>

                    {previewMode ? (
                      <div className="border rounded-lg p-4 min-h-[300px] bg-white overflow-auto">
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                      </div>
                    ) : (
                      <>
                        {htmlInputMode === 'editor' ? (
                          <ReactQuill
                            value={htmlContent}
                            onChange={setHtmlContent}
                            modules={modules}
                            className="bg-white rounded-lg"
                            style={{ minHeight: '300px' }}
                          />
                        ) : (
                          <div className="space-y-2">
                            <Textarea
                              value={htmlContent}
                              onChange={(e) => setHtmlContent(e.target.value)}
                              placeholder="Paste your HTML code here..."
                              className="font-mono text-sm min-h-[300px]"
                            />
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const text = await navigator.clipboard.readText();
                                    setHtmlContent(text);
                                    toast({
                                      title: "HTML pasted successfully",
                                      description: "The HTML code has been pasted from your clipboard",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Failed to paste HTML",
                                      description: "Please paste the HTML code manually",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Paste from Clipboard
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    placeholder="Write your message here"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="min-h-[300px]"
                    required
                  />
                )}
              </div>
            </div>
          </Card>
          
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
          
          <Card className="p-6 shadow-sm">
            <EmailScheduler onSchedule={handleScheduleUpdate} disabled={isLoading} />
          </Card>
        </div>
        
        <div className="flex-1 space-y-6">
          <Card className="p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSentimentAnalyzer(!showSentimentAnalyzer)}
                >
                  {showSentimentAnalyzer ? "Hide Analysis" : "Analyze Tone"}
                </Button>
              </div>

              {showSentimentAnalyzer && (
                <div className="mb-4">
                  <SentimentAnalyzer 
                    emailContent={isHtmlMode ? htmlContent : formData.content} 
                    emailSubject={formData.subject}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="preview">Preview</Label>
                </div>

                {isHtmlMode ? (
                  <div className="mt-4 border rounded-md p-4 min-h-[150px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                ) : (
                  <Textarea
                    id="preview"
                    placeholder="No preview available"
                    value={formData.content}
                    className="min-h-[150px]"
                    readOnly
                  />
                )}
              </div>
            </div>
          </Card>
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

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={handleSaveCurrentAsTemplate}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Template
        </Button>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Emails...
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
