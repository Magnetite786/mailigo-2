import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Store scheduled emails in memory (in a production app, use a database)
const scheduledEmails = [];

// Function to send email
const sendEmail = async (emailData) => {
  const { to, subject, body, fromEmail, appPassword, batchSize = 10, delayBetweenBatches = 1, isHtml = false } = emailData;
  
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
        bcc: batch,
        subject: subject,
        [isHtml ? 'html' : 'text']: body, // Use html or text based on isHtml flag
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
  
  return { 
    success: true, 
    message: `Sent ${isHtml ? 'HTML' : 'text'} emails to ${deliveredCount} of ${to.length} recipients`,
    status,
    deliveredCount,
    results,
    failedEmails
  };
};

// Email sending endpoint
app.post('/api/send-emails', async (req, res) => {
  try {
    const { to, subject, body, fromEmail, appPassword, batchSize = 10, delayBetweenBatches = 1, isHtml = false, scheduled = false, scheduledDate = null } = req.body;
    
    if (!to || !to.length || !subject || !body || !fromEmail || !appPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Handle scheduled emails
    if (scheduled && scheduledDate) {
      const scheduledTime = new Date(scheduledDate);
      const currentTime = new Date();
      
      if (scheduledTime <= currentTime) {
        return res.status(400).json({ 
          success: false, 
          message: 'Scheduled time must be in the future' 
        });
      }
      
      const emailData = {
        id: Date.now().toString(),
        to,
        subject,
        body,
        fromEmail,
        appPassword,
        batchSize,
        delayBetweenBatches,
        isHtml,
        scheduledTime,
        status: 'scheduled'
      };
      
      scheduledEmails.push(emailData);
      
      // Schedule the email to be sent at the specified time
      const timeUntilSend = scheduledTime.getTime() - currentTime.getTime();
      setTimeout(async () => {
        try {
          console.log(`Sending scheduled email: ${emailData.id}`);
          
          // Find the email in the scheduled list
          const emailIndex = scheduledEmails.findIndex(email => email.id === emailData.id);
          if (emailIndex === -1) {
            console.error(`Scheduled email ${emailData.id} not found`);
            return;
          }
          
          // Update status to 'sending'
          scheduledEmails[emailIndex].status = 'sending';
          
          // Send the email
          const result = await sendEmail(emailData);
          
          // Update status to final status
          scheduledEmails[emailIndex].status = result.status;
          scheduledEmails[emailIndex].deliveredCount = result.deliveredCount;
          scheduledEmails[emailIndex].sentAt = new Date();
          
          console.log(`Scheduled email completed: ${emailData.id} with status ${result.status}`);
        } catch (error) {
          console.error(`Error sending scheduled email ${emailData.id}:`, error);
          
          // Update status to 'failed'
          const emailIndex = scheduledEmails.findIndex(email => email.id === emailData.id);
          if (emailIndex !== -1) {
            scheduledEmails[emailIndex].status = 'failed';
            scheduledEmails[emailIndex].error = error.message;
          }
        }
      }, timeUntilSend);
      
      return res.status(200).json({ 
        success: true, 
        message: `Email scheduled for ${scheduledTime.toISOString()}`,
        id: emailData.id,
        status: 'scheduled'
      });
    }
    
    // For immediate sending
    console.log(`Attempting to send ${isHtml ? 'HTML' : 'text'} emails to ${to.length} recipients`);
    console.log(`Using batch size: ${batchSize}, delay: ${delayBetweenBatches}s`);
    
    const result = await sendEmail(req.body);
    res.status(200).json(result);
    
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

// Get scheduled emails endpoint
app.get('/api/scheduled-emails', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing userId parameter' 
    });
  }
  
  // In a real app, you would filter by user ID
  // Here we're just returning all scheduled emails for simplicity
  const filteredEmails = scheduledEmails.map(email => ({
    id: email.id,
    subject: email.subject,
    recipients: email.to.length,
    scheduledTime: email.scheduledTime,
    status: email.status,
    sentAt: email.sentAt || null,
    deliveredCount: email.deliveredCount || 0
  }));
  
  res.status(200).json({
    success: true,
    scheduledEmails: filteredEmails
  });
});

