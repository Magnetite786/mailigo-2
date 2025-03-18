# Bulk Mailer Express

A modern web application for sending bulk emails through Gmail. This application allows users to:

- Send emails to multiple recipients with one click
- Import emails from CSV or Excel files
- Store Gmail app passwords securely
- Track email sending history
- Customize batch sizes and delays to avoid Gmail rate limits

## Prerequisites

- Node.js and npm installed
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) enabled
- Firebase account for user authentication and data storage

## Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/bulk-mailer-express.git
   cd bulk-mailer-express
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up Firebase
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Copy your Firebase config from Project Settings > Your Apps > Firebase SDK snippet

4. Configure Firebase Firestore Security Rules
   - Go to Firestore Database > Rules
   - Copy and paste the following rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow users to read and write their own settings
       match /userSettings/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Allow users to read and write their own email history
       match /emailHistory/{docId} {
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
         allow read, delete, update: if request.auth != null && resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

5. Create the .env file
   ```
   cp .env.example .env
   ```
   
   Update the .env file with your Firebase configuration

6. Start the development server
   ```
   npm run dev
   ```

7. Start the email backend server
   ```
   node server.js
   ```

## Using the Application

1. Register or log in to the application
2. Navigate to the Dashboard
3. Enter your Gmail address and App Password
4. Add recipients manually or import from a CSV/Excel file
5. Enter the email subject and body
6. Adjust batch size and delay settings if needed
7. Click "Send Emails" to start sending

## Firebase Collections

The application uses two main Firestore collections:

1. `userSettings` - Stores user preferences and app passwords
   - Document ID: User's UID
   - Fields:
     - appPassword: string
     - batchSize: number
     - delayBetweenBatches: number

2. `emailHistory` - Stores history of sent emails
   - Document ID: Auto-generated
   - Fields:
     - userId: string
     - subject: string
     - recipients: number
     - status: 'success' | 'failed' | 'partial'
     - date: timestamp
     - body: string (optional)
     - fromEmail: string (optional)
     - deliveredCount: number (optional)
     - failedEmails: string[] (optional)
     - batchSize: number (optional)
     - delayBetweenBatches: number (optional)

## Troubleshooting Firebase Issues

If you encounter "Missing or insufficient permissions" errors:

1. Check that your Firestore security rules are set correctly
2. Verify that you're signed in to the application
3. Ensure your Firebase project is on the Blaze plan if you're making external API calls
4. Check that your project's billing is set up correctly

## Rate Limiting and Gmail Quotas

Gmail has limits on how many emails you can send:

- Free Gmail accounts: 500 emails per day
- Google Workspace accounts: 2,000 emails per day

To avoid rate limiting:

1. Use smaller batch sizes (10-20 emails per batch)
2. Add delays between batches (1-2 seconds)
3. Spread large campaigns across multiple days

## License

MIT
