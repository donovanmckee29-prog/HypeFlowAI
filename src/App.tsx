import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Heart, ExternalLink
} from 'lucide-react';

// Types
interface Card {
  id: string;
  name: string;
  set_name: string;
  year: number;
  player_name: string;
  sport: string;
  current_price: number;
  price_change_24h: number;
  price_change_7d: number;
  condition: string;
  grade_company: string;
  popularity_score: number;
  image_url: string;
  view_count: number;
  likes: number;
  comments: number;
  rarity_score?: number;
  investment_grade?: 'S' | 'A' | 'B' | 'C' | 'D';
  ai_confidence?: number;
  market_velocity?: number;
  ebay_listings?: EbayListing[];
  price_comparison?: PriceComparison;
}

interface EbayListing {
  id: string;
  title: string;
  price: number;
  shipping: number;
  condition: string;
  seller_rating: number;
  listing_url: string;
  time_left: string;
  watchers: number;
  bids: number;
  is_auction: boolean;
  image_url: string;
}

interface PriceComparison {
  ebay_avg: number;
  market_130point: number;
  market_pwcc: number;
  psacard_avg: number;
  undervalued_percentage: number;
  confidence_score: number;
  last_updated: string;
}

interface MarketData {
  month: string;
  value: number;
}

const HypeFlowAI = () => {
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [cards, setCards] = useState<Card[]>([]);
  const [favoriteCards, setFavoriteCards] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cardType, setCardType] = useState('All Types');
  const [minProfit, setMinProfit] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('Profit Potential');
  
  // Card Oracle state
  const [messages, setMessages] = useState<Array<{content: string, type: 'user' | 'bot'}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sample data
  const sampleCards: Card[] = useMemo(() => [
    {
      id: "1",
      name: "Michael Jordan Rookie Card",
      set_name: "1986-87 Fleer",
      year: 1986,
      player_name: "Michael Jordan",
      sport: "Basketball",
      current_price: 89500.00,
      price_change_24h: 5.2,
      price_change_7d: 12.8,
      condition: "PSA 10",
      grade_company: "PSA",
      popularity_score: 99.8,
      image_url: "",
      view_count: 28940,
      likes: 4567,
      comments: 234,
      rarity_score: 98.5,
      investment_grade: 'S',
      ai_confidence: 97.2,
      market_velocity: 8.9,
      ebay_listings: [{
        id: "eb1",
        title: "1986-87 Fleer Michael Jordan #57 Rookie Card PSA 10 GEM MINT",
        price: 87500,
        shipping: 25,
        condition: "PSA 10",
        seller_rating: 99.8,
        listing_url: "https://www.ebay.com/itm/1986-87-Fleer-Michael-Jordan-57-Rookie-Card-PSA-10-GEM-MINT/123456789",
        time_left: "1d 8h",
        watchers: 127,
        bids: 0,
        is_auction: false,
        image_url: ""
      }],
      price_comparison: {
        ebay_avg: 92000,
        market_130point: 95000,
        market_pwcc: 94000,
        psacard_avg: 93000,
        undervalued_percentage: -2.7,
        confidence_score: 96,
        last_updated: "2024-01-15T10:30:00Z"
      }
    },
    {
      id: "2",
      name: "LeBron James Rookie Card",
      set_name: "2003-04 Topps Chrome",
      year: 2003,
      player_name: "LeBron James",
      sport: "Basketball",
      current_price: 3200.00,
      price_change_24h: -2.1,
      price_change_7d: 18.9,
      condition: "Raw",
      grade_company: "Ungraded",
      popularity_score: 97.4,
      image_url: "",
      view_count: 18720,
      likes: 2890,
      comments: 156,
      rarity_score: 91.2,
      investment_grade: 'A',
      ai_confidence: 94.8,
      market_velocity: 12.3,
      ebay_listings: [{
        id: "eb2",
        title: "2003-04 Topps Chrome LeBron James Rookie Card #111 Raw",
        price: 2800,
        shipping: 15,
        condition: "Raw",
        seller_rating: 98.5,
        listing_url: "https://www.ebay.com/itm/2003-04-Topps-Chrome-LeBron-James-Rookie-Card-111-Raw/987654321",
        time_left: "2d 12h",
        watchers: 89,
        bids: 3,
        is_auction: true,
        image_url: ""
      }],
      price_comparison: {
        ebay_avg: 3000,
        market_130point: 3500,
        market_pwcc: 3400,
        psacard_avg: 3200,
        undervalued_percentage: -6.7,
        confidence_score: 92,
        last_updated: "2024-01-15T10:30:00Z"
      }
    },
    {
      id: "3",
      name: "Tom Brady Rookie Card",
      set_name: "2000 Playoff Contenders",
      year: 2000,
      player_name: "Tom Brady",
      sport: "Football",
      current_price: 18500.00,
      price_change_24h: 1.8,
      price_change_7d: -1.2,
      condition: "PSA 9",
      grade_company: "PSA",
      popularity_score: 94.1,
      image_url: "",
      view_count: 14560,
      likes: 1987,
      comments: 78,
      rarity_score: 89.7,
      investment_grade: 'A',
      ai_confidence: 92.1,
      market_velocity: 6.4,
      ebay_listings: [{
        id: "eb3",
        title: "2000 Playoff Contenders Tom Brady Rookie Card PSA 9",
        price: 19500,
        shipping: 30,
        condition: "PSA 9",
        seller_rating: 99.2,
        listing_url: "https://www.ebay.com/itm/2000-Playoff-Contenders-Tom-Brady-Rookie-Card-PSA-9/456789123",
        time_left: "5d 3h",
        watchers: 45,
        bids: 0,
        is_auction: false,
        image_url: ""
      }],
      price_comparison: {
        ebay_avg: 19000,
        market_130point: 20000,
        market_pwcc: 19500,
        psacard_avg: 19200,
        undervalued_percentage: -2.6,
        confidence_score: 88,
        last_updated: "2024-01-15T10:30:00Z"
      }
    }
  ], []);

  const marketData: MarketData[] = useMemo(() => [
    { month: 'Jan', value: 115 },
    { month: 'Feb', value: 125 },
    { month: 'Mar', value: 140 },
    { month: 'Apr', value: 135 },
    { month: 'May', value: 145 },
    { month: 'Jun', value: 150 }
  ], []);

  // Initialize data
  useEffect(() => {
    setCards(sampleCards);
  }, [sampleCards]);

  // Utility functions
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);


  const toggleFavorite = useCallback((cardId: string) => {
    setFavoriteCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  }, []);

  const isUnderpriced = useCallback((card: Card) => {
    return card.price_comparison && card.price_comparison.undervalued_percentage < -2;
  }, []);

  const getSportIcon = useCallback((sport: string) => {
    switch (sport) {
      case 'Basketball': return '🏀';
      case 'Football': return '🏈';
      case 'Baseball': return '⚾';
      case 'Soccer': return '⚽';
      default: return '🎯';
    }
  }, []);

  // Scanner function
  const startScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }
    
    setIsScanning(false);
  }, []);

  // Card Oracle functions

  const generateResponse = useCallback((message: string) => {
    const msg = message.toLowerCase();
    
    // Michael Jordan sell/hold analysis
    if (msg.includes('should i sell') && msg.includes('jordan')) {
      return `<p>Regarding selling your Michael Jordan cards right now - here's my honest assessment:</p>
      
      <p><strong>Current Market Context:</strong><br>
      Jordan cards are in an interesting spot. We've seen some cooling from the 2020-2021 peaks, but his market has found strong support levels. The key question is which Jordan card you have and its condition.</p>
      
      <p><strong>My recommendation depends on your specific situation:</strong></p>
      
      <p><strong>SELL NOW if:</strong><br>
      • You have raw cards in questionable condition (PSA 6 or lower potential)<br>
      • You need liquidity and can't wait for optimal timing<br>
      • You're holding modern Jordan inserts/parallels (these have cooled significantly)<br>
      • You bought during the 2021 peak and want to minimize losses</p>
      
      <p><strong>HOLD if:</strong><br>
      • You have high-grade vintage (PSA 8+ from 1980s-1990s)<br>
      • Your cards are in true mint condition and ungraded<br>
      • You can wait 12-18 months for the next market cycle<br>
      • You believe in Jordan's long-term collecting legacy (which I do)</p>
      
      <p><strong>Market Timing:</strong><br>
      Basketball season is starting soon, which typically provides a 10-15% boost. However, interest rates and economic uncertainty are keeping some collectors on the sidelines.</p>
      
      <p><strong>Bottom line:</strong> If it's high-quality vintage Jordan (especially the '86 Fleer rookie), I'd lean toward holding unless you desperately need the money. The GOAT's cards always find their way back up.</p>
      
      <p>What specific Jordan card are you considering selling?</p>`;
    }
    
    // Mahomes analysis
    if (msg.includes('should i sell') && msg.includes('mahomes')) {
      return `<p>Great timing on this Mahomes question:</p>
      
      <p><strong>Current Reality:</strong><br>
      Mahomes rookie prices have compressed about 40-50% from their 2021-2022 peaks. The good news? They've found solid support and aren't falling further. The market has matured.</p>
      
      <p><strong>My take - HOLD for now, here's why:</strong></p>
      
      <p><strong>Bullish Factors:</strong><br>
      • Still only 29 years old with 5+ elite years ahead<br>
      • Chiefs are legitimate dynasty contenders<br>
      • His cards are severely undervalued compared to Brady at similar career stage<br>
      • Strong fundamentals - he's not going anywhere</p>
      
      <p><strong>Market Timing:</strong><br>
      We're entering NFL season, and if the Chiefs make another deep playoff run, you'll see 20-30% price appreciation. Summer was the worst time to sell football cards.</p>
      
      <p><strong>However, sell NOW if:</strong><br>
      • You bought at peak prices and want to cut losses<br>
      • You have lower-end parallels or base cards<br>
      • You need immediate liquidity</p>
      
      <p><strong>My Strategy:</strong><br>
      Hold through this season and reassess in February. If Chiefs win another Super Bowl, you'll be very happy you waited.</p>
      
      <p>What grade Mahomes rookie are we talking about?</p>`;
    }
    
    // Grading questions
    if (msg.includes('worth grading') || msg.includes('should i grade')) {
      return `<p>Grading decisions can make or break your ROI, so let's think through this carefully:</p>
      
      <p><strong>My Grading Decision Framework:</strong></p>
      
      <p><strong>Definitely Grade If:</strong><br>
      • Card appears mint and is worth $100+ raw<br>
      • You see perfect centering (50/50 or very close)<br>
      • Corners are razor sharp with no fraying<br>
      • Surface is pristine with strong gloss<br>
      • It's a key rookie or vintage card</p>
      
      <p><strong>Probably Don't Grade If:</strong><br>
      • Obvious centering issues (worse than 70/30)<br>
      • Any visible creases, stains, or print defects<br>
      • Raw card worth less than $50<br>
      • You see edge chipping or corner rounding</p>
      
      <p><strong>Economics Check:</strong><br>
      PSA grading costs $20-75 depending on service level, plus shipping and insurance. You need reasonable confidence of hitting PSA 8+ to make it profitable.</p>
      
      <p><strong>Pro Tips:</strong><br>
      • Use a jeweler's loupe to inspect closely<br>
      • Compare your card to already-graded examples online<br>
      • When in doubt, get a second opinion<br>
      • Consider SGC as a cheaper alternative for vintage</p>
      
      <p>Can you describe the condition of the specific card you're considering? What player/year/set are we talking about?</p>`;
    }
    
    // Investment advice
    if (msg.includes('best investment') || msg.includes('what should i buy')) {
      return `<p>Here's my current investment outlook for the card market:</p>
      
      <p><strong>Blue Chip Investments (Lower Risk, Steady Gains):</strong><br>
      • Vintage Jordan (especially '86 Fleer) - the gold standard<br>
      • Brady rookies - GOAT status locked in<br>
      • High-grade vintage baseball HOFers<br>
      • Pristine vintage basketball (1980s-1990s)</p>
      
      <p><strong>Growth Investments (Higher Risk, Higher Upside):</strong><br>
      • Mahomes rookies - still undervalued for his trajectory<br>
      • CJ Stroud rookies - ROTY winner, still affordable<br>
      • Ja Morant rookies - discounted due to off-court issues<br>
      • International soccer stars (Mbappe, Haaland)</p>
      
      <p><strong>Contrarian Plays (Speculative):</strong><br>
      • Anthony Richardson - huge upside if he develops<br>
      • Zion Williamson - health concerns created opportunity<br>
      • Hockey rookies - undervalued market overall</p>
      
      <p><strong>What I'm Avoiding:</strong><br>
      • Overproduced modern base cards<br>
      • Injury-prone players<br>
      • Retired players past their hype cycles</p>
      
      <p><strong>Investment Philosophy:</strong><br>
      Treat cards like any investment - diversify, buy quality, have an exit strategy, and never invest more than you can afford to lose.</p>
      
      <p>What's your budget and risk tolerance? Are you looking for quick flips or long-term holds?</p>`;
    }
    
    // Market timing
    if (msg.includes('when to sell') || msg.includes('timing')) {
      return `<p>Market timing is crucial in cards. Here's my seasonal playbook:</p>
      
      <p><strong>🏈 Football Cards:</strong><br>
      • <strong>Peak Season:</strong> September-February (regular season + playoffs)<br>
      • <strong>Dead Season:</strong> March-August (offseason)<br>
      • <strong>Sweet Spots:</strong> Week 1 NFL, playoff runs, Super Bowl hype<br>
      • <strong>Avoid:</strong> Draft day (unless it's your player), summer months</p>
      
      <p><strong>🏀 Basketball Cards:</strong><br>
      • <strong>Peak Season:</strong> October-June (season + playoffs)<br>
      • <strong>Dead Season:</strong> July-September<br>
      • <strong>Sweet Spots:</strong> All-Star break, playoff runs, Finals<br>
      • <strong>Rookie Boost:</strong> March Madness for college prospects</p>
      
      <p><strong>⚾ Baseball Cards:</strong><br>
      • <strong>Peak Season:</strong> March-October<br>
      • <strong>Rookie Calls:</strong> May-September (huge for prospects)<br>
      • <strong>World Series:</strong> October boost for participants</p>
      
      <p><strong>General Rules:</strong><br>
      • Player performance = immediate 15-40% price swings<br>
      • Buy during offseason, sell during peak performance<br>
      • Injuries create buying opportunities<br>
      • Awards ceremonies drive short-term spikes</p>
      
      <p><strong>Right Now:</strong> We're entering football season - perfect time to hold/buy football cards, consider selling basketball cards.</p>
      
      <p>What sport/player are you timing?</p>`;
    }
    
    // Burrow specific
    if (msg.includes('burrow')) {
      return `<p>Joe Burrow cards are in a tricky spot right now:</p>
      
      <p><strong>Market Reality Check:</strong><br>
      His rookie cards peaked in late 2021 after that incredible playoff run to the Super Bowl, then crashed hard in 2022 when he got injured. They've been relatively stable since, but haven't really recovered.</p>
      
      <p><strong>Current Values (rough estimates):</strong><br>
      • 2020 Prizm #325: PSA 10 ($400-600), PSA 9 ($150-250)<br>
      • Raw cards in mint condition: $15-35<br>
      • Signed rookies: $200-400 depending on brand</p>
      
      <p><strong>My Honest Assessment:</strong></p>
      
      <p><strong>SELL if:</strong><br>
      • You're looking for quick liquidity<br>
      • You bought during the 2021 hype and want to cut losses<br>
      • You have raw/lower grade cards<br>
      • You don't believe in the Bengals' long-term window</p>
      
      <p><strong>HOLD if:</strong><br>
      • You have high-grade rookies (PSA 9/10)<br>
      • You can wait 2-3 years for potential appreciation<br>
      • You believe he'll have sustained success</p>
      
      <p><strong>Reality Check:</strong><br>
      Burrow's ceiling is probably Aaron Rodgers-level card values, not Mahomes/Brady tier. The Bengals' window might be narrower due to salary cap constraints.</p>
      
      <p>The market has largely moved on from Burrow as "the next big thing." If you're not emotionally attached, selling might be the right move.</p>
      
      <p>What specific Burrow cards are you holding?</p>`;
    }
    
    // Default natural responses
    const naturalResponses = [
      `<p>That's a great question that really depends on the specifics. What card or player are you thinking about? The more context you can give me about the situation, the better advice I can provide.</p>
      
      <p>Are you looking at buying, selling, grading, or just trying to understand current market values?</p>`,
      
      `<p>I'd love to help with that! The card market is all about context - player performance, card condition, market timing, and your personal situation all factor into the best strategy.</p>
      
      <p>Can you tell me more about the specific card or situation you're dealing with?</p>`,
      
      `<p>Smart question! Card decisions can be tricky because there are so many moving pieces. Values change based on player performance, seasonal trends, card condition, and broader market sentiment.</p>
      
      <p>What's the specific scenario you're trying to figure out? I can give much more targeted advice with some details.</p>`,
      
      `<p>That's definitely something I can help you think through! My approach is always to consider the fundamentals: player trajectory, card quality, market timing, and your personal goals.</p>
      
      <p>What player or card has caught your attention? And what's your timeline - quick flip or long-term investment?</p>`
    ];
    
    return naturalResponses[Math.floor(Math.random() * naturalResponses.length)];
  }, []);

  const sendMessage = useCallback(() => {
    if (!currentMessage.trim()) return;
    
    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message
    setMessages(prev => [...prev, { content: userMessage, type: 'user' }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Generate response with delay
    setTimeout(() => {
      const response = generateResponse(userMessage);
      setMessages(prev => [...prev, { content: response, type: 'bot' }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  }, [currentMessage, generateResponse]);

  const askExample = useCallback((question: string) => {
    setCurrentMessage(question);
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
            © 2025 CardArbitrage Pro. All rights reserved. | Find. Analyze. Profit.
          </p>
        </div>
      </footer>
    </div>
  );

  // Scanner Page
  const renderScanner = () => (
    <div className="min-h-screen relative">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-sm animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Card Scanner
            </span>
          </h2>
          
          <div className="text-center mb-8">
            <button
              onClick={startScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-12 py-4 rounded-lg font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isScanning ? `SCANNING... ${scanProgress}%` : 'SCAN FOR DEALS'}
            </button>
          </div>

          {/* Filter Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Search for specific cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Card Type</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Baseball">Baseball</option>
                    <option value="Soccer">Soccer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Min Profit %</label>
                  <input
                    type="number"
                    value={minProfit}
                    onChange={(e) => setMinProfit(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                
      <div>
                  <label className="block text-sm text-gray-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  >
                    <option value="Profit Potential">Profit Potential</option>
                    <option value="Price">Price</option>
                    <option value="Popularity">Popularity</option>
                    <option value="Recent">Recent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.filter(card => isUnderpriced(card)).map((card) => (
              <div key={card.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getSportIcon(card.sport)}</span>
                      <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full">
                        DEAL
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                      {card.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-1">{card.set_name} • {card.year}</p>
                    <p className="text-gray-500 text-xs">{card.player_name}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">{formatPrice(card.current_price)}</span>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold text-sm">
                        {Math.abs(card.price_comparison?.undervalued_percentage || 0).toFixed(1)}% undervalued
                      </div>
                    </div>
                  </div>
                  
                  {card.ebay_listings && card.ebay_listings.length > 0 && (
                    <a
                      href={card.ebay_listings[0].listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-center py-2 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on eBay - {formatPrice(card.ebay_listings[0].price)}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Portfolio Page
  const renderPortfolio = () => {
    const favoriteCardsList = cards.filter(card => favoriteCards.includes(card.id));
    const totalValue = favoriteCardsList.reduce((sum, card) => sum + card.current_price, 0);
    const totalProfit = favoriteCardsList.reduce((sum, card) => sum + (card.current_price * 0.1), 0);
    const avgReturn = favoriteCardsList.length > 0 ? (totalProfit / totalValue) * 100 : 0;
    
    return (
      <div className="min-h-screen relative">
        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/20 rounded-sm animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                My Portfolio
              </span>
            </h2>
            
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{formatPrice(totalValue)}</div>
                <div className="text-gray-300">Total Value</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{formatPrice(totalProfit)}</div>
                <div className="text-gray-300">Total Profit</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
                <div className="text-3xl font-bold text-white mb-2">{favoriteCardsList.length}</div>
                <div className="text-gray-300">Cards Owned</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{avgReturn.toFixed(1)}%</div>
                <div className="text-gray-300">Avg Return</div>
              </div>
            </div>

            {/* Cards */}
            {favoriteCardsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteCardsList.map((card) => (
                  <div key={card.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getSportIcon(card.sport)}</span>
                          <span className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full">
                            FAVORITE
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                          {card.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-1">{card.set_name} • {card.year}</p>
                        <p className="text-gray-500 text-xs">{card.player_name}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(card.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">{formatPrice(card.current_price)}</span>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${card.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {card.price_change_24h >= 0 ? '+' : ''}{card.price_change_24h}%
                          </div>
                          <div className="text-xs text-gray-400">24h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Favorite Cards Yet</h3>
                <p className="text-gray-500 mb-6">Start building your portfolio by favoriting cards you're interested in.</p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Browse Cards
        </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Analytics Page
  const renderAnalytics = () => (
    <div className="min-h-screen relative">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-sm animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <button 
              onClick={() => setActiveTab('scanner')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl mb-8"
            >
              Start Scanning Now
            </button>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Market Analytics
            </span>
          </h2>
          
          {/* Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-400 rounded"></div>
                <span className="text-white font-semibold">Average Card Prices</span>
              </div>
            </div>
            
            <div className="h-80 flex items-end justify-between space-x-2">
              {marketData.map((data) => (
                <div key={data.month} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="w-full bg-gray-700 rounded-t">
                    <div 
                      className="bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t transition-all duration-1000"
                      style={{ height: `${(data.value / 160) * 100}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm">{data.month}</div>
                  <div className="text-white text-xs font-semibold">{data.value}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-4 text-gray-400 text-sm">
              <span>0</span>
              <span>40</span>
              <span>80</span>
              <span>120</span>
              <span>160</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Card Oracle Page
  const renderCardOracle = () => (
    <div className="min-h-screen relative">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-sm animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900/50 border-b border-gray-700/50 p-6 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                🃏 Card Oracle
              </h2>
              <p className="text-gray-400">Expert AI for sports & trading card analysis, grading, and investment advice</p>
            </div>

            {/* Chat Container */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Hi! I'm Card Oracle, your AI trading card expert.</h3>
                  <p className="text-gray-400 mb-6">Ask me anything about card values, grading decisions, market timing, or investment advice. I have deep knowledge of sports cards, TCGs, vintage cards, and current market trends.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    <button
                      onClick={() => askExample('Should I sell my Michael Jordan cards now?')}
                      className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg p-3 text-left text-sm transition-all duration-300"
                    >
                      "Should I sell my Michael Jordan cards now?"
                    </button>
                    <button
                      onClick={() => askExample('Is my 2020 Prizm Burrow rookie worth grading?')}
                      className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg p-3 text-left text-sm transition-all duration-300"
                    >
                      "Is my 2020 Prizm Burrow rookie worth grading?"
                    </button>
                    <button
                      onClick={() => askExample('What are the best card investments right now?')}
                      className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg p-3 text-left text-sm transition-all duration-300"
                    >
                      "What are the best card investments right now?"
                    </button>
                    <button
                      onClick={() => askExample('When should I sell football cards for maximum profit?')}
                      className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg p-3 text-left text-sm transition-all duration-300"
                    >
                      "When should I sell football cards for maximum profit?"
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl p-4 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700/50 text-gray-100 border border-gray-600'
                    }`}>
                      {message.type === 'bot' ? (
                        <div dangerouslySetInnerHTML={{ __html: message.content }} />
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center space-x-2">
                    <span className="text-gray-400">Card Oracle is thinking</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Container */}
            <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
              <div className="flex space-x-3">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything about trading cards..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                CardArbitrage Pro
              </h1>
            </div>
            
            <div className="flex space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'scanner', label: 'Scanner' },
                { id: 'portfolio', label: 'Portfolio' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'oracle', label: 'Card Oracle' },
                { id: 'settings', label: 'Settings' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' 
                      : 'text-white hover:text-cyan-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'scanner' && renderScanner()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'oracle' && renderCardOracle()}
        {activeTab === 'settings' && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Settings</h2>
              <p className="text-gray-400">Settings page coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HypeFlowAI;