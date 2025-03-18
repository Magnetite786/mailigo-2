-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    is_html BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create email_tracking table
CREATE TABLE IF NOT EXISTS email_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add tracking columns to emails table
ALTER TABLE emails
ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES email_templates(id);

-- Add tracking columns to email_recipients
ALTER TABLE email_recipients
ADD COLUMN IF NOT EXISTS opened BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clicked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_email_id ON email_tracking(email_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_recipient ON email_tracking(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);

-- Enable RLS for new tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_templates
CREATE POLICY "Users can view their own templates"
    ON email_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
    ON email_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON email_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON email_templates FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for email_tracking
CREATE POLICY "Users can view tracking for their own emails"
    ON email_tracking FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM emails
        WHERE emails.id = email_tracking.email_id
        AND emails.user_id = auth.uid()
    ));

-- Create function to update email tracking counts
CREATE OR REPLACE FUNCTION update_email_tracking_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update email_recipients
    UPDATE email_recipients
    SET 
        opened = TRUE,
        last_opened_at = NEW.opened_at
    WHERE 
        email_id = NEW.email_id 
        AND recipient_email = NEW.recipient_email
        AND (opened = FALSE OR last_opened_at IS NULL);

    -- Update emails table counts
    WITH tracking_counts AS (
        SELECT 
            email_id,
            COUNT(DISTINCT CASE WHEN opened_at IS NOT NULL THEN recipient_email END) as opens,
            COUNT(DISTINCT CASE WHEN clicked_at IS NOT NULL THEN recipient_email END) as clicks
        FROM email_tracking
        WHERE email_id = NEW.email_id
        GROUP BY email_id
    )
    UPDATE emails
    SET 
        open_count = tc.opens,
        click_count = tc.clicks
    FROM tracking_counts tc
    WHERE emails.id = tc.email_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tracking updates
CREATE TRIGGER email_tracking_counts_trigger
    AFTER INSERT OR UPDATE ON email_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_email_tracking_counts();

-- Create view for email analytics
CREATE OR REPLACE VIEW email_analytics AS
SELECT 
    e.id,
    e.user_id,
    e.subject,
    e.created_at,
    e.total_recipients,
    e.delivered_count,
    e.open_count,
    e.click_count,
    ROUND((e.open_count::float / NULLIF(e.delivered_count, 0) * 100)::numeric, 2) as open_rate,
    ROUND((e.click_count::float / NULLIF(e.open_count, 0) * 100)::numeric, 2) as click_through_rate,
    COUNT(DISTINCT et.recipient_email) as unique_opens,
    COUNT(DISTINCT CASE WHEN et.clicked_at IS NOT NULL THEN et.recipient_email END) as unique_clicks
FROM emails e
LEFT JOIN email_tracking et ON e.id = et.email_id
GROUP BY e.id; 