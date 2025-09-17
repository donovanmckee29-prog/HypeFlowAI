import React, { useState, useEffect, useRef } from 'react';
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
  Trash2, 
  BarChart3, 
  ExternalLink, 
  Camera, 
  Loader2, 
  Lightbulb, 
  Sparkles, 
  Award, 
  Info, 
  AlertTriangle, 
  FileText,
  Menu,
  Home
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiService] = useState(() => new APIService());
  const [portfolioValue, setPortfolioValue] = useState(null);
  const [topPicks, setTopPicks] = useState([]);
  const systemStatus = { uptime: 99.97, processingSpeed: 0.642, accuracyRate: 99.4 };

  useEffect(() => {
    loadPortfolioValue();
    loadTopPicks();
  }, []);

  const loadPortfolioValue = async () => {
    try {
      const data = await apiService.getPortfolioValue();
      setPortfolioValue(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
  };

  const loadTopPicks = async () => {
    try {
      const data = await apiService.getTopPicks();
      setTopPicks(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Failed to load top picks:', err);
    }
  };

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

  // Main render logic
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Loading...</div>
          </div>
        </div>
      )}
      
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