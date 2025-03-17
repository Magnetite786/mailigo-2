
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseCSV, parseExcel } from "@/lib/emailService";
import { FileUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailUploaderProps {
  onEmailsAdded: (emails: string[]) => void;
}

const EmailUploader = ({ onEmailsAdded }: EmailUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

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
        toast({
          variant: "destructive",
          title: "No emails found",
          description: "The uploaded file doesn't contain any valid email addresses.",
        });
      } else {
        onEmailsAdded(emails);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process the file",
      });
    } finally {
      setLoading(false);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="mt-4">
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
        <p className="text-sm text-muted-foreground">
          Upload a CSV or Excel file containing email addresses
        </p>
      </div>
    </div>
  );
};

export default EmailUploader;
