import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Send, X, Code, Eye, Settings } from "lucide-react";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
}

export function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [customization, setCustomization] = useState({
    companyName: "[Company Name]",
    primaryColor: "#6366F1",
    buttonText: "Get Started",
    additionalContent: ""
  });

  const handleCustomization = (field: string, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCustomizedPreview = () => {
    let preview = template.preview;
    preview = preview.replace(/\[Company Name\]/g, customization.companyName);
    preview = preview.replace(/#6366F1/g, customization.primaryColor);
    preview = preview.replace(/Get Started|Shop Now|Read More/g, customization.buttonText);
    return preview;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription>{template.description}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="preview" className="h-full">
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="h-[calc(100%-3rem)] overflow-auto">
            <div className="flex justify-center mb-4 space-x-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                onClick={() => setPreviewMode("desktop")}
                size="sm"
              >
                Desktop
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                onClick={() => setPreviewMode("mobile")}
                size="sm"
              >
                Mobile
              </Button>
            </div>

            <div className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden
              ${previewMode === "mobile" ? "max-w-sm" : "max-w-4xl"}`}
            >
              <div
                className="p-8"
                dangerouslySetInnerHTML={{ __html: getCustomizedPreview() }}
              />
            </div>
          </TabsContent>

          <TabsContent value="customize" className="h-[calc(100%-3rem)] overflow-auto">
            <div className="space-y-6 p-6">
              <div className="grid gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={customization.companyName}
                    onChange={(e) => handleCustomization("companyName", e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => handleCustomization("primaryColor", e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={customization.primaryColor}
                      onChange={(e) => handleCustomization("primaryColor", e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Button Text</Label>
                  <Input
                    value={customization.buttonText}
                    onChange={(e) => handleCustomization("buttonText", e.target.value)}
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <Label>Additional Content</Label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border rounded-md"
                    value={customization.additionalContent}
                    onChange={(e) => handleCustomization("additionalContent", e.target.value)}
                    placeholder="Add any additional content here..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="h-[calc(100%-3rem)] overflow-auto">
            <div className="p-4 bg-gray-900 text-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">HTML Code</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-100"
                  onClick={() => navigator.clipboard.writeText(getCustomizedPreview())}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>
              <pre className="overflow-auto">
                <code>{getCustomizedPreview()}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(getCustomizedPreview())}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Template
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => window.location.href = "/signup"}>
              <Send className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 