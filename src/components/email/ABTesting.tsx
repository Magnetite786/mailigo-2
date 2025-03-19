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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Loader2, BarChart4, TestTube2, Plus, Copy, Send, Wand2, MailPlus } from "lucide-react";

interface ABTestingProps {
  onSendTest?: (variant: EmailVariant) => Promise<void>;
}

interface EmailVariant {
  id: string;
  name: string;
  subject: string;
  content: string;
  testGroup: number; // Percentage of recipients to send this variant to
  opens?: number;
  clicks?: number;
  replies?: number;
  conversions?: number;
  status?: 'draft' | 'testing' | 'winner' | 'completed';
}

const ABTesting = ({ onSendTest }: ABTestingProps) => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<EmailVariant[]>([
    {
      id: "variant-1",
      name: "Variant A",
      subject: "Limited time offer: 20% off our premium plan",
      content: "Hi {{firstName}},\n\nWe're excited to offer you an exclusive 20% discount on our premium plan. This offer is only available for the next 48 hours.\n\nClick here to upgrade and save!\n\nBest regards,\nThe Team",
      testGroup: 50,
      opens: 124,
      clicks: 45,
      replies: 5,
      conversions: 12,
      status: 'completed'
    },
    {
      id: "variant-2",
      name: "Variant B",
      subject: "Don't miss out: Save 20% today only",
      content: "Hello {{firstName}},\n\nToday's your lucky day! For the next 24 hours, you can upgrade to premium and save 20%.\n\nThis is our best offer of the season and it won't last long.\n\nUpgrade now!\n\nRegards,\nThe Team",
      testGroup: 50,
      opens: 132,
      clicks: 52,
      replies: 8,
      conversions: 18,
      status: 'winner'
    }
  ]);
  const [activeTab, setActiveTab] = useState("editor");
  const [newVariant, setNewVariant] = useState<EmailVariant>({
    id: `variant-${variants.length + 1}`,
    name: `Variant ${String.fromCharCode(65 + variants.length)}`, // A, B, C, etc.
    subject: "",
    content: "",
    testGroup: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testPercentage, setTestPercentage] = useState(10);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  const handleAddVariant = () => {
    // Adjust test group percentages for all variants
    const totalVariants = variants.length + 1;
    const evenPercentage = Math.floor(100 / totalVariants);
    
    const adjustedVariants = variants.map(variant => ({
      ...variant,
      testGroup: evenPercentage
    }));
    
    const newVariantWithId = {
      ...newVariant,
      id: `variant-${variants.length + 1}`,
      name: `Variant ${String.fromCharCode(65 + variants.length)}`,
      testGroup: evenPercentage,
      status: 'draft' as const
    };
    
    setVariants([...adjustedVariants, newVariantWithId]);
    setNewVariant({
      id: `variant-${variants.length + 2}`,
      name: `Variant ${String.fromCharCode(65 + variants.length + 1)}`,
      subject: "",
      content: "",
      testGroup: 0,
    });
    setIsCreating(false);
    
    toast({
      title: "Variant added",
      description: `${newVariantWithId.name} has been added to your test`,
    });
  };

  const handleDeleteVariant = (id: string) => {
    // Filter out the variant with the specified id
    const filteredVariants = variants.filter(variant => variant.id !== id);
    
    // Adjust test group percentages for remaining variants
    const totalVariants = filteredVariants.length;
    if (totalVariants > 0) {
      const evenPercentage = Math.floor(100 / totalVariants);
      const adjustedVariants = filteredVariants.map(variant => ({
        ...variant,
        testGroup: evenPercentage
      }));
      setVariants(adjustedVariants);
    } else {
      setVariants([]);
    }
    
    toast({
      title: "Variant removed",
      description: "The variant has been deleted from your test",
    });
  };

  const handleDuplicateVariant = (id: string) => {
    const variantToDuplicate = variants.find(variant => variant.id === id);
    if (!variantToDuplicate) return;
    
    const newId = `variant-${variants.length + 1}`;
    const newName = `Variant ${String.fromCharCode(65 + variants.length)}`;
    
    const duplicatedVariant = {
      ...variantToDuplicate,
      id: newId,
      name: newName,
      status: 'draft' as const
    };
    
    // Adjust test group percentages
    const totalVariants = variants.length + 1;
    const evenPercentage = Math.floor(100 / totalVariants);
    
    const adjustedVariants = variants.map(variant => ({
      ...variant,
      testGroup: evenPercentage
    }));
    
    setVariants([...adjustedVariants, {
      ...duplicatedVariant,
      testGroup: evenPercentage
    }]);
    
    toast({
      title: "Variant duplicated",
      description: `${duplicatedVariant.name} has been created based on ${variantToDuplicate.name}`,
    });
  };

  const handleStartTest = () => {
    // In a real app, this would send a request to begin the A/B test
    setIsAnalyzing(true);
    
    // Simulate an API call
    setTimeout(() => {
      const updatedVariants = variants.map(variant => ({
        ...variant,
        status: 'testing' as const
      }));
      setVariants(updatedVariants);
      setIsAnalyzing(false);
      
      toast({
        title: "A/B Test started",
        description: `Your test will be sent to ${testPercentage}% of your audience`,
      });
      
      setActiveTab("results");
    }, 1500);
  };

  const handleDeclareWinner = (id: string) => {
    // In a real app, this would send a request to declare the winning variant
    const updatedVariants = variants.map(variant => ({
      ...variant,
      status: variant.id === id ? 'winner' : 'completed'
    }));
    
    setVariants(updatedVariants);
    setSelectedWinner(id);
    
    toast({
      title: "Winner selected",
      description: "The winning variant will be sent to the remaining audience",
    });
  };

  const getConversionRate = (variant: EmailVariant) => {
    if (!variant.opens) return 0;
    return ((variant.conversions || 0) / variant.opens) * 100;
  };
  
  const getOpenRate = (variant: EmailVariant) => {
    return variant.opens ? ((variant.opens || 0) / 200) * 100 : 0; // Assuming 200 sent
  };
  
  const getClickRate = (variant: EmailVariant) => {
    if (!variant.opens) return 0;
    return ((variant.clicks || 0) / variant.opens) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TestTube2 className="h-5 w-5 mr-2 text-primary" />
          A/B Testing
        </CardTitle>
        <CardDescription>
          Create email variants and test which performs better
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Email Variants</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <Accordion key={variant.id} type="single" collapsible className="border rounded-md">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{variant.name}</span>
                          {variant.status && (
                            <Badge variant={
                              variant.status === 'winner' ? 'success' : 
                              variant.status === 'testing' ? 'secondary' : 
                              variant.status === 'completed' ? 'default' : 
                              'outline'
                            }>
                              {variant.status}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Test group: {variant.testGroup}%
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`variant-${index}-subject`}>Subject Line</Label>
                          <Input 
                            id={`variant-${index}-subject`}
                            value={variant.subject}
                            onChange={(e) => {
                              const updatedVariants = [...variants];
                              updatedVariants[index].subject = e.target.value;
                              setVariants(updatedVariants);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`variant-${index}-content`}>Email Content</Label>
                          <Textarea 
                            id={`variant-${index}-content`}
                            value={variant.content}
                            onChange={(e) => {
                              const updatedVariants = [...variants];
                              updatedVariants[index].content = e.target.value;
                              setVariants(updatedVariants);
                            }}
                            className="min-h-[150px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`variant-${index}-percentage`}>Percentage of Test Group</Label>
                          <div className="flex items-center gap-4">
                            <Input 
                              id={`variant-${index}-percentage`}
                              type="number"
                              min="1"
                              max="100"
                              value={variant.testGroup}
                              onChange={(e) => {
                                const updatedVariants = [...variants];
                                updatedVariants[index].testGroup = Number(e.target.value);
                                setVariants(updatedVariants);
                              }}
                              className="w-24"
                            />
                            <span>%</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateVariant(variant.id)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Duplicate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVariant(variant.id)}
                            disabled={variants.length <= 1}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              
              {isCreating ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">New Variant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-variant-subject">Subject Line</Label>
                      <Input 
                        id="new-variant-subject"
                        value={newVariant.subject}
                        onChange={(e) => setNewVariant({...newVariant, subject: e.target.value})}
                        placeholder="Enter subject line"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-variant-content">Email Content</Label>
                      <Textarea 
                        id="new-variant-content"
                        value={newVariant.content}
                        onChange={(e) => setNewVariant({...newVariant, content: e.target.value})}
                        className="min-h-[150px]"
                        placeholder="Enter email content"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddVariant}
                      disabled={!newVariant.subject || !newVariant.content}
                    >
                      Add Variant
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              )}
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Test Settings</CardTitle>
                <CardDescription>Configure your A/B test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-size">Test Group Size</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="test-size"
                      type="number"
                      min="5"
                      max="50"
                      value={testPercentage}
                      onChange={(e) => setTestPercentage(Number(e.target.value))}
                      className="w-24"
                    />
                    <span>% of your total audience</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The winning variant will be sent to the remaining {100 - testPercentage}% of your audience
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Success Metrics</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="metric-opens" defaultChecked />
                      <Label htmlFor="metric-opens">Open Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="metric-clicks" defaultChecked />
                      <Label htmlFor="metric-clicks">Click Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="metric-conversions" defaultChecked />
                      <Label htmlFor="metric-conversions">Conversion Rate</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Test Duration</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue placeholder="Select test duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleStartTest}
                  disabled={variants.length < 2 || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Preparing Test...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Start A/B Test
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Comparison</CardTitle>
                <CardDescription>
                  Results from your A/B test campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Opens</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{variant.subject}</TableCell>
                        <TableCell className="text-right">{variant.opens || "—"}</TableCell>
                        <TableCell className="text-right">{variant.clicks || "—"}</TableCell>
                        <TableCell className="text-right">{variant.conversions || "—"}</TableCell>
                        <TableCell className="text-right">
                          {variant.status && (
                            <Badge variant={
                              variant.status === 'winner' ? 'success' : 
                              variant.status === 'testing' ? 'secondary' : 
                              variant.status === 'completed' ? 'default' : 
                              'outline'
                            }>
                              {variant.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {variant.status === 'testing' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeclareWinner(variant.id)}
                            >
                              Select Winner
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variants.map((variant) => (
                <Card key={variant.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{variant.name}</span>
                      {variant.status === 'winner' && <Badge variant="success">Winner</Badge>}
                    </CardTitle>
                    <CardDescription className="truncate">{variant.subject}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Open Rate</span>
                        <span className="font-medium">{getOpenRate(variant).toFixed(1)}%</span>
                      </div>
                      <Progress value={getOpenRate(variant)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Click Rate</span>
                        <span className="font-medium">{getClickRate(variant).toFixed(1)}%</span>
                      </div>
                      <Progress value={getClickRate(variant)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Conversion Rate</span>
                        <span className="font-medium">{getConversionRate(variant).toFixed(1)}%</span>
                      </div>
                      <Progress value={getConversionRate(variant)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {activeTab === "editor" ? (
          <div className="flex gap-2">
            <Button variant="outline">
              <Wand2 className="h-4 w-4 mr-1" />
              AI Suggestions
            </Button>
            <Button variant="outline">
              Save Draft
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setActiveTab("editor")}>
            Edit Test
          </Button>
        )}
        
        {activeTab === "results" && selectedWinner && (
          <Button>
            <MailPlus className="h-4 w-4 mr-1" />
            Send to Remaining Audience
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ABTesting; 