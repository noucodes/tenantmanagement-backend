-- Create knowledge base articles table
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category_id UUID REFERENCES categories(id),
    author_id UUID NOT NULL REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON knowledge_base_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_author_id ON knowledge_base_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_company_id ON knowledge_base_articles(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON knowledge_base_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_tags ON knowledge_base_articles USING GIN(tags);
