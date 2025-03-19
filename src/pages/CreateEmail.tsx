import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gauge, Mail, ArrowRight } from "lucide-react";
import { EmailHealthScorePredictor } from "@/components/email/EmailHealthScorePredictor";

export default function CreateEmail() {
  const [showHealthScorePredictor, setShowHealthScorePredictor] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Create Email Campaign</h1>
      
      <div className="mb-8 bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <Gauge className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Maximize Your Email Success</h2>
          <p className="text-gray-600 mb-3">
            Use our exclusive Email Health Score™ Predictor to analyze your email before sending. 
            Get insights on deliverability, engagement, and actionable suggestions to improve performance.
          </p>
          <Button 
            onClick={() => setShowHealthScorePredictor(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Analyze Email Health
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      {showHealthScorePredictor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <Button 
                onClick={() => setShowHealthScorePredictor(false)}
                variant="outline"
                className="absolute -top-4 -right-4 rounded-full w-8 h-8 p-0 bg-white"
              >
                &times;
              </Button>
              <EmailHealthScorePredictor />
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center max-w-md mx-auto py-12">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Email Campaign</h2>
          <p className="text-gray-600 mb-6">
            Set up your email campaign with our easy-to-use editor. Design, personalize, and schedule your emails.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
            Start Creating
          </Button>
        </div>
      </div>
    </div>
  );
} 