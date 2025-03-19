import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIContentGeneratorProps {
  onApplyContent: (content: string) => void;
}

const AIContentGenerator = ({ onApplyContent }: AIContentGeneratorProps) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [tone, setTone] = useState("professional");

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the email you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // This would be a call to your backend which uses Gemini API
      const response = await fetch("http://localhost:3001/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          tone,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setGeneratedContent(data.content);
      toast({
        title: "Content generated",
        description: "AI has generated email content based on your prompt",
      });
    } catch (error) {
      toast({
        title: "Error generating content",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onApplyContent(generatedContent);
      toast({
        title: "Content applied",
        description: "The AI generated content has been applied to your email",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
          AI Email Generator
        </CardTitle>
        <CardDescription>
          Describe what you want to write and let AI generate email content for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tone">Email Tone</Label>
          <Select 
            value={tone} 
            onValueChange={setTone}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="persuasive">Persuasive</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe your email</Label>
          <Textarea
            id="prompt"
            placeholder="E.g., Write a promotional email about our new product launch for tech-savvy customers"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24"
          />
        </div>
        
        {generatedContent && (
          <div className="space-y-2 mt-4">
            <Label>Generated Content</Label>
            <div className="border rounded-md p-4 bg-muted/30 whitespace-pre-wrap min-h-40 max-h-60 overflow-y-auto">
              {generatedContent}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={generateContent} 
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>
        
        {generatedContent && (
          <Button 
            variant="outline" 
            onClick={handleApply}
          >
            Apply to Email
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIContentGenerator; 