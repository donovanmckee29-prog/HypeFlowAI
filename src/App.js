import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Upload, 
  Search, 
  MessageSquare, 
  Wallet, 
  X, 
  ArrowRight, 
  CheckCircle, 
  Plus, 
  BarChart3, 
  Camera, 
  Loader2, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  FileText
} from 'lucide-react';
import NavBar from './NavBar';

// API Service Layer
class APIService {
  constructor() {
    this.mockMode = true;
  }

  async request(endpoint) {
    return this.getMockData(endpoint);
  }

  getMockData(endpoint) {
    const mockData = {
      '/api/grader/predict': {
        predicted_grade: 'PSA 9',
        confidence: 0.92,
        subgrades: { centering: 0.88, corners: 0.85, edges: 0.91, surface: 0.78 },
        evidence: [{ type: 'historical_comp', source: 'eBay', price: 1200, snippet: 'Similar PSA 9 sold for $1,200' }],
        mock: true
      },
      '/api/market/top-picks': [{
        price: 1250,
        predicted_roi: 0.15,
        evidence: [{ type: 'price_trend', source: '130point', confidence: 0.87, snippet: '15% growth projected' }],
        mock: true
      }],
      '/api/portfolio/value': { total_invested: 0, total_current: 0, roi_percent: 0, breakdown: [], mock: true },
      '/api/oracle/query': {
        statement: 'Based on current market data and analysis, this shows promising indicators.',
        confidence: 0.82,
        reasoning: ['Recent sales data shows upward momentum', 'Market sentiment analysis suggests positive outlook'],
        evidence: [{ type: 'market_data', source: 'eBay', snippet: 'Recent sales show 12% increase' }],
        mock: true
      },
      '/api/market/listings': {
        items: [{ title: 'Premium Search Result', price: 850, mock: true }]
      }
    };
    return Promise.resolve(mockData[endpoint] || { mock: true });
  }

  async gradeCard() { return this.request('/api/grader/predict'); }
  async getTopPicks() { return this.request('/api/market/top-picks'); }
  async searchMarket() { return this.request('/api/market/listings'); }
  async queryOracle() { return this.request('/api/oracle/query'); }
  async getPortfolioValue() { return this.request('/api/portfolio/value'); }
  async addPortfolioItem() { return Promise.resolve({ success: true }); }
  async removePortfolioItem() { return Promise.resolve({ success: true }); }
}

