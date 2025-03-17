
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize express app
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Email sending endpoint
app.post('/api/send-emails', async (req, res) => {
  try {
    const { to, subject, body, fromEmail, appPassword } = req.body;
    
    if (!to || !to.length || !subject || !body || !fromEmail || !appPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    console.log(`Attempting to send emails to ${to.length} recipients`);
    
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: fromEmail,
        pass: appPassword // This is the app password from Google
      }
    });
    
    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < to.length; i += batchSize) {
      const batch = to.slice(i, i + batchSize);
      
      const mailOptions = {
        from: fromEmail,
        bcc: batch, // Using BCC for bulk emails
        subject: subject,
        html: body,
      };
      
      const info = await transporter.sendMail(mailOptions);
      results.push(info);
      
      console.log(`Batch sent: ${i + 1} to ${Math.min(i + batchSize, to.length)} of ${to.length}`);
      
      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < to.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Successfully sent emails to ${to.length} recipients`,
      results 
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send emails',
      error: error.toString()
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
