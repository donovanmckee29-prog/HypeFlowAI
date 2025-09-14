import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  TrendingUp, 
  Star, 
  MessageCircle, 
  Home, 
  BarChart3, 
  Zap, 
  Target, 
  Brain, 
  AlertCircle,
  ExternalLink,
  Heart,
  X,
  Send,
  Bot,
  User
} from 'lucide-react';

// Interfaces
interface Card {
  id: string;
  name: string;
  sport: string;
  year: number;
  grade: number;
  price: number;
  image: string;
  isUnderpriced?: boolean;
  profitPotential?: number;
  ebayLink?: string;
}

interface EbayListing {
  id: string;
  title: string;
  price: number;
  condition: string;
  seller: string;
  link: string;
  image: string;
  isUnderpriced: boolean;
  profitPotential: number;
}

interface PriceComparison {
  card: Card;
  ebayPrice: number;
  marketPrice: number;
  profitPotential: number;
  isUnderpriced: boolean;
}

interface GradingAnalysis {
  card: Card;
  grade: number;
  confidence: number;
  factors: string[];
  recommendation: string;
}

interface MarketOpportunity {
  id: string;
  card: Card;
  currentPrice: number;
  marketPrice: number;
  profitPotential: number;
  confidence: number;
  reason: string;
  ebayLink: string;
}

interface MarketData {
  totalCards: number;
  averagePrice: number;
  topPerformer: string;
  marketTrend: 'up' | 'down' | 'stable';
}

// Sample data
const sampleCards: Card[] = [
  {
    id: '1',
    name: 'Michael Jordan Rookie',
    sport: 'Basketball',
    year: 1986,
    grade: 9,
    price: 15000,
    image: '',
    isUnderpriced: true,
    profitPotential: 25,
    ebayLink: 'https://ebay.com/itm/michael-jordan-rookie'
  },
  {
    id: '2',
    name: 'Patrick Mahomes RC',
    sport: 'Football',
    year: 2017,
    grade: 10,
    price: 2500,
    image: '',
    isUnderpriced: true,
    profitPotential: 40,
    ebayLink: 'https://ebay.com/itm/patrick-mahomes-rookie'
  },
  {
    id: '3',
    name: 'LeBron James RC',
    sport: 'Basketball',
    year: 2003,
    grade: 8,
    price: 5000,
    image: '',
    isUnderpriced: false,
    profitPotential: 5,
    ebayLink: 'https://ebay.com/itm/lebron-james-rookie'
  }
];

const sampleOpportunities: MarketOpportunity[] = [
  {
    id: '1',
    card: sampleCards[0],
    currentPrice: 12000,
    marketPrice: 15000,
    profitPotential: 25,
    confidence: 95,
    reason: 'Recent auction results show higher prices',
    ebayLink: 'https://ebay.com/itm/michael-jordan-rookie'
  },
  {
    id: '2',
    card: sampleCards[1],
    currentPrice: 1800,
    marketPrice: 2500,
    profitPotential: 40,
    confidence: 88,
    reason: 'Super Bowl performance driving demand',
    ebayLink: 'https://ebay.com/itm/patrick-mahomes-rookie'
  }
];

const sampleMarketData: MarketData = {
  totalCards: 2500000,
  averagePrice: 1250,
  topPerformer: 'Michael Jordan Rookie',
  marketTrend: 'up'
};