// Evidence Panel Component
const EvidencePanel = ({ evidence = [], isOpen, onToggle }) => {
  if (!evidence.length) return null;

  return (
    <div className="mt-4">
      <button onClick={onToggle} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-cyan-400">
        <Info className="w-4 h-4" />
        <span>View Evidence ({evidence.length})</span>
        <ArrowRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
          {evidence.map((item, index) => (
            <div key={index} className="text-xs text-slate-300 border-l-2 border-cyan-500/30 pl-3 mb-2">
              <div className="font-medium text-cyan-400">{item.source}</div>
              {item.snippet && <p className="text-slate-400">{item.snippet}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Error Display Component
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;
  return (
    <div className="fixed top-20 right-4 z-50 bg-red-500/90 text-white px-6 py-4 rounded-xl">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-sm">Error</div>
          <div className="text-sm opacity-90">{error}</div>
        </div>
        <button onClick={onDismiss} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [error, setError] = useState(null);
  const [apiService] = useState(() => new APIService());
  const [topPicks, setTopPicks] = useState([]);
  const systemStatus = { uptime: 99.97, processingSpeed: 0.642, accuracyRate: 99.4 };

  const loadPortfolioValue = useCallback(async () => {
    try {
      await apiService.getPortfolioValue();
      // Portfolio value loaded but not used in current UI
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
  }, [apiService]);

  const loadTopPicks = useCallback(async () => {
    try {
      const data = await apiService.getTopPicks();
      setTopPicks(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Failed to load top picks:', err);
    }
  }, [apiService]);

  useEffect(() => {
    loadPortfolioValue();
    loadTopPicks();
  }, [loadPortfolioValue, loadTopPicks]);

  // Home Page
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-4 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-semibold">All Systems Operational</span>
            <span className="text-emerald-400 text-sm">{systemStatus.accuracyRate}% AI Accuracy</span>
            <span className="text-orange-400 text-xs font-medium">DEV MODE</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sports Card
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent text-5xl md:text-7xl">
              Intelligence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto">
            AI-powered grading, real-time market intelligence, and evidence-based investment recommendations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              onClick={() => setCurrentPage('market')}
              className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6" />
                <span className="text-lg">Scan Market</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
            
            <button 
              onClick={() => setCurrentPage('grader')}
              className="group px-10 py-5 border-2 border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-bold rounded-2xl hover:bg-cyan-400/5 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6" />
                <span className="text-lg">Grade Card</span>
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </div>

          {topPicks.length > 0 && (
            <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-16">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Top AI Pick</h3>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-2">
                  ${topPicks[0]?.price?.toLocaleString()}
                </div>
                <div className="text-green-400 font-semibold mb-4">
                  +{((topPicks[0]?.predicted_roi || 0) * 100).toFixed(1)}% Predicted ROI
                </div>
                
                <div className="text-xs text-orange-400 mb-4 p-2 bg-orange-500/10 rounded border border-orange-500/20">
                  Development Mode - Using Mock Data
                </div>
                
                <button 
                  onClick={() => setCurrentPage('market')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Live Market Activity</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">$47.2M</div>
                <div className="text-sm text-slate-400">24h Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">847K</div>
                <div className="text-sm text-slate-400">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">$127</div>
                <div className="text-sm text-slate-400">Avg. Sale Price</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Market Page
  const MarketPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const performSearch = async () => {
      if (!searchQuery.trim()) return;
      setSearchLoading(true);
      try {
        const results = await apiService.searchMarket(searchQuery);
        setSearchResults(results.items || []);
      } catch (err) {
        setError('Search failed');
      } finally {
        setSearchLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Market Intelligence</h1>
            <p className="text-slate-300">Real-time data from 20+ sources with evidence-backed insights</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-8">
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                placeholder="Search cards, players, or sets..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={performSearch}
                disabled={searchLoading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
              <div className="grid lg:grid-cols-3 gap-6">
                {searchResults.map((result, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                    <div className="aspect-[3/4] bg-slate-600 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-slate-400">Card Image</span>
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">{result.title}</div>
                    <div className="text-green-400 font-bold text-xl mb-2">${result.price}</div>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Grader Page
  const GraderPage = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [gradeResult, setGradeResult] = useState(null);
    const [grading, setGrading] = useState(false);
    const [evidenceOpen, setEvidenceOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setUploadedImage(file);
      setGrading(true);
      setGradeResult(null);

      try {
        setTimeout(async () => {
          const result = await apiService.gradeCard();
          setGradeResult(result);
          setGrading(false);
        }, 2000);
      } catch (err) {
        setError('Grading failed');
        setGrading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">AI Grader</h1>
            <p className="text-slate-300">Professional-grade analysis with {systemStatus.accuracyRate}% accuracy</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Upload Card Image</h2>
                
                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 hover:border-cyan-400 rounded-xl p-12 text-center cursor-pointer transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">Drop your card image here</h3>
                    <p className="text-slate-300 mb-4">AI analysis in {systemStatus.processingSpeed} seconds</p>
                    <div className="text-sm text-slate-500">Supports JPG, PNG, HEIC, WebP • Max 25MB</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={URL.createObjectURL(uploadedImage)} 
                        alt="Uploaded card"
                        className="w-full h-80 object-cover"
                      />
                      {gradeResult && (
                        <div className="absolute top-4 left-4">
                          <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Analysis Complete</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setGradeResult(null);
                      }}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              {grading && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-4">AI Analysis in Progress</h3>
                  <div className="text-slate-400">Computer vision processing...</div>
                </div>
              )}

              {gradeResult && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-white">Grade Analysis</h3>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Confidence</div>
                      <div className="text-2xl font-bold text-green-400">
                        {(gradeResult.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <div className="text-sm text-slate-400 mb-2">Predicted Grade</div>
                    <div className="text-5xl font-bold text-cyan-400 mb-4">
                      {gradeResult.predicted_grade}
                    </div>
                    <div className="text-lg text-green-400 font-semibold">
                      Est. Value: ${gradeResult.evidence[0]?.price?.toLocaleString()}
                    </div>
                  </div>

                  {gradeResult.subgrades && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {Object.entries(gradeResult.subgrades).map(([key, value]) => (
                        <div key={key} className="text-center p-4 bg-slate-700/30 rounded-xl">
                          <div className="text-sm text-slate-400 mb-1 capitalize">{key}</div>
                          <div className="text-xl font-bold text-white">
                            {(value * 10).toFixed(1)}
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <EvidencePanel 
                    evidence={gradeResult.evidence} 
                    isOpen={evidenceOpen} 
                    onToggle={() => setEvidenceOpen(!evidenceOpen)} 
                  />
                </div>
              )}

              {!gradeResult && !grading && (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Upload a card to get started</h3>
                  <p className="text-slate-400">Advanced AI analysis with {systemStatus.accuracyRate}% accuracy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Oracle Page
  const OraclePage = () => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async () => {
      if (!currentMessage.trim() || isTyping) return;
      
      const userMessage = {
        type: 'user',
        content: currentMessage,
        id: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setCurrentMessage('');
      setIsTyping(true);
      
      setTimeout(async () => {
        try {
          const response = await apiService.queryOracle(currentMessage);
          const aiMessage = {
            type: 'ai',
            content: response.statement,
            confidence: response.confidence,
            reasoning: response.reasoning,
            evidence: response.evidence,
            id: Date.now() + 1
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
          setError('Oracle query failed');
        } finally {
          setIsTyping(false);
        }
      }, 1500);
    };

    const quickQuestions = [
      "Should I invest in rookie cards from the 2024 NBA draft?",
      "What's the outlook for Mahomes cards in 2025?",
      "Which vintage cards are undervalued right now?"
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Oracle Predictions</h1>
            <p className="text-slate-300">Evidence-backed insights powered by real market data and AI analysis</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">Oracle AI Online</span>
              </div>
            </div>

            <div className="h-96 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Ask Oracle Anything</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Get evidence-backed insights on market trends, player analysis, and investment opportunities
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-slate-500 mb-3">Try asking:</div>
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentMessage(question);
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="block w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-all duration-200 text-sm"
                      >
                        "{question}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-4xl p-6 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 border border-cyan-500/30'
                            : 'bg-slate-700/50 text-slate-100 border border-slate-600/50'
                        }`}
                      >
                        <div className="text-sm leading-relaxed mb-4">{message.content}</div>
                        
                        {message.type === 'ai' && (
                          <>
                            <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-300">Analysis</span>
                                <span className="text-sm font-bold text-green-400">
                                  {(message.confidence * 100).toFixed(0)}% Confidence
                                </span>
                              </div>
                              
                              {message.reasoning && (
                                <div className="space-y-2">
                                  {message.reasoning.map((reason, index) => (
                                    <div key={index} className="flex items-start space-x-2 text-xs text-slate-400">
                                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                      <span>{reason}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <EvidencePanel evidence={message.evidence} isOpen={false} onToggle={() => {}} />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700/50 border border-slate-600/50 p-6 rounded-2xl">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-slate-400 text-sm">Oracle analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-700/50">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about market predictions, player analysis, investment advice..."
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Portfolio Page
  const PortfolioPage = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', grade: '', purchase_price: '', current_value: '', evidence_url: '' });

    const addItem = async () => {
      if (!newItem.name || !newItem.purchase_price || !newItem.current_value) {
        setError('Please fill in all required fields');
        return;
      }
      try {
        await apiService.addPortfolioItem(newItem);
        await loadPortfolioValue();
        setNewItem({ name: '', grade: '', purchase_price: '', current_value: '', evidence_url: '' });
        setShowAddForm(false);
      } catch (err) {
        setError('Failed to add item');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Smart Portfolio</h1>
            <p className="text-slate-300">Track your collection with real-time valuations and evidence-based insights</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-600 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Portfolio Empty</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Start building your collection by adding cards, memorabilia, or other collectibles.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Add Your First Item
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Total Value</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">$0.00</div>
                  <div className="text-lg font-medium text-slate-400">0.00%</div>
                  <div className="text-sm text-slate-400 mt-2">Total Return</div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
                <div className="text-center py-4">
                  <Brain className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">
                    AI insights will appear once you add items to your portfolio
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Add Portfolio Item</h3>
                  <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Item Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                      placeholder="e.g., 2018 Luka Doncic Prizm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Price *</label>
                      <input
                        type="number"
                        value={newItem.purchase_price}
                        onChange={(e) => setNewItem({...newItem, purchase_price: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Current Value *</label>
                      <input
                        type="number"
                        value={newItem.current_value}
                        onChange={(e) => setNewItem({...newItem, current_value: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addItem}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Analytics Page
  const AnalyticsPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Analytics & Reports</h1>
            <p className="text-slate-300">Comprehensive insights and exportable reports</p>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Export Reports</h2>
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>CSV</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">1,247</div>
                <div className="text-slate-300">Total Transactions</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">99.2%</div>
                <div className="text-slate-300">Avg Grade Accuracy</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">+23.5%</div>
                <div className="text-slate-300">Portfolio Growth</div>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">87.3%</div>
                <div className="text-slate-300">Prediction Success</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Portfolio Performance</h3>
                <div className="h-64 bg-slate-700/30 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <div>Chart would render here</div>
                    <div className="text-sm">Real implementation: Recharts/D3</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Market Trends</h3>
                <div className="h-64 bg-slate-700/30 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                    <div>Chart would render here</div>
                    <div className="text-sm">Real implementation: Recharts/D3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'market': return <MarketPage />;
      case 'grader': return <GraderPage />;
      case 'oracle': return <OraclePage />;
      case 'portfolio': return <PortfolioPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      
      
      {renderCurrentPage()}
      
      <footer className="bg-slate-900/50 border-t border-slate-700/50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                Infinity Pro 2.0
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Enterprise sports card intelligence platform with evidence-based insights
            </p>
            <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
              <span>© 2024 Infinity Pro</span>
              <span>•</span>
              <span>{systemStatus.uptime}% Uptime</span>
              <span>•</span>
              <span>AI Accuracy: {systemStatus.accuracyRate}%</span>
              <span>•</span>
              <span className="text-orange-400">Development Mode</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;