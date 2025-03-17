
import { toast } from "@/hooks/use-toast";

interface EmailParams {
  to: string[];
  subject: string;
  body: string;
  fromEmail: string;
  appPassword: string;
}

// Server URL - change this to your actual server URL when deployed
const SERVER_URL = "http://localhost:3001";

export const sendEmails = async (params: EmailParams): Promise<boolean> => {
  try {
    // Show loading toast
    toast({
      title: "Sending emails...",
      description: `Attempting to send ${params.to.length} emails. This may take a moment.`,
    });

    // Call the backend API
    const response = await fetch(`${SERVER_URL}/api/send-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send emails');
    }

    // Success notification
    toast({
      title: "Emails sent successfully!",
      description: `${params.to.length} emails have been sent.`,
    });

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    toast({
      variant: "destructive",
      title: "Failed to send emails",
      description: error instanceof Error ? error.message : "Unknown error occurred",
    });
    return false;
  }
};

export const parseCSV = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/);
        const emails: string[] = [];
        
        // Simple CSV parsing - in production would use a more robust solution
        lines.forEach(line => {
          const values = line.split(',');
          // Try to find an email in each value
          values.forEach(value => {
            // Basic email validation
            if (value.includes('@') && value.includes('.')) {
              emails.push(value.trim());
            }
          });
        });
        
        resolve(emails);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

export const parseExcel = async (file: File): Promise<string[]> => {
  // This is a placeholder - in a real app we would use a library like xlsx
  // For now, we'll just simulate parsing an Excel file
  await new Promise(resolve => setTimeout(resolve, 1000));
  return ["excel@example.com", "simulated@example.com", "fake@demo.com"];
};