function HypeFlowAI() {
  // State management
  const [activeTab, setActiveTab] = useState('home');
  const [cards, setCards] = useState<Card[]>(sampleCards);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>(sampleOpportunities);
  const [marketData, setMarketData] = useState<MarketData>(sampleMarketData);
  const [favoriteCards, setFavoriteCards] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<EbayListing[]>([]);
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Card Oracle AI Logic
  const generateResponse = useCallback((userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Michael Jordan queries
    if (input.includes('michael jordan') || input.includes('jordan')) {
      if (input.includes('rookie') || input.includes('1986')) {
        return "Michael Jordan's 1986 Fleer rookie card is the holy grail of basketball cards. PSA 10s regularly sell for $500K+, while PSA 9s go for $50K+. The card's value has been steadily increasing due to Jordan's cultural impact and the growing sports card market. Consider it a blue-chip investment if you can afford the premium.";
      }
      if (input.includes('investment') || input.includes('buy')) {
        return "Jordan cards are generally solid long-term investments, especially high-grade rookies and key inserts. However, be cautious of overpaying during market peaks. Look for cards with strong eye appeal and consider the player's legacy beyond just stats.";
      }
    }
    
    // Patrick Mahomes queries
    if (input.includes('mahomes') || input.includes('patrick')) {
      if (input.includes('rookie') || input.includes('2017')) {
        return "Patrick Mahomes' 2017 rookie cards have been on fire! His 2017 Prizm base PSA 10 has gone from $200 to $2000+ in recent years. With multiple Super Bowl wins and his prime years ahead, there's still room for growth. Focus on Prizm, Select, and Optic rookies.";
      }
      if (input.includes('investment') || input.includes('buy')) {
        return "Mahomes is in his prime and has a long career ahead. His cards offer both short-term volatility and long-term upside. Consider his Prizm rookies, especially PSA 10s, as they tend to hold value well. Watch for market corrections to buy in.";
      }
    }
    
    // Grading queries
    if (input.includes('grade') || input.includes('grading') || input.includes('psa') || input.includes('bgs')) {
      return "Grading is crucial for card values. PSA is the gold standard for most sports cards, while BGS is preferred for modern cards and autographs. A PSA 10 can be worth 10x more than a PSA 9. Always consider the card's eye appeal - centering, corners, edges, and surface. Raw cards can be risky but offer higher upside if they grade well.";
    }
    
    // Investment advice
    if (input.includes('investment') || input.includes('invest') || input.includes('portfolio')) {
      return "Diversify your card portfolio across different sports, eras, and price points. Focus on: 1) Hall of Fame players with proven track records, 2) Young stars with potential, 3) Rookie cards (first year is usually best), 4) High-grade examples when possible. Avoid overpaying for hype and always do your research on recent sales.";
    }
    
    // Market timing
    if (input.includes('market') || input.includes('timing') || input.includes('when to buy') || input.includes('when to sell')) {
      return "The card market is cyclical. Buy during off-seasons (summer for football, winter for baseball) when interest is lower. Sell during peak seasons or after major events (Super Bowl, playoffs, etc.). However, don't try to time the market perfectly - focus on long-term value and buy cards you believe in.";
    }
    
    // Joe Burrow queries
    if (input.includes('burrow') || input.includes('joe burrow')) {
      return "Joe Burrow's 2020 rookie cards have been volatile but show promise. His Prizm base PSA 10 peaked around $2000 but has settled around $800-1000. With his talent and marketability, there's potential for growth, but be prepared for volatility. Consider his Prizm, Select, and Optic rookies.";
    }
    
    // Default response
    return "I'd be happy to help with your trading card questions! I can provide insights on specific players, grading, market trends, investment strategies, and more. What would you like to know about?";
  }, []);

  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const aiResponse = generateResponse(currentMessage);
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  }, [currentMessage, generateResponse]);

  const askExample = useCallback((question: string) => {
    setCurrentMessage(question);
  }, []);

  // Utility functions
  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'basketball': return '🏀';
      case 'football': return '🏈';
      case 'baseball': return '⚾';
      case 'hockey': return '🏒';
      default: return '🎯';
    }
  };

  const toggleFavorite = (cardId: string) => {
    setFavoriteCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Simulate eBay scanning
  const simulateEbayScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }
    
    // Simulate results
    const mockResults: EbayListing[] = [
      {
        id: '1',
        title: 'Michael Jordan 1986 Fleer Rookie Card PSA 9',
        price: 12000,
        condition: 'PSA 9',
        seller: 'CardCollector123',
        link: 'https://ebay.com/itm/michael-jordan-rookie',
        image: '',
        isUnderpriced: true,
        profitPotential: 25
      },
      {
        id: '2',
        title: 'Patrick Mahomes 2017 Prizm Rookie PSA 10',
        price: 1800,
        condition: 'PSA 10',
        seller: 'SportsCardsPro',
        link: 'https://ebay.com/itm/patrick-mahomes-rookie',
        image: '',
        isUnderpriced: true,
        profitPotential: 40
      }
    ];
    
    setScanResults(mockResults);
    setIsScanning(false);
  }, []);

  // Home Page
  const renderHome = () => (
    <div className="min-h-screen relative bg-black">
      {/* Animated Particles Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-green-400 rounded-sm animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 2}s`,
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
              transform: `translateY(${Math.random() * 20 - 10}px) rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative z-10" style={{
        background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
      }}>
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span 
              className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 to-purple-600 bg-clip-text text-transparent"
              style={{
                backgroundSize: '300% 300%',
                animation: 'gradient-shift 4s ease-in-out infinite'
              }}
            >
              Find Hidden Card Deals
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover underpriced trading cards, manage your portfolio like a pro, and get expert AI-powered investment advice
          </p>
          <button 
            onClick={() => setActiveTab('scanner')}
            className="inline-flex items-center gap-4 px-10 py-5 text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
            style={{
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            <span className="text-2xl">🚀</span>
            <span>Start Scanning Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "AI-Powered Scanning",
                description: "Advanced algorithms scan thousands of listings to find underpriced cards with high profit potential. Get real-time alerts on the best deals."
              },
              {
                icon: "📊",
                title: "Portfolio Analytics",
                description: "Track your collection's value, monitor performance metrics, and get detailed insights on your trading card investments."
              },
              {
                icon: "🤖",
                title: "Expert AI Oracle",
                description: "Chat with our AI expert for personalized investment advice, market insights, and strategic guidance on your card portfolio."
              },
              {
                icon: "📈",
                title: "Market Intelligence",
                description: "Access comprehensive market data, price trends, and predictive analytics to make informed buying and selling decisions."
              },
              {
                icon: "⚡",
                title: "Real-Time Alerts",
                description: "Never miss a great deal with instant notifications for cards matching your criteria and investment preferences."
              },
              {
                icon: "🎯",
                title: "Smart Targeting",
                description: "Set custom filters for card types, profit margins, and price ranges to focus on opportunities that match your strategy."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-400/20 relative overflow-hidden group"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-24 relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))'
        }}
      >
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { number: "$2.5M+", label: "Cards Analyzed" },
              { number: "15K+", label: "Active Users" },
              { number: "89%", label: "Success Rate" },
              { number: "$450K", label: "Profit Generated" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <p className="text-gray-300 text-lg">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-4xl mx-auto px-8">
          <div 
            className="rounded-3xl p-16 text-center relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 to-purple-600"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Ready to Start Trading Like a Pro?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of successful card investors who are already using CardArbitrage Pro to maximize their profits and build winning portfolios.
            </p>
            <button 
              onClick={() => setActiveTab('scanner')}
              className="inline-flex items-center gap-4 px-10 py-5 text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
              style={{
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}
            >
              <span className="text-2xl">💎</span>
              <span>Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black/80 border-t border-cyan-400/20 relative z-10">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-gray-400">
            © 2024 CardArbitrage Pro. All rights reserved. | Built with AI for card collectors.
          </p>
        </div>
      </footer>
    </div>
  );

  // Market Trends Page
  const renderMarketTrends = () => (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          Market Trends
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Total Cards Analyzed</h3>
            <p className="text-3xl font-bold text-green-400">{marketData.totalCards.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Average Price</h3>
            <p className="text-3xl font-bold text-green-400">${marketData.averagePrice.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Market Trend</h3>
            <p className={`text-3xl font-bold ${marketData.marketTrend === 'up' ? 'text-green-400' : marketData.marketTrend === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
              {marketData.marketTrend === 'up' ? '↗️' : marketData.marketTrend === 'down' ? '↘️' : '➡️'}
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">Top Opportunities</h2>
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-cyan-400/10">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getSportIcon(opportunity.card.sport)}</span>
                  <div>
                    <h3 className="font-semibold">{opportunity.card.name}</h3>
                    <p className="text-sm text-gray-400">{opportunity.card.year} • {opportunity.card.sport}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">+{opportunity.profitPotential}%</p>
                  <p className="text-sm text-gray-400">${opportunity.currentPrice.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // AI Card Grader Page
  const renderAIGrader = () => (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          AI Card Grader
        </h1>
        
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Upload Card Image</h2>
          <div className="border-2 border-dashed border-cyan-400/30 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-400 mb-4">Drag and drop your card image here</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
              Choose File
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Grading Factors</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Centering (25%)</li>
              <li>• Corners (25%)</li>
              <li>• Edges (25%)</li>
              <li>• Surface (25%)</li>
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">AI Analysis</h3>
            <p className="text-gray-300">Upload a card image to get instant AI-powered grading analysis with confidence scores and detailed feedback.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // eBay Scanner Page
  const renderEbayScanner = () => (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          eBay Scanner
        </h1>
        
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-cyan-400">Scan eBay Listings</h2>
            <button
              onClick={simulateEbayScan}
              disabled={isScanning}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
          
          {isScanning && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Scanning eBay listings...</span>
                <span className="text-sm text-cyan-400">{scanProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {scanResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-cyan-400 mb-6">Scan Results</h3>
            {scanResults.map((listing) => (
              <div key={listing.id} className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{listing.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Seller: {listing.seller}</span>
                      <span>Condition: {listing.condition}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">${listing.price.toLocaleString()}</p>
                    {listing.isUnderpriced && (
                      <p className="text-sm text-green-400">+{listing.profitPotential}% profit potential</p>
                    )}
                    <a
                      href={listing.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                      View on eBay
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Portfolio Page
  const renderPortfolio = () => (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          My Portfolio
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Total Value</h3>
            <p className="text-3xl font-bold text-green-400">
              ${cards.reduce((sum, card) => sum + card.price, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Cards Owned</h3>
            <p className="text-3xl font-bold text-green-400">{cards.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Favorites</h3>
            <p className="text-3xl font-bold text-green-400">{favoriteCards.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{getSportIcon(card.sport)}</span>
                <button
                  onClick={() => toggleFavorite(card.id)}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    favoriteCards.includes(card.id)
                      ? 'text-red-400 bg-red-400/20'
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-400/20'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favoriteCards.includes(card.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.name}</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>{card.year} • {card.sport}</p>
                <p>Grade: {card.grade}/10</p>
                <p className="text-green-400 font-semibold">${card.price.toLocaleString()}</p>
                {card.isUnderpriced && (
                  <p className="text-green-400 text-xs">+{card.profitPotential}% profit potential</p>
                )}
              </div>
              {card.ebayLink && (
                <a
                  href={card.ebayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  View on eBay
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Card Oracle Page
  const renderCardOracle = () => (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 h-[80vh] flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Card Oracle</h1>
              <p className="text-gray-400">Your AI trading card expert</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">Welcome to Card Oracle!</h3>
                <p className="text-gray-400 mb-6">I'm here to help with all your trading card questions. Try asking about:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Michael Jordan rookie card values",
                    "Patrick Mahomes investment potential",
                    "PSA vs BGS grading differences",
                    "Best time to buy cards",
                    "Portfolio diversification tips",
                    "Joe Burrow rookie card outlook"
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => askExample(question)}
                      className="p-4 bg-white/5 border border-cyan-400/20 rounded-lg hover:bg-white/10 transition-colors duration-300 text-left"
                    >
                      <p className="text-sm text-gray-300">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white/10 text-gray-100'
                }`}>
                  <div className="flex items-start gap-3">
                    {!message.isUser && <Bot className="w-5 h-5 mt-1 text-cyan-400" />}
                    {message.isUser && <User className="w-5 h-5 mt-1" />}
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about trading cards..."
              className="flex-1 px-4 py-3 bg-white/10 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                CardArbitrage Pro
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {[
                  { id: 'home', label: 'Home', icon: Home },
                  { id: 'trends', label: 'Market Trends', icon: TrendingUp },
                  { id: 'grader', label: 'AI Grader', icon: BarChart3 },
                  { id: 'scanner', label: 'eBay Scanner', icon: Search },
                  { id: 'portfolio', label: 'Portfolio', icon: Star },
                  { id: 'oracle', label: 'Card Oracle', icon: MessageCircle }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                        : 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'trends' && renderMarketTrends()}
        {activeTab === 'grader' && renderAIGrader()}
        {activeTab === 'scanner' && renderEbayScanner()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'oracle' && renderCardOracle()}
      </main>
    </div>
  );
}

export default HypeFlowAI;
