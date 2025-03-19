import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Edit, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ClipboardCheck,
  Sparkles,
  Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ScoreCategory = {
  name: string;
  score: number;
  icon: React.ReactNode;
  details: string[];
  suggestions: string[];
};

export function EmailHealthScorePredictor() {
  const [emailContent, setEmailContent] = useState("");
  const [subject, setSubject] = useState("");
  const [audienceSize, setAudienceSize] = useState<number>(1000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>([]);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    content: 0,
    subject: 0,
    deliverability: 0,
    timing: 0,
    engagement: 0
  });
  
  // Analyze the email when requested
  const analyzeEmail = () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Calculate scores based on the various factors
      const contentScore = calculateContentScore(emailContent);
      const subjectScore = calculateSubjectScore(subject);
      const deliverabilityScore = calculateDeliverabilityScore(emailContent);
      const timingScore = calculateTimingScore();
      const engagementScore = predictEngagementScore(contentScore, subjectScore);
      
      // Update score breakdown
      setScoreBreakdown({
        content: contentScore,
        subject: subjectScore,
        deliverability: deliverabilityScore,
        timing: timingScore,
        engagement: engagementScore
      });
      
      // Calculate overall health score (weighted average)
      const overallScore = Math.round(
        (contentScore * 0.3) + 
        (subjectScore * 0.2) + 
        (deliverabilityScore * 0.25) + 
        (timingScore * 0.1) + 
        (engagementScore * 0.15)
      );
      
      setHealthScore(overallScore);
      
      // Generate detailed score categories with suggestions
      setScoreCategories([
        {
          name: "Content Quality",
          score: contentScore,
          icon: <Edit className="h-5 w-5" />,
          details: getContentDetails(contentScore, emailContent),
          suggestions: getContentSuggestions(contentScore, emailContent)
        },
        {
          name: "Subject Line",
          score: subjectScore,
          icon: <Sparkles className="h-5 w-5" />,
          details: getSubjectDetails(subjectScore, subject),
          suggestions: getSubjectSuggestions(subjectScore, subject)
        },
        {
          name: "Deliverability",
          score: deliverabilityScore,
          icon: <Shield className="h-5 w-5" />,
          details: getDeliverabilityDetails(deliverabilityScore, emailContent),
          suggestions: getDeliverabilityFixes(deliverabilityScore, emailContent)
        },
        {
          name: "Send Time",
          score: timingScore,
          icon: <Clock className="h-5 w-5" />,
          details: ["Based on your audience's typical engagement patterns"],
          suggestions: ["Optimal send time: Tuesday, 10:00 AM local time"]
        },
        {
          name: "Engagement Prediction",
          score: engagementScore,
          icon: <Users className="h-5 w-5" />,
          details: [
            `Predicted open rate: ${calculatePredictedOpenRate(engagementScore)}%`,
            `Predicted click rate: ${calculatePredictedClickRate(engagementScore)}%`
          ],
          suggestions: getEngagementSuggestions(engagementScore)
        }
      ]);
      
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };
  
  const resetAnalysis = () => {
    setShowResults(false);
    setHealthScore(0);
    setScoreCategories([]);
  };
  
  // Helper functions to calculate individual scores
  const calculateContentScore = (content: string): number => {
    if (!content.trim()) return 0;
    
    // Simple content scoring logic (would be more sophisticated in production)
    let score = 60; // Base score
    
    // Check content length
    if (content.length > 300) score += 10;
    if (content.length > 600) score += 5;
    
    // Check for personalization
    if (content.includes("{name}") || content.includes("[name]")) score += 10;
    
    // Check for call to action
    if (
      content.toLowerCase().includes("click here") ||
      content.toLowerCase().includes("learn more") ||
      content.toLowerCase().includes("get started") ||
      content.toLowerCase().includes("sign up")
    ) {
      score += 15;
    }
    
    // Check for spam triggers
    const spamTriggers = ["free", "buy now", "limited time", "act now", "!!!"];
    let spamCount = 0;
    spamTriggers.forEach(trigger => {
      if (content.toLowerCase().includes(trigger)) spamCount++;
    });
    
    score -= spamCount * 5;
    
    // Cap at 0-100
    return Math.min(100, Math.max(0, score));
  };
  
  const calculateSubjectScore = (subject: string): number => {
    if (!subject.trim()) return 0;
    
    let score = 60; // Base score
    
    // Check subject length (not too short, not too long)
    if (subject.length >= 5 && subject.length <= 50) score += 15;
    
    // Check for personalization
    if (subject.includes("{name}") || subject.includes("[name]")) score += 10;
    
    // Check for spam triggers in subject
    const spamTriggers = ["free", "buy now", "act now", "limited time", "!!!"];
    let spamCount = 0;
    spamTriggers.forEach(trigger => {
      if (subject.toLowerCase().includes(trigger)) spamCount++;
    });
    
    score -= spamCount * 10;
    
    // If all caps, penalize
    if (subject === subject.toUpperCase() && subject.length > 5) score -= 15;
    
    return Math.min(100, Math.max(0, score));
  };
  
  const calculateDeliverabilityScore = (content: string): number => {
    if (!content.trim()) return 0;
    
    let score = 80; // Base score - deliverability usually starts high
    
    // Check image to text ratio
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount > 3) score -= 10;
    
    // Check for spam triggers
    const spamTriggers = ["free", "buy now", "limited time", "act now", "win", "!!!"];
    let spamCount = 0;
    spamTriggers.forEach(trigger => {
      if (content.toLowerCase().includes(trigger)) spamCount++;
    });
    
    score -= spamCount * 5;
    
    // Check for suspicious URLs or formatting
    if (content.includes("bit.ly") || content.includes("tinyurl")) score -= 5;
    
    // Check for overuse of exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 5) score -= 5;
    
    return Math.min(100, Math.max(0, score));
  };
  
  const calculateTimingScore = (): number => {
    // Determine current day of week and time
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    
    // Optimal email times are generally Tuesday-Thursday, 9am-11am or 2pm-4pm
    let score = 70; // Base score
    
    // Optimal days
    if (dayOfWeek >= 2 && dayOfWeek <= 4) score += 15;
    
    // Optimal hours
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) score += 15;
    
    // Weekend penalty
    if (dayOfWeek === 0 || dayOfWeek === 6) score -= 15;
    
    // Very early or late penalty
    if (hour < 6 || hour > 20) score -= 10;
    
    return Math.min(100, Math.max(0, score));
  };
  
  const predictEngagementScore = (contentScore: number, subjectScore: number): number => {
    // Weighted algorithm to predict engagement based on content and subject
    const baseEngagement = (contentScore * 0.6) + (subjectScore * 0.4);
    
    // Adjust for random factors
    const randomFactor = Math.random() * 10 - 5; // -5 to +5 random adjustment
    
    return Math.min(100, Math.max(0, Math.round(baseEngagement + randomFactor)));
  };
  
  // Helper functions for generating detailed feedback
  const getContentDetails = (score: number, content: string): string[] => {
    const details = [];
    
    if (score < 50) {
      details.push("Content needs significant improvement");
    } else if (score < 70) {
      details.push("Content is acceptable but could be better");
    } else if (score < 90) {
      details.push("Good content quality");
    } else {
      details.push("Excellent content quality");
    }
    
    if (content.length < 200) {
      details.push("Content is too short");
    } else if (content.length > 1000) {
      details.push("Content may be too long for some recipients");
    }
    
    return details;
  };
  
  const getContentSuggestions = (score: number, content: string): string[] => {
    const suggestions = [];
    
    if (!content.includes("{name}") && !content.includes("[name]")) {
      suggestions.push("Add personalization with recipient's name");
    }
    
    if (
      !content.toLowerCase().includes("click here") &&
      !content.toLowerCase().includes("learn more") &&
      !content.toLowerCase().includes("get started") &&
      !content.toLowerCase().includes("sign up")
    ) {
      suggestions.push("Include a clear call-to-action");
    }
    
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount > 3) {
      suggestions.push("Reduce the number of images to improve deliverability");
    }
    
    const spamTriggers = ["free", "buy now", "limited time", "act now", "!!!"];
    spamTriggers.forEach(trigger => {
      if (content.toLowerCase().includes(trigger)) {
        suggestions.push(`Avoid spam trigger word: "${trigger}"`);
      }
    });
    
    if (suggestions.length === 0) {
      suggestions.push("Your content is well-optimized");
    }
    
    return suggestions;
  };
  
  const getSubjectDetails = (score: number, subject: string): string[] => {
    const details = [];
    
    if (score < 50) {
      details.push("Subject line needs improvement");
    } else if (score < 70) {
      details.push("Subject line is acceptable");
    } else if (score < 90) {
      details.push("Good subject line");
    } else {
      details.push("Excellent subject line");
    }
    
    if (subject.length < 5) {
      details.push("Subject is too short");
    } else if (subject.length > 50) {
      details.push("Subject may be too long");
    }
    
    return details;
  };
  
  const getSubjectSuggestions = (score: number, subject: string): string[] => {
    const suggestions = [];
    
    if (!subject.includes("{name}") && !subject.includes("[name]")) {
      suggestions.push("Add personalization to subject line");
    }
    
    if (subject.length < 5) {
      suggestions.push("Make your subject line more descriptive");
    } else if (subject.length > 50) {
      suggestions.push("Shorten your subject line for better readability");
    }
    
    if (subject === subject.toUpperCase() && subject.length > 5) {
      suggestions.push("Avoid using all caps in subject line");
    }
    
    const spamTriggers = ["free", "buy now", "act now", "limited time", "!!!"];
    spamTriggers.forEach(trigger => {
      if (subject.toLowerCase().includes(trigger)) {
        suggestions.push(`Remove spam trigger word from subject: "${trigger}"`);
      }
    });
    
    if (suggestions.length === 0) {
      suggestions.push("Your subject line is well-optimized");
    }
    
    return suggestions;
  };
  
  const getDeliverabilityDetails = (score: number, content: string): string[] => {
    const details = [];
    
    if (score < 50) {
      details.push("High risk of spam filters");
    } else if (score < 70) {
      details.push("Moderate risk of spam filters");
    } else if (score < 90) {
      details.push("Good deliverability expected");
    } else {
      details.push("Excellent deliverability expected");
    }
    
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount > 3) {
      details.push("Too many images detected");
    }
    
    return details;
  };
  
  const getDeliverabilityFixes = (score: number, content: string): string[] => {
    const suggestions = [];
    
    const spamTriggers = ["free", "buy now", "limited time", "act now", "win", "!!!"];
    spamTriggers.forEach(trigger => {
      if (content.toLowerCase().includes(trigger)) {
        suggestions.push(`Remove spam trigger word: "${trigger}"`);
      }
    });
    
    if (content.includes("bit.ly") || content.includes("tinyurl")) {
      suggestions.push("Use full URLs instead of shortened links");
    }
    
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      suggestions.push("Reduce the number of exclamation marks");
    }
    
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount > 3) {
      suggestions.push("Reduce the number of images");
    }
    
    if (suggestions.length === 0) {
      suggestions.push("Your email has good deliverability characteristics");
    }
    
    return suggestions;
  };
  
  const getEngagementSuggestions = (score: number): string[] => {
    if (score < 50) {
      return [
        "Consider revising both content and subject line",
        "Add more personalization and relevant content",
        "Make your call-to-action more prominent"
      ];
    } else if (score < 70) {
      return [
        "Your email will perform adequately, but could be improved",
        "Try A/B testing with different content approaches"
      ];
    } else if (score < 90) {
      return ["Good engagement expected", "Consider A/B testing to optimize further"];
    } else {
      return ["Excellent engagement prediction", "This email is well-optimized"];
    }
  };
  
  const calculatePredictedOpenRate = (engagementScore: number): number => {
    // Convert engagement score to predicted open rate (with some randomness)
    const baseOpenRate = (engagementScore * 0.8) + 10; // 10-90% range
    const randomFactor = Math.random() * 6 - 3; // -3 to +3 random adjustment
    return Math.round(Math.min(98, Math.max(5, baseOpenRate + randomFactor)));
  };
  
  const calculatePredictedClickRate = (engagementScore: number): number => {
    // Convert engagement score to predicted click rate (typically lower than open rate)
    const baseClickRate = (engagementScore * 0.4) + 2; // 2-42% range
    const randomFactor = Math.random() * 4 - 2; // -2 to +2 random adjustment
    return Math.round(Math.min(45, Math.max(1, baseClickRate + randomFactor)));
  };
  
  const getScoreColor = (score: number): string => {
    if (score < 50) return "text-red-600";
    if (score < 70) return "text-amber-600";
    if (score < 90) return "text-emerald-600";
    return "text-green-600";
  };
  
  const getScoreBgColor = (score: number): string => {
    if (score < 50) return "bg-red-100";
    if (score < 70) return "bg-amber-100";
    if (score < 90) return "bg-emerald-100";
    return "bg-green-100";
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 border-b">
        <div className="flex items-center gap-2">
          <Gauge className="h-6 w-6 text-white" />
          <h2 className="text-xl font-bold text-white">Email Health Score Predictor</h2>
        </div>
        <p className="text-purple-100 mt-1">
          Analyze your email before sending to predict performance and identify improvement areas
        </p>
      </div>
      
      {!showResults ? (
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter your email subject line"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience Size</label>
              <input
                type="number"
                value={audienceSize}
                onChange={(e) => setAudienceSize(parseInt(e.target.value) || 0)}
                placeholder="Number of recipients"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste your email content here (including HTML if applicable)"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={analyzeEmail}
              disabled={isAnalyzing || !emailContent.trim() || !subject.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <Zap className="h-5 w-5" />
                  Analyze Email Health
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Overall Score */}
          <div className="mb-8 text-center">
            <div className="relative w-36 h-36 mx-auto">
              <div className={`w-full h-full rounded-full flex items-center justify-center border-8 ${healthScore < 50 ? 'border-red-200' : healthScore < 70 ? 'border-amber-200' : healthScore < 90 ? 'border-emerald-200' : 'border-green-200'}`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(healthScore)}`}>{healthScore}</div>
                  <div className="text-gray-500 text-sm">Health Score</div>
                </div>
              </div>
              <svg className="absolute inset-0" width="144" height="144" viewBox="0 0 144 144">
                <circle
                  cx="72"
                  cy="72"
                  r="66"
                  fill="none"
                  stroke={healthScore < 50 ? '#f87171' : healthScore < 70 ? '#fbbf24' : healthScore < 90 ? '#34d399' : '#22c55e'}
                  strokeWidth="6"
                  strokeDasharray="415"
                  strokeDashoffset={415 - ((healthScore / 100) * 415)}
                  transform="rotate(-90, 72, 72)"
                />
              </svg>
            </div>
            
            <div className="mt-4">
              {healthScore < 50 ? (
                <p className="text-red-600 font-medium">Needs Improvement</p>
              ) : healthScore < 70 ? (
                <p className="text-amber-600 font-medium">Average Performance</p>
              ) : healthScore < 90 ? (
                <p className="text-emerald-600 font-medium">Good Performance Expected</p>
              ) : (
                <p className="text-green-600 font-medium">Excellent Performance Expected</p>
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <p>Predicted Delivery Outcome for {audienceSize.toLocaleString()} Recipients</p>
            </div>
          </div>
          
          {/* Score Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(scoreBreakdown).map(([key, score]) => (
                <div key={key} className="text-center">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div 
                      className={`h-1.5 rounded-full ${score < 50 ? 'bg-red-500' : score < 70 ? 'bg-amber-500' : score < 90 ? 'bg-emerald-500' : 'bg-green-500'}`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium text-gray-900">{score}</div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Detailed Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Detailed Analysis</h3>
            
            {scoreCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getScoreBgColor(category.score)}`}>
                      {category.icon}
                    </div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                    {category.score}
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="mb-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Details</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {category.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="mt-0.5 shrink-0">•</div>
                          <div>{detail}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Suggestions</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {category.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                          <div>{suggestion}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Success Prediction */}
          <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Success Prediction
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-sm text-gray-500">Estimated Opens</div>
                <div className="text-xl font-bold text-gray-900">
                  {Math.round((calculatePredictedOpenRate(scoreBreakdown.engagement) / 100) * audienceSize).toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">
                  {calculatePredictedOpenRate(scoreBreakdown.engagement)}% of {audienceSize.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-sm text-gray-500">Estimated Clicks</div>
                <div className="text-xl font-bold text-gray-900">
                  {Math.round((calculatePredictedClickRate(scoreBreakdown.engagement) / 100) * audienceSize).toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">
                  {calculatePredictedClickRate(scoreBreakdown.engagement)}% of {audienceSize.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-sm text-gray-500">Spam Risk</div>
                <div className="text-xl font-bold text-gray-900">
                  {scoreBreakdown.deliverability > 80 ? 'Low' : scoreBreakdown.deliverability > 60 ? 'Medium' : 'High'}
                </div>
                <div className="text-sm text-gray-700">
                  {100 - scoreBreakdown.deliverability}% chance of filtering
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Button
              variant="outline"
              onClick={resetAnalysis}
              className="flex-1 border-gray-300"
            >
              Analyze Another Email
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              <ClipboardCheck className="h-5 w-5 mr-2" />
              Apply Suggestions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 