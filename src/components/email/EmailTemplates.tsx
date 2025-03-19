import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Save,
  Trash,
  Edit,
  Copy,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  is_html: boolean;
  created_at: string;
  user_id: string;
}

interface EmailTemplatesProps {
  onSelectTemplate: (template: EmailTemplate) => void;
}

const EmailTemplates = ({ onSelectTemplate }: EmailTemplatesProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    is_html: false
  });
  const [currentEmail, setCurrentEmail] = useState({
    subject: "",
    content: "",
    is_html: false
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Missing fields",
        description: "Please provide a name and content for your template",
        variant: "destructive",
      });
      return;
    }

    setSavingTemplate(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
          is_html: newTemplate.is_html,
          user_id: user.id,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Template saved",
        description: "Your email template has been saved successfully",
      });

      setTemplates([...(data || []), ...templates]);
      setSaveDialogOpen(false);
      setNewTemplate({
        name: "",
        subject: "",
        content: "",
        is_html: false
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTemplates(templates.filter(template => template.id !== id));
      toast({
        title: "Template deleted",
        description: "Your email template has been deleted",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveCurrentAsTemplate = (subject: string, content: string, is_html: boolean) => {
    setCurrentEmail({ subject, content, is_html });
    setNewTemplate({
      name: "",
      subject,
      content,
      is_html
    });
    setSaveDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading templates...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Email Templates</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSaveDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No templates saved yet</p>
          <Button 
            variant="outline" 
            onClick={() => setSaveDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create your first template
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs truncate max-w-[200px]">
                        {template.subject}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={template.is_html ? "default" : "outline"}>
                        {template.is_html ? "HTML" : "Text"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Use Template</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content.replace(/<[^>]*>/g, " ")}
                  </p>
                </CardContent>
                <CardFooter className="py-2 px-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Email Template</DialogTitle>
            <DialogDescription>
              Save this email as a template for future use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="E.g., Welcome Email"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                placeholder="Email subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-content">Content Preview</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">
                  {newTemplate.content ? (
                    newTemplate.is_html ? (
                      <span className="text-muted-foreground">HTML content</span>
                    ) : newTemplate.content
                  ) : (
                    <span className="text-muted-foreground italic">No content</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={savingTemplate || !newTemplate.name}
            >
              {savingTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates; 