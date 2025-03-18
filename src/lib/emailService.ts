import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { supabase } from "./supabase";
import { sendEmail } from "./utils";

interface EmailParams {
  to: string[];
  subject: string;
  body: string;
  fromEmail: string;
  appPassword: string;
  batchSize?: number;
  delayBetweenBatches?: number;
}

interface ScheduledEmail {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  scheduled_date: string;
  status: "pending" | "sent" | "failed";
  user_id: string;
}

interface WorkflowStep {
  id: string;
  subject: string;
  content: string;
  delay: number;
  condition?: {
    type: "open" | "click" | "not_open" | "not_click";
    value: number;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: "active" | "paused" | "draft";
  user_id: string;
}

// Server URL - change this to your actual server URL when deployed
const SERVER_URL = "http://localhost:3001";

interface SendEmailParams {
  to: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  fromEmail?: string;
  appPassword?: string;
}

export const sendEmails = async ({
  to,
  subject,
  body,
  isHtml = false,
  fromEmail,
  appPassword
}: SendEmailParams) => {
  try {
    // Get email config if not provided
    if (!fromEmail || !appPassword) {
      const { data: config } = await supabase
        .from('email_config')
        .select('email, app_password')
        .single();

      if (!config) {
        throw new Error('Email configuration not found');
      }

      fromEmail = fromEmail || config.email;
      appPassword = appPassword || config.app_password;
    }

    // Create email record
    const { data: emailData, error: emailError } = await supabase
      .from('emails')
      .insert({
        subject,
        content: body,
        from_email: fromEmail,
        total_recipients: to.length,
        status: 'pending',
        is_html: isHtml
      })
      .select()
      .single();

    if (emailError) throw emailError;

    // Create recipient records
    const recipientRecords = to.map(email => ({
      email_id: emailData.id,
      recipient_email: email,
      status: 'pending'
    }));

    const { error: recipientError } = await supabase
      .from('email_recipients')
      .insert(recipientRecords);

    if (recipientError) throw recipientError;

    // Send to email server
    const response = await fetch('/api/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        fromEmail,
        appPassword,
        isHtml
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Update email status
    await supabase
      .from('emails')
      .update({
        status: result.status,
        delivered_count: result.deliveredCount
      })
      .eq('id', emailData.id);

    // Update recipient statuses
    if (result.failedEmails?.length > 0) {
      await supabase
        .from('email_recipients')
        .update({ status: 'failed' })
        .eq('email_id', emailData.id)
        .in('recipient_email', result.failedEmails);
    }

    if (result.deliveredCount > 0) {
      await supabase
        .from('email_recipients')
        .update({ status: 'delivered', sent_at: new Date().toISOString() })
        .eq('email_id', emailData.id)
        .not('recipient_email', 'in', result.failedEmails || []);
    }

    return result;
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
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
