import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Plus, ListPlus, UserRound, Edit } from "lucide-react";

interface EmailPersonalizerProps {
  emailContent: string;
  onApplyPersonalization: (content: string) => void;
}

type PersonalizationVariable = {
  tag: string;
  description: string;
  fallback: string;
  examples: string[];
};

const sampleVariables: PersonalizationVariable[] = [
  {
    tag: "{{firstName}}",
    description: "Recipient's first name",
    fallback: "there",
    examples: ["John", "Jane", "Alex"]
  },
  {
    tag: "{{lastName}}",
    description: "Recipient's last name",
    fallback: "",
    examples: ["Smith", "Doe", "Johnson"]
  },
  {
    tag: "{{companyName}}",
    description: "Recipient's company name",
    fallback: "your company",
    examples: ["Acme Corp", "Global Industries", "Tech Solutions"]
  },
  {
    tag: "{{jobTitle}}",
    description: "Recipient's job title",
    fallback: "professional",
    examples: ["Marketing Manager", "Sales Director", "CEO"]
  },
  {
    tag: "{{customGreeting}}",
    description: "Personalized greeting based on recipient data",
    fallback: "Hello there",
    examples: ["Hope you're having a great week", "Great talking to you yesterday", "Following up on our conversation"]
  }
];

const EmailPersonalizer = ({ emailContent, onApplyPersonalization }: EmailPersonalizerProps) => {
  const { toast } = useToast();
  const [personalizedContent, setPersonalizedContent] = useState(emailContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddVariable, setShowAddVariable] = useState(false);
  const [variables, setVariables] = useState<PersonalizationVariable[]>(sampleVariables);
  const [newVariable, setNewVariable] = useState<PersonalizationVariable>({
    tag: "",
    description: "",
    fallback: "",
    examples: [""]
  });
  const [activeTab, setActiveTab] = useState("variables");
  const [previewData, setPreviewData] = useState({
    firstName: "John",
    lastName: "Smith",
    companyName: "Acme Corp",
    jobTitle: "Marketing Director",
    customGreeting: "Hope you're having a great week"
  });

  const handleGeneratePersonalization = async () => {
    if (!emailContent) {
      toast({
        title: "Missing content",
        description: "Please add email content before personalizing",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // In a real app, this would call your API with Gemini
      // Here we're just doing a simple variable replacement simulation
      
      // Simple personalization - add a sample greeting if none exists
      let personalized = emailContent;
      
      if (!emailContent.includes("{{") && !emailContent.toLowerCase().includes("hello") && !emailContent.toLowerCase().includes("hi")) {
        personalized = `{{customGreeting}} {{firstName}},\n\n${emailContent}`;
      }
      
      // Add signature suggestion if none exists
      if (!emailContent.toLowerCase().includes("regards") && !emailContent.toLowerCase().includes("sincerely")) {
        personalized = `${personalized}\n\nBest regards,\n[Your Name]`;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPersonalizedContent(personalized);
      toast({
        title: "Personalization applied",
        description: "AI has added personalization variables to your email",
      });
    } catch (error) {
      toast({
        title: "Error generating personalization",
        description: error.message || "Failed to personalize content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApplyPersonalization(personalizedContent);
    toast({
      title: "Personalization applied",
      description: "Your email has been updated with personalization tags",
    });
  };

  const handleAddVariable = () => {
    if (!newVariable.tag || !newVariable.description) {
      toast({
        title: "Missing fields",
        description: "Please provide a tag name and description",
        variant: "destructive",
      });
      return;
    }

    // Format tag if needed
    let formattedTag = newVariable.tag;
    if (!formattedTag.startsWith("{{")) formattedTag = `{{${formattedTag}`;
    if (!formattedTag.endsWith("}}")) formattedTag = `${formattedTag}}}`;

    const updatedVariable = {
      ...newVariable,
      tag: formattedTag,
      examples: newVariable.examples.filter(ex => ex.trim() !== "")
    };

    setVariables([...variables, updatedVariable]);
    setNewVariable({
      tag: "",
      description: "",
      fallback: "",
      examples: [""]
    });
    setShowAddVariable(false);
    
    toast({
      title: "Variable added",
      description: `${formattedTag} has been added to available variables`,
    });
  };

  const insertVariable = (tag: string) => {
    setPersonalizedContent(prev => {
      const textArea = document.createElement('textarea');
      textArea.value = prev;
      
      const cursorPosition = textArea.selectionStart;
      const textBefore = prev.substring(0, cursorPosition);
      const textAfter = prev.substring(cursorPosition);
      
      return textBefore + tag + textAfter;
    });
  };

  const parseContent = (content: string) => {
    let parsed = content;
    variables.forEach(variable => {
      const regex = new RegExp(variable.tag.replace(/[{{}]/g, '\\$&'), 'g');
      const value = previewData[variable.tag.replace(/[{{}}]/g, '')] || variable.fallback;
      parsed = parsed.replace(regex, value);
    });
    return parsed;
  };

  const handleExampleChange = (index: number, value: string) => {
    const updated = [...newVariable.examples];
    updated[index] = value;
    
    // Add new empty field if the last one is filled
    if (index === updated.length - 1 && value.trim() !== "") {
      updated.push("");
    }
    
    setNewVariable({ ...newVariable, examples: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserRound className="h-5 w-5 mr-2 text-primary" />
          Email Personalization
        </CardTitle>
        <CardDescription>
          Add personalization variables to make your emails more effective
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variables" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Available Variables</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddVariable(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variable
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Fallback</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variables.map((variable, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{variable.tag}</TableCell>
                      <TableCell>{variable.description}</TableCell>
                      <TableCell>{variable.fallback || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => insertVariable(variable.tag)}
                        >
                          Insert
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preview-firstname">First Name</Label>
                  <Input 
                    id="preview-firstname" 
                    value={previewData.firstName}
                    onChange={(e) => setPreviewData({...previewData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-lastname">Last Name</Label>
                  <Input 
                    id="preview-lastname" 
                    value={previewData.lastName}
                    onChange={(e) => setPreviewData({...previewData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-company">Company</Label>
                  <Input 
                    id="preview-company" 
                    value={previewData.companyName}
                    onChange={(e) => setPreviewData({...previewData, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preview-jobtitle">Job Title</Label>
                  <Input 
                    id="preview-jobtitle" 
                    value={previewData.jobTitle}
                    onChange={(e) => setPreviewData({...previewData, jobTitle: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Preview</Label>
                <div className="border rounded-md p-4 mt-2 whitespace-pre-wrap min-h-[150px]">
                  {parseContent(personalizedContent)}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4 pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Label htmlFor="personalized-content">Email Content with Personalization</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGeneratePersonalization}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-1" />
                    Suggest
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="personalized-content"
              value={personalizedContent}
              onChange={(e) => setPersonalizedContent(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setPersonalizedContent(emailContent)}>
          Reset
        </Button>
        <Button onClick={handleApply}>
          Apply Personalization
        </Button>
      </CardFooter>
      
      <Dialog open={showAddVariable} onOpenChange={setShowAddVariable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Personalization Variable</DialogTitle>
            <DialogDescription>
              Create a new variable to use in your email templates
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="var-tag">Variable Tag</Label>
              <Input
                id="var-tag"
                placeholder="{{variableName}}"
                value={newVariable.tag}
                onChange={(e) => setNewVariable({...newVariable, tag: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Use double curly braces for variables: {"{{"}"variableName{"}}"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="var-description">Description</Label>
              <Input
                id="var-description"
                placeholder="Describe what this variable represents"
                value={newVariable.description}
                onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="var-fallback">Fallback Value (Optional)</Label>
              <Input
                id="var-fallback"
                placeholder="Default value if variable is missing"
                value={newVariable.fallback}
                onChange={(e) => setNewVariable({...newVariable, fallback: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Example Values (Optional)</Label>
              <div className="space-y-2">
                {newVariable.examples.map((example, i) => (
                  <Input
                    key={i}
                    placeholder={`Example ${i + 1}`}
                    value={example}
                    onChange={(e) => handleExampleChange(i, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVariable(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVariable}>
              Add Variable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmailPersonalizer; 