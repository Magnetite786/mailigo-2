-- Add is_html column to emails table
ALTER TABLE emails
ADD COLUMN is_html BOOLEAN DEFAULT FALSE;

-- Add content_preview column for plain text preview of HTML content
ALTER TABLE emails
ADD COLUMN content_preview TEXT;

-- Create function to automatically generate plain text preview
CREATE OR REPLACE FUNCTION generate_content_preview() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_html THEN
        -- Simple HTML to text conversion (strips tags)
        NEW.content_preview = regexp_replace(NEW.content, '<[^>]*>', '', 'g');
    ELSE
        NEW.content_preview = NEW.content;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate preview
CREATE TRIGGER emails_content_preview_trigger
    BEFORE INSERT OR UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION generate_content_preview(); 