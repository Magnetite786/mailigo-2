-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for storing user information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create emails table for storing email campaigns
CREATE TABLE IF NOT EXISTS emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    from_email TEXT NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create email_recipients table for storing recipient details
CREATE TABLE IF NOT EXISTS email_recipients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create email_config table for storing user's email configuration
CREATE TABLE IF NOT EXISTS email_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    app_password TEXT NOT NULL,
    batch_size INTEGER DEFAULT 10,
    delay_between_batches INTEGER DEFAULT 1,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create email_logs table for detailed logging
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for emails table
CREATE POLICY "Users can view their own emails"
    ON emails FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
    ON emails FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails"
    ON emails FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
    ON emails FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for email_recipients table
CREATE POLICY "Users can view their own email recipients"
    ON email_recipients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM emails
        WHERE emails.id = email_recipients.email_id
        AND emails.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own email recipients"
    ON email_recipients FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM emails
        WHERE emails.id = email_recipients.email_id
        AND emails.user_id = auth.uid()
    ));

-- Create policies for email_config table
CREATE POLICY "Users can view their own email config"
    ON email_config FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email config"
    ON email_config FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email config"
    ON email_config FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email config"
    ON email_config FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for email_logs table
CREATE POLICY "Users can view their own email logs"
    ON email_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM emails
        WHERE emails.id = email_logs.email_id
        AND emails.user_id = auth.uid()
    ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_config_updated_at
    BEFORE UPDATE ON email_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_created_at ON emails(created_at);
CREATE INDEX idx_email_recipients_email_id ON email_recipients(email_id);
CREATE INDEX idx_email_recipients_status ON email_recipients(status);
CREATE INDEX idx_email_config_user_id ON email_config(user_id);
CREATE INDEX idx_email_logs_email_id ON email_logs(email_id);

-- Create view for email statistics
CREATE OR REPLACE VIEW email_statistics AS
SELECT 
    e.id,
    e.user_id,
    e.subject,
    e.from_email,
    e.total_recipients,
    e.delivered_count,
    e.status,
    e.created_at,
    COUNT(DISTINCT er.id) as total_recipients_count,
    SUM(CASE WHEN er.status = 'delivered' THEN 1 ELSE 0 END) as delivered_count_actual,
    SUM(CASE WHEN er.status = 'failed' THEN 1 ELSE 0 END) as failed_count
FROM emails e
LEFT JOIN email_recipients er ON e.id = er.email_id
GROUP BY e.id; 