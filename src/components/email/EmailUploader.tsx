import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseCSV, parseExcel } from "@/lib/emailService";
import { FileUp, Loader2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmailUploaderProps {
  onEmailsAdded: (emails: string[]) => void;
}

const EmailUploader = ({ onEmailsAdded }: EmailUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, emails: number} | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setFileInfo(null);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      let emails: string[] = [];

      if (fileType === 'csv') {
        emails = await parseCSV(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        emails = await parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }

      if (emails.length === 0) {
        setError('No valid email addresses found in the file. Please check the file content and try again.');
        toast({
          variant: "destructive",
          title: "No emails found",
          description: "The uploaded file doesn't contain any valid email addresses.",
        });
      } else {
        setFileInfo({
          name: file.name,
          emails: emails.length
        });
        onEmailsAdded(emails);
        toast({
          title: "File uploaded successfully",
          description: `Found ${emails.length} email addresses in ${file.name}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process the file";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="outline"
          className="relative overflow-hidden"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileUp size={16} className="mr-2" />
              Upload CSV/Excel
            </>
          )}
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={loading}
          />
        </Button>
        {fileInfo && (
          <span className="text-sm text-green-600 flex items-center">
            <Mail className="mr-1 h-4 w-4" /> 
            {fileInfo.emails} emails from {fileInfo.name}
          </span>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-sm text-muted-foreground">
        Upload a CSV or Excel file containing email addresses. The file should contain one email per row/cell.
      </p>
    </div>
  );
};

export default EmailUploader;
