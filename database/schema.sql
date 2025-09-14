-- HypeFlow AI Pro Database Schema
-- Ultimate Sports Card Investment Platform

-- Create database
CREATE DATABASE hypeflow_ai;
\c hypeflow_ai;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_image_url TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'
);

-- User portfolios
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    total_cards INTEGER DEFAULT 0,
    average_grade DECIMAL(3,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT false
);

-- Sports cards
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    year INTEGER,
    brand VARCHAR(100),
    set_name VARCHAR(100),
    card_number VARCHAR(50),
    player VARCHAR(100),
    team VARCHAR(100),
    position VARCHAR(50),
    rookie_year INTEGER,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User card collections
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    grade DECIMAL(3,1),
    condition_notes TEXT,
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    current_value DECIMAL(10,2),
    is_favorite BOOLEAN DEFAULT false,
    is_for_sale BOOLEAN DEFAULT false,
    sale_price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_id)
);

-- eBay listings
CREATE TABLE ebay_listings (
    listing_id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    condition VARCHAR(100),
    seller VARCHAR(100),
    seller_rating DECIMAL(5,2),
    seller_feedback_count INTEGER,
    location VARCHAR(100),
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    time_remaining VARCHAR(50),
    bids INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    image_url TEXT,
    listing_url TEXT NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    year INTEGER,
    player VARCHAR(100),
    set_name VARCHAR(100),
    card_number VARCHAR(50),
    grade VARCHAR(50),
    is_auction BOOLEAN DEFAULT false,
    is_buy_it_now BOOLEAN DEFAULT false,
    is_underpriced BOOLEAN DEFAULT false,
    profit_potential DECIMAL(5,2) DEFAULT 0.00,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    market_value DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI grading results
CREATE TABLE ai_grading_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    image_url TEXT,
    overall_grade DECIMAL(3,1) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    centering_score DECIMAL(3,1) NOT NULL,
    corners_score DECIMAL(3,1) NOT NULL,
    edges_score DECIMAL(3,1) NOT NULL,
    surface_score DECIMAL(3,1) NOT NULL,
    defects JSONB DEFAULT '[]',
    recommendations TEXT,
    estimated_value DECIMAL(10,2),
    market_trend VARCHAR(100),
    processing_time DECIMAL(5,2),
    ai_model_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market analysis data
CREATE TABLE market_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_date DATE NOT NULL,
    total_listings INTEGER NOT NULL,
    average_price DECIMAL(10,2) NOT NULL,
    median_price DECIMAL(10,2) NOT NULL,
    price_trend VARCHAR(100),
    volume_trend VARCHAR(100),
    top_gainers JSONB DEFAULT '[]',
    top_decliners JSONB DEFAULT '[]',
    market_opportunities JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User favorites
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id VARCHAR(255) REFERENCES ebay_listings(listing_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Price history
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    listing_id VARCHAR(255) REFERENCES ebay_listings(listing_id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    date_recorded DATE NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI model performance tracking
CREATE TABLE ai_model_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    accuracy DECIMAL(5,4) NOT NULL,
    precision_score DECIMAL(5,4) NOT NULL,
    recall_score DECIMAL(5,4) NOT NULL,
    f1_score DECIMAL(5,4) NOT NULL,
    test_samples INTEGER NOT NULL,
    training_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraping logs
CREATE TABLE scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_term VARCHAR(255) NOT NULL,
    page_number INTEGER NOT NULL,
    listings_found INTEGER NOT NULL,
    successful_scrapes INTEGER NOT NULL,
    failed_scrapes INTEGER NOT NULL,
    processing_time DECIMAL(5,2) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_subscription ON users(subscription_tier);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_public ON portfolios(is_public);

CREATE INDEX idx_cards_sport ON cards(sport);
CREATE INDEX idx_cards_year ON cards(year);
CREATE INDEX idx_cards_player ON cards(player);
CREATE INDEX idx_cards_brand ON cards(brand);
CREATE INDEX idx_cards_set_name ON cards(set_name);

CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX idx_user_cards_portfolio_id ON user_cards(portfolio_id);
CREATE INDEX idx_user_cards_favorite ON user_cards(is_favorite);

CREATE INDEX idx_ebay_listings_price ON ebay_listings(price);
CREATE INDEX idx_ebay_listings_underpriced ON ebay_listings(is_underpriced);
CREATE INDEX idx_ebay_listings_profit_potential ON ebay_listings(profit_potential);
CREATE INDEX idx_ebay_listings_created_at ON ebay_listings(created_at);
CREATE INDEX idx_ebay_listings_player ON ebay_listings(player);
CREATE INDEX idx_ebay_listings_year ON ebay_listings(year);
CREATE INDEX idx_ebay_listings_sport ON ebay_listings(category);

CREATE INDEX idx_ai_grading_user_id ON ai_grading_results(user_id);
CREATE INDEX idx_ai_grading_card_id ON ai_grading_results(card_id);
CREATE INDEX idx_ai_grading_grade ON ai_grading_results(overall_grade);
CREATE INDEX idx_ai_grading_created_at ON ai_grading_results(created_at);

CREATE INDEX idx_market_analysis_date ON market_analysis(analysis_date);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

CREATE INDEX idx_price_history_card_id ON price_history(card_id);
CREATE INDEX idx_price_history_date ON price_history(date_recorded);

CREATE INDEX idx_scraping_logs_created_at ON scraping_logs(created_at);

-- Create full-text search indexes
CREATE INDEX idx_cards_search ON cards USING gin(to_tsvector('english', name || ' ' || player || ' ' || set_name));
CREATE INDEX idx_ebay_listings_search ON ebay_listings USING gin(to_tsvector('english', title));

-- Create composite indexes for common queries
CREATE INDEX idx_ebay_underpriced_profit ON ebay_listings(is_underpriced, profit_potential) WHERE is_underpriced = true;
CREATE INDEX idx_user_cards_portfolio_favorite ON user_cards(portfolio_id, is_favorite) WHERE is_favorite = true;

-- Create views for common queries
CREATE VIEW underpriced_opportunities AS
SELECT 
    el.*,
    c.name as card_name,
    c.sport,
    c.year as card_year,
    c.player
FROM ebay_listings el
LEFT JOIN cards c ON el.player = c.player AND el.year = c.year
WHERE el.is_underpriced = true 
AND el.profit_potential > 20
ORDER BY el.profit_potential DESC;

CREATE VIEW user_portfolio_summary AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(uc.id) as total_cards,
    COALESCE(SUM(uc.current_value), 0) as total_value,
    COALESCE(AVG(uc.grade), 0) as average_grade,
    COUNT(CASE WHEN uc.is_favorite THEN 1 END) as favorites_count
FROM users u
LEFT JOIN user_cards uc ON u.id = uc.user_id
GROUP BY u.id, u.username;

CREATE VIEW market_trends AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_listings,
    AVG(price) as average_price,
    COUNT(CASE WHEN is_underpriced THEN 1 END) as underpriced_count,
    AVG(CASE WHEN is_underpriced THEN profit_potential END) as avg_profit_potential
FROM ebay_listings
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_cards_updated_at BEFORE UPDATE ON user_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ebay_listings_updated_at BEFORE UPDATE ON ebay_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate portfolio value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(portfolio_uuid UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    total_value DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(current_value), 0)
    INTO total_value
    FROM user_cards
    WHERE portfolio_id = portfolio_uuid;
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql;

-- Create function to get market opportunities
CREATE OR REPLACE FUNCTION get_market_opportunities(
    min_profit_potential DECIMAL DEFAULT 20.0,
    max_price DECIMAL DEFAULT 10000.0,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    listing_id VARCHAR(255),
    title TEXT,
    price DECIMAL(10,2),
    profit_potential DECIMAL(5,2),
    market_value DECIMAL(10,2),
    confidence_score DECIMAL(3,2),
    player VARCHAR(100),
    year INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        el.listing_id,
        el.title,
        el.price,
        el.profit_potential,
        el.market_value,
        el.confidence_score,
        el.player,
        el.year
    FROM ebay_listings el
    WHERE el.is_underpriced = true
    AND el.profit_potential >= min_profit_potential
    AND el.price <= max_price
    ORDER BY el.profit_potential DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name, subscription_tier) VALUES
('demo_user', 'demo@hypeflow.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Kz8K2O', 'Demo', 'User', 'premium'),
('card_collector', 'collector@hypeflow.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Kz8K2O', 'Card', 'Collector', 'pro');

INSERT INTO portfolios (user_id, name, description, total_value, total_cards, average_grade) VALUES
((SELECT id FROM users WHERE username = 'demo_user'), 'My Collection', 'Personal sports card collection', 125000.00, 45, 8.7),
((SELECT id FROM users WHERE username = 'card_collector'), 'Investment Portfolio', 'High-value investment cards', 500000.00, 120, 9.2);

INSERT INTO cards (name, sport, year, brand, set_name, card_number, player, team, position, rookie_year) VALUES
('Michael Jordan 1986 Fleer Rookie #57', 'Basketball', 1986, 'Fleer', 'Fleer', '57', 'Michael Jordan', 'Chicago Bulls', 'Guard', 1984),
('Patrick Mahomes 2017 Prizm Rookie #252', 'Football', 2017, 'Panini', 'Prizm', '252', 'Patrick Mahomes', 'Kansas City Chiefs', 'Quarterback', 2017),
('LeBron James 2003 Topps Chrome Rookie #111', 'Basketball', 2003, 'Topps', 'Topps Chrome', '111', 'LeBron James', 'Cleveland Cavaliers', 'Forward', 2003),
('Luka Dončić 2018 Prizm Rookie #280', 'Basketball', 2018, 'Panini', 'Prizm', '280', 'Luka Dončić', 'Dallas Mavericks', 'Guard', 2018);

-- Create sample eBay listings
INSERT INTO ebay_listings (listing_id, title, price, condition, seller, seller_rating, image_url, listing_url, category, brand, year, player, set_name, is_auction, is_buy_it_now, is_underpriced, profit_potential, confidence_score, market_value) VALUES
('ebay_001', 'Michael Jordan 1986 Fleer #57 PSA 8 - Centered!', 28500.00, 'PSA 8', 'CardCollector123', 99.8, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop', 'https://ebay.com/itm/394857291847', 'Sports Cards', 'Fleer', 1986, 'Michael Jordan', 'Fleer', false, true, true, 28.0, 0.95, 36500.00),
('ebay_002', 'Patrick Mahomes 2017 Prizm #252 Raw - Mint Condition', 850.00, 'Raw/Mint', 'SportsCardsPro', 100.0, 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop', 'https://ebay.com/itm/394857291848', 'Sports Cards', 'Panini', 2017, 'Patrick Mahomes', 'Prizm', false, true, true, 65.0, 0.88, 1400.00);

-- Create sample market analysis
INSERT INTO market_analysis (analysis_date, total_listings, average_price, median_price, price_trend, volume_trend) VALUES
(CURRENT_DATE, 5000000, 1250.50, 450.00, '+15.3% this month', '+8.7% this week');

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE hypeflow_ai TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create backup script
CREATE OR REPLACE FUNCTION backup_database()
RETURNS TEXT AS $$
BEGIN
    -- This would typically call pg_dump
    RETURN 'Database backup initiated';
END;
$$ LANGUAGE plpgsql;

COMMENT ON DATABASE hypeflow_ai IS 'HypeFlow AI Pro - Ultimate Sports Card Investment Platform Database';
COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON TABLE portfolios IS 'User card portfolios';
COMMENT ON TABLE cards IS 'Sports card catalog';
COMMENT ON TABLE ebay_listings IS 'eBay listings with AI analysis';
COMMENT ON TABLE ai_grading_results IS 'AI grading analysis results';
COMMENT ON TABLE market_analysis IS 'Market trend analysis data';