// Cancel scheduled email endpoint
app.delete('/api/scheduled-emails/:id', (req, res) => {
  const { id } = req.params;
  
  const emailIndex = scheduledEmails.findIndex(email => email.id === id);
  
  if (emailIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Scheduled email not found'
    });
  }
  
  if (scheduledEmails[emailIndex].status !== 'scheduled') {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel email with status: ${scheduledEmails[emailIndex].status}`
    });
  }
  
  // Remove the email from the scheduled list
  scheduledEmails.splice(emailIndex, 1);
  
  res.status(200).json({
    success: true,
    message: 'Scheduled email cancelled successfully'
  });
});

// AI Content Generation endpoint using Gemini API
app.post('/api/generate-content', async (req, res) => {
  try {
    const { prompt, tone = 'professional' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing prompt' 
      });
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini API key not configured' 
      });
    }

    // Craft the prompt with additional context based on tone
    const toneInstructions = {
      professional: 'Write in a professional, business-appropriate tone.',
      friendly: 'Write in a friendly, conversational tone.',
      persuasive: 'Write in a persuasive tone that encourages action.',
      urgent: 'Write in an urgent tone that conveys time sensitivity.',
      formal: 'Write in a formal, academic tone.'
    };

    const fullPrompt = `
      Write an email with the following requirements:
      ${prompt}
      
      Tone instructions: ${toneInstructions[tone] || toneInstructions.professional}
      
      Format the email properly with appropriate greeting and closing.
      Keep it concise and focused on the main message.
      Avoid any unnecessary fluff or filler content.
    `;

    // Call the Gemini API - updated model to gemini-2.0-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate content');
    }

    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated');
    }

    res.status(200).json({
      success: true,
      content: generatedText
    });
    
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate content'
    });
  }
});

// Sentiment Analysis endpoint using Gemini API
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const { content, subject = '' } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing email content' 
      });
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini API key not configured' 
      });
    }

    const analysisPrompt = `
      Analyze the following email content and provide feedback on its tone, formality, and effectiveness:
      
      Subject: ${subject}
      
      Content:
      ${content}
      
      Please provide a JSON response with the following structure, without any additional text:
      {
        "overall": "positive|negative|neutral",
        "score": <numerical score from -1 to 1>,
        "formality": "formal|casual|mixed",
        "tone": ["list", "of", "detected", "tones"],
        "suggestions": ["list", "of", "improvement", "suggestions"],
        "readability": "easy|medium|difficult"
      }
      
      Make sure the JSON is valid and contains only the requested structure.
    `;

    // Call the Gemini API - updated model to gemini-2.0-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze sentiment');
    }

    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No analysis generated');
    }

    // Extract the JSON from the response
    let jsonMatch;
    try {
      // Find JSON in the response
      jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from response');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      res.status(200).json({
        success: true,
        result
      });
    } catch (jsonError) {
      console.error('Error parsing analysis JSON:', jsonError, generatedText);
      throw new Error('Failed to parse sentiment analysis results');
    }
    
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze sentiment'
    });
  }
});

// AI Email Assistant endpoint
app.post('/api/email-assistant', async (req, res) => {
  try {
    const { subject, content, targetAudience, goal } = req.body;
    
    if (!subject || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini API key not configured' 
      });
    }

    const prompt = `
      As an AI email marketing expert, analyze and provide suggestions for the following email campaign:

      Subject Line: ${subject}
      Content: ${content}
      Target Audience: ${targetAudience || 'Not specified'}
      Campaign Goal: ${goal}

      Please provide suggestions in the following JSON format:
      {
        "suggestions": [
          {
            "type": "subject",
            "original": "original subject line",
            "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
            "reasoning": "explanation of improvements",
            "confidence": 85
          },
          {
            "type": "content",
            "original": "original content",
            "suggestions": ["improved content version"],
            "reasoning": "explanation of improvements",
            "confidence": 90
          },
          {
            "type": "timing",
            "original": "not specified",
            "suggestions": ["best time 1", "best time 2", "best time 3"],
            "reasoning": "explanation based on audience and goal",
            "confidence": 75
          }
        ]
      }

      Focus on:
      1. Making subject lines more engaging and click-worthy
      2. Improving content structure and persuasiveness
      3. Suggesting optimal sending times based on the audience and goal
      4. Adding personalization and emotional triggers
      5. Maintaining brand voice while optimizing for the campaign goal

      Return ONLY the JSON response without any additional text.
    `;

    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate suggestions');
    }

    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No suggestions generated');
    }

    // Extract the JSON from the response
    let jsonMatch;
    try {
      // Find JSON in the response
      jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from response');
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      
      res.status(200).json({
        success: true,
        ...suggestions
      });
    } catch (jsonError) {
      console.error('Error parsing suggestions JSON:', jsonError, generatedText);
      throw new Error('Failed to parse AI suggestions');
    }
    
  } catch (error) {
    console.error('Error generating email suggestions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate suggestions'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email scheduler initialized`);
});
