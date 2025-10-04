-- Create categories/departments table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    company_id UUID REFERENCES companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
('Hardware', 'Computer hardware, peripherals, and equipment issues', '#EF4444'),
('Software', 'Software installation, updates, and application issues', '#10B981'),
('Network', 'Internet connectivity, WiFi, and network-related problems', '#F59E0B'),
('Security', 'Security concerns, password resets, and access issues', '#8B5CF6'),
('General', 'General IT support and miscellaneous requests', '#6B7280')
ON CONFLICT DO NOTHING;
