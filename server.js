const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Enable CORS for all routes
app.use(cors());

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('.', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-hypeflow-ai-pro.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API routes for eBay integration
app.get('/api/ebay/search', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Mock eBay search results for now
    const mockResults = generateMockEbayResults(query, parseInt(limit));
    
    res.json({
      success: true,
      query,
      results: mockResults,
      total: mockResults.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('eBay search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI grading endpoint
app.post('/api/ai/grade', async (req, res) => {
  try {
    const { cardData, imageData } = req.body;
    
    if (!cardData) {
      return res.status(400).json({ error: 'Card data is required' });
    }

    // Mock AI grading for now
    const gradeResult = generateMockGrade(cardData);
    
    res.json({
      success: true,
      grade: gradeResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI grading error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Helper functions
function generateMockEbayResults(query, limit) {
  const mockResults = [];
  const players = ['LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Tom Brady', 'Patrick Mahomes'];
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const grades = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 9', 'Raw'];
  
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const player = players[Math.floor(Math.random() * players.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    
    mockResults.push({
      id: `ebay_${Date.now()}_${i}`,
      title: `${year} ${player} Card ${grade}`,
      price: (Math.random() * 1000 + 50).toFixed(2),
      url: `https://www.ebay.com/itm/${Date.now()}_${i}`,
      image: `https://via.placeholder.com/300x400?text=${player}+${year}`,
      condition: grade,
      seller: `seller_${i + 1}`,
      shipping: 'Free',
      timeLeft: `${Math.floor(Math.random() * 7)}d ${Math.floor(Math.random() * 24)}h`,
      watchers: Math.floor(Math.random() * 50),
      bids: Math.floor(Math.random() * 10)
    });
  }
  
  return mockResults;
}

function generateMockGrade(cardData) {
  const grades = ['PSA 10', 'PSA 9', 'PSA 8', 'BGS 9.5', 'BGS 9', 'BGS 8.5'];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  const confidence = (Math.random() * 0.3 + 0.7).toFixed(2);
  
  return {
    grade,
    confidence: parseFloat(confidence),
    details: {
      centering: (Math.random() * 0.3 + 0.7).toFixed(2),
      corners: (Math.random() * 0.3 + 0.7).toFixed(2),
      edges: (Math.random() * 0.3 + 0.7).toFixed(2),
      surface: (Math.random() * 0.3 + 0.7).toFixed(2)
    },
    recommendation: confidence > 0.8 ? 'Submit for grading' : 'Consider resubmission'
  };
}

// Start server
app.listen(port, () => {
  console.log(`🚀 HypeFlow AI Pro running on port ${port}`);
  console.log(`🌐 Local: http://localhost:${port}`);
  console.log(`📱 App: http://localhost:${port}/app`);
  console.log(`❤️  Health: http://localhost:${port}/api/health`);
});

module.exports = app;
