import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Email sending endpoint
app.post('/api/send-emails', async (req, res) => {
  try {
    const { to, subject, body, fromEmail, appPassword, batchSize = 10, delayBetweenBatches = 1 } = req.body;
    
    if (!to || !to.length || !subject || !body || !fromEmail || !appPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    console.log(`Attempting to send emails to ${to.length} recipients`);
    console.log(`Using batch size: ${batchSize}, delay: ${delayBetweenBatches}s`);
    
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: fromEmail,
        pass: appPassword // This is the app password from Google
      }
    });
    
    // Send emails in batches to avoid rate limits
    const actualBatchSize = Math.min(parseInt(batchSize), 50); // Cap at 50 for safety
    const actualDelay = Math.max(parseInt(delayBetweenBatches), 1) * 1000; // Minimum 1 second delay
    
    const results = [];
    const failedEmails = [];
    
    for (let i = 0; i < to.length; i += actualBatchSize) {
      const batch = to.slice(i, i + actualBatchSize);
      
      try {
        const mailOptions = {
          from: fromEmail,
          bcc: batch, // Using BCC for bulk emails
          subject: subject,
          html: body,
        };
        
        const info = await transporter.sendMail(mailOptions);
        results.push(info);
        
        console.log(`Batch sent: ${i + 1} to ${Math.min(i + actualBatchSize, to.length)} of ${to.length}`);
      } catch (batchError) {
        console.error(`Error sending batch ${i / actualBatchSize + 1}:`, batchError);
        failedEmails.push(...batch);
      }
      
      // Add a delay between batches to avoid rate limits
      if (i + actualBatchSize < to.length) {
        console.log(`Waiting ${actualDelay/1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
    
    // Determine status based on failures
    const status = failedEmails.length === 0 ? 'success' :
                  failedEmails.length === to.length ? 'failed' : 'partial';
    
    // Add delivered count to the response
    const deliveredCount = to.length - failedEmails.length;
    
    // If we've actually delivered some emails but status is 'failed', correct it
    const correctedStatus = deliveredCount > 0 ? (deliveredCount === to.length ? 'success' : 'partial') : 'failed';
    
    if (status !== correctedStatus) {
      console.log(`Correcting status from ${status} to ${correctedStatus} based on actual delivery count`);
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Sent emails to ${deliveredCount} of ${to.length} recipients`,
      status: correctedStatus,
      deliveredCount,
      results,
      failedEmails
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send emails',
      error: error.toString(),
      status: 'failed'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
