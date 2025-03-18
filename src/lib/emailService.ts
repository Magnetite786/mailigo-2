import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface EmailParams {
  to: string[];
  subject: string;
  body: string;
  fromEmail: string;
  appPassword: string;
  batchSize?: number;
  delayBetweenBatches?: number;
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
        
        // Improved CSV parsing
        lines.forEach(line => {
          const values = line.split(',');
          // Try to find an email in each value
          values.forEach(value => {
            // Better email validation
            const trimmedValue = value.trim();
            // Common email regex pattern
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailRegex.test(trimmedValue)) {
              emails.push(trimmedValue);
            }
          });
        });
        
        console.log('Parsed CSV emails:', emails);
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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // Read the Excel file using XLSX library
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the worksheet to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
        
        // Extract emails from all cells
        const emails: string[] = [];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        rows.forEach(row => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              if (typeof cell === 'string') {
                const trimmedCell = cell.trim();
                if (emailRegex.test(trimmedCell)) {
                  emails.push(trimmedCell);
                }
              }
            });
          }
        });
        
        console.log('Parsed Excel emails:', emails);
        resolve(emails);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Error parsing Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    // Read as array buffer for Excel files
    reader.readAsBinaryString(file);
  });
};
