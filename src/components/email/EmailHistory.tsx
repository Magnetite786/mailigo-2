import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, Clock, Calendar, ChevronDown, ChevronUp, Mail, ArrowRightLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface EmailHistoryItem {
  id: string;
  subject: string;
  recipients: number;
  status: 'success' | 'failed' | 'partial';
  date: string;
  body?: string;
  fromEmail?: string;
  deliveredCount?: number;
  failedEmails?: string[];
  batchSize?: number;
  delayBetweenBatches?: number;
}

interface EmailHistoryProps {
  history: EmailHistoryItem[];
  onDelete: (id: string) => void;
}

const EmailHistory: React.FC<EmailHistoryProps> = ({ history, onDelete }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [detailsItem, setDetailsItem] = useState<EmailHistoryItem | null>(null);
  
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="mx-auto h-12 w-12 mb-4 opacity-20" />
        <p>No email history found</p>
        <p className="text-sm">Your sent emails will appear here</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };
  
  const showDetails = (item: EmailHistoryItem) => {
    setDetailsItem(item);
  };

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="font-medium">{item.subject}</h4>
                <div className="flex space-x-2 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Mail className="mr-1 h-3 w-3" />
                    {item.recipients} recipients
                  </span>
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`${
                    (item.status === "success" || (item.deliveredCount && item.deliveredCount === item.recipients))
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : (item.status === "partial" || (item.deliveredCount && item.deliveredCount > 0 && item.deliveredCount < item.recipients))
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }`}
                >
                  {item.deliveredCount && item.deliveredCount > 0 
                    ? item.deliveredCount === item.recipients 
                      ? "Success" 
                      : "Partial"
                    : item.status === "success"
                      ? "Success" 
                      : item.status === "partial" 
                        ? "Partial" 
                        : "Failed"
                  }
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => toggleExpand(item.id)}>
                  {expandedItem === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => showDetails(item)}>
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            
            {expandedItem === item.id && (
              <div className="mt-2 pt-2 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">From:</p>
                    <p>{item.fromEmail || "Not recorded"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivered:</p>
                    <p>{item.deliveredCount || item.recipients} emails</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Batch Size:</p>
                    <p>{item.batchSize || "Default"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delay Between Batches:</p>
                    <p>{item.delayBetweenBatches || "Default"} seconds</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
      
      {/* Campaign Details Dialog */}
      <Dialog open={!!detailsItem} onOpenChange={(open) => !open && setDetailsItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          
          {detailsItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium">{detailsItem.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{new Date(detailsItem.date).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        className={`${
                          (detailsItem.status === "success" || (detailsItem.deliveredCount && detailsItem.deliveredCount === detailsItem.recipients))
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : (detailsItem.status === "partial" || (detailsItem.deliveredCount && detailsItem.deliveredCount > 0 && detailsItem.deliveredCount < detailsItem.recipients))
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                      >
                        {detailsItem.deliveredCount && detailsItem.deliveredCount > 0 
                          ? detailsItem.deliveredCount === detailsItem.recipients 
                            ? "Success" 
                            : "Partial"
                          : detailsItem.status === "success"
                            ? "Success" 
                            : detailsItem.status === "partial" 
                              ? "Partial" 
                              : "Failed"
                        }
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Delivery Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Recipients:</span>
                      <span>{detailsItem.recipients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered:</span>
                      <span>{detailsItem.deliveredCount || detailsItem.recipients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed:</span>
                      <span>
                        {detailsItem.failedEmails?.length || 
                          (detailsItem.status === 'failed' ? detailsItem.recipients : 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card className="p-4">
                <h3 className="font-medium mb-2">Email Content Preview</h3>
                <div className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ __html: detailsItem.body || "<p>Content not available</p>" }}
                  />
                </div>
              </Card>
              
              {detailsItem.failedEmails && detailsItem.failedEmails.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-medium mb-2">Failed Emails</h3>
                  <div className="bg-muted p-2 rounded-md max-h-40 overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                      {detailsItem.failedEmails.map((email, i) => (
                        <li key={i}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailHistory; 