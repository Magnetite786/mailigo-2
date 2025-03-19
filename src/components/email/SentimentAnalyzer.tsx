import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertCircle,
  CheckCircle, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown,
  Loader2,
  Info
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface SentimentAnalyzerProps {
  emailContent: string;
  emailSubject: string;
}

interface SentimentResult {
  overall: string; // positive, negative, neutral
  score: number; // -1 to 1
  formality: string; // formal, casual, mixed
  tone: string[]; // array of detected tones
  suggestions: string[];
  readability: string; // easy, medium, difficult
}

const SentimentAnalyzer = ({ emailContent, emailSubject }: SentimentAnalyzerProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);

  const analyzeSentiment = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please write some email content first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:3001/api/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: emailContent,
          subject: emailSubject
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setResult(data.result);
    } catch (error) {
      toast({
        title: "Error analyzing sentiment",
        description: error.message || "Failed to analyze the email sentiment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <ThumbsDown className="h-5 w-5 text-red-500" />;
      case "neutral":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getToneColor = (tone: string) => {
    const toneColors: Record<string, string> = {
      professional: "bg-blue-100 text-blue-800",
      friendly: "bg-green-100 text-green-800",
      casual: "bg-yellow-100 text-yellow-800",
      formal: "bg-purple-100 text-purple-800",
      urgent: "bg-red-100 text-red-800",
      promotional: "bg-orange-100 text-orange-800",
      informative: "bg-cyan-100 text-cyan-800",
      persuasive: "bg-amber-100 text-amber-800",
      apologetic: "bg-rose-100 text-rose-800",
      thankful: "bg-emerald-100 text-emerald-800",
    };
    
    return toneColors[tone.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
          Email Sentiment Analysis
        </CardTitle>
        <CardDescription>
          Analyze your email tone and get suggestions for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {!result && !isAnalyzing && (
          <Button 
            variant="outline" 
            onClick={analyzeSentiment}
            disabled={isAnalyzing || !emailContent.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Email Sentiment"
            )}
          </Button>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Analyzing your email...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center">
                <span className="mr-2 font-medium">Overall Tone:</span>
                <Badge className={getSentimentColor(result.overall)}>
                  <span className="flex items-center">
                    {getSentimentIcon(result.overall)}
                    <span className="ml-1 capitalize">{result.overall}</span>
                  </span>
                </Badge>
              </div>
              
              <div className="flex items-center ml-auto">
                <span className="mr-2 font-medium">Formality:</span>
                <Badge variant="outline">
                  <span className="capitalize">{result.formality}</span>
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Detected Tones:</p>
              <div className="flex flex-wrap gap-1">
                {result.tone.map((tone, index) => (
                  <Badge key={index} className={getToneColor(tone)}>
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>

            {result.suggestions.length > 0 && (
              <Alert className={
                result.overall === "negative" 
                  ? "border-red-200 bg-red-50" 
                  : "border-amber-200 bg-amber-50"
              }>
                <AlertTitle className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Suggestions to improve your email</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  Suggestions for Improvement
                </AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      {result && (
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setResult(null)}
            className="text-xs"
          >
            Reset Analysis
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SentimentAnalyzer; 