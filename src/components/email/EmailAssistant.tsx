import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Clock, Target, Sparkles, BrainCircuit } from "lucide-react";

interface EmailAssistantProps {
  onApplySuggestion?: (type: string, content: string) => void;
}

interface Suggestion {
  id: string;
  type: "subject" | "content" | "timing";
  original: string;
  suggestions: string[];
  reasoning: string;
  confidence: number;
}

const EmailAssistant = ({ onApplySuggestion }: EmailAssistantProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState({
    subject: "",
    content: "",
    targetAudience: "",
    goal: "engagement",
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const goals = [
    { value: "engagement", label: "Increase Engagement" },
    { value: "conversion", label: "Drive Conversions" },
    { value: "awareness", label: "Build Awareness" },
    { value: "retention", label: "Customer Retention" },
  ];

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailInput.subject,
          content: emailInput.content,
          targetAudience: emailInput.targetAudience,
          goal: emailInput.goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate suggestions');
      }

      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        throw new Error('Invalid suggestions format received');
      }

      setSuggestions(data.suggestions);
      toast({
        title: "Suggestions generated",
        description: "AI has analyzed your email and provided optimization suggestions",
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        variant: "destructive",
        title: "Error generating suggestions",
        description: error instanceof Error ? error.message : "There was an error analyzing your email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (type: string, content: string) => {
    if (onApplySuggestion) {
      onApplySuggestion(type, content);
    }
    toast({
      title: "Suggestion applied",
      description: `The ${type} suggestion has been applied to your email.`,
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge variant="success">{confidence}% Confidence</Badge>;
    if (confidence >= 70) return <Badge variant="secondary">{confidence}% Confidence</Badge>;
    return <Badge variant="outline">{confidence}% Confidence</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Email Assistant
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions to optimize your email campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={emailInput.subject}
              onChange={(e) => setEmailInput({ ...emailInput, subject: e.target.value })}
              placeholder="Enter your email subject line"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              value={emailInput.content}
              onChange={(e) => setEmailInput({ ...emailInput, content: e.target.value })}
              placeholder="Enter your email content"
              className="min-h-[150px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Audience</Label>
              <Input
                id="target"
                value={emailInput.targetAudience}
                onChange={(e) => setEmailInput({ ...emailInput, targetAudience: e.target.value })}
                placeholder="Describe your target audience"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Campaign Goal</Label>
              <Select
                value={emailInput.goal}
                onValueChange={(value) => setEmailInput({ ...emailInput, goal: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            onClick={generateSuggestions}
            disabled={loading || !emailInput.subject || !emailInput.content}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Email...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Suggestions
              </>
            )}
          </Button>
        </div>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
            
            <Accordion type="single" collapsible className="space-y-2">
              {suggestions.map((suggestion) => (
                <AccordionItem
                  key={suggestion.id}
                  value={suggestion.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      {suggestion.type === "subject" && <Sparkles className="h-4 w-4 text-primary" />}
                      {suggestion.type === "content" && <Target className="h-4 w-4 text-primary" />}
                      {suggestion.type === "timing" && <Clock className="h-4 w-4 text-primary" />}
                      <span className="capitalize">{suggestion.type} Optimization</span>
                      {getConfidenceBadge(suggestion.confidence)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Original</Label>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {suggestion.original || "Not provided"}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Suggestions</Label>
                      <div className="space-y-2">
                        {suggestion.suggestions.map((text, index) => (
                          <div
                            key={index}
                            className="group relative bg-primary/5 p-3 rounded-md hover:bg-primary/10 transition-colors"
                          >
                            <div className="pr-20">{text}</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleApplySuggestion(suggestion.type, text)}
                            >
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>AI Reasoning</Label>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.reasoning}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailAssistant; 