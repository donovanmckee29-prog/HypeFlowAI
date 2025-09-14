#!/usr/bin/env python3
"""
HypeFlow AI Pro - FastAPI Backend
High-performance API server with WebSocket support
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional
import base64
import io
from PIL import Image
import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
from pydantic import BaseModel
import uuid

# Import our modules
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.quantum_grader import grade_card
from scraper.ebay_scraper import ebay_scraper, MarketAnalysis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="HypeFlow AI Pro API",
    description="Ultimate AI-Powered Sports Card Investment Platform",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Initialize Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Initialize database connection
def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        database='hypeflow_ai',
        user='postgres',
        password='password'
    )

# Pydantic models
class CardAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    analysis_type: str = "full"  # full, quick, detailed

class CardAnalysisResponse(BaseModel):
    overall_grade: float
    confidence: float
    centering_score: float
    corners_score: float
    edges_score: float
    surface_score: float
    defects: List[Dict]
    recommendations: str
    estimated_value: float
    market_trend: str
    processing_time: float
    ai_model_version: str

class MarketDataResponse(BaseModel):
    total_listings: int
    average_price: float
    median_price: float
    price_trend: str
    volume_trend: str
    top_gainers: List[Dict]
    top_decliners: List[Dict]
    market_opportunities: List[Dict]
    analysis_timestamp: str

class ScrapingRequest(BaseModel):
    search_terms: List[str]
    max_pages: int = 10
    analysis_enabled: bool = True

class ScrapingResponse(BaseModel):
    status: str
    total_listings: int
    successful_scrapes: int
    failed_scrapes: int
    processing_time: float
    message: str

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_connections[user_id] = websocket
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_to_user(self, message: str, user_id: str):
        if user_id in self.user_connections:
            await self.user_connections[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "HypeFlow AI Pro API",
        "version": "2.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        redis_client.ping()
        
        # Check database connection
        conn = get_db_connection()
        conn.close()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "redis": "online",
                "database": "online",
                "ai_models": "online"
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@app.post("/api/analyze-card", response_model=CardAnalysisResponse)
async def analyze_card(request: CardAnalysisRequest):
    """Analyze a sports card using quantum AI grading"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_data)
        
        # Run AI analysis
        result = await grade_card(image_data)
        
        return CardAnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Error analyzing card: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/analyze-card-file")
async def analyze_card_file(file: UploadFile = File(...)):
    """Analyze a sports card from uploaded file"""
    try:
        # Read file data
        file_data = await file.read()
        
        # Run AI analysis
        result = await grade_card(file_data)
        
        return CardAnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Error analyzing card file: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/market-data", response_model=MarketDataResponse)
async def get_market_data():
    """Get real-time market data and analysis"""
    try:
        # Initialize scraper if not already done
        if not hasattr(ebay_scraper, 'db_connection') or ebay_scraper.db_connection is None:
            await ebay_scraper.initialize()
        
        # Get market analysis
        analysis = await ebay_scraper.get_market_analysis()
        
        return MarketDataResponse(
            total_listings=analysis.total_listings,
            average_price=analysis.average_price,
            median_price=analysis.median_price,
            price_trend=analysis.price_trend,
            volume_trend=analysis.volume_trend,
            top_gainers=analysis.top_gainers,
            top_decliners=analysis.top_decliners,
            market_opportunities=analysis.market_opportunities,
            analysis_timestamp=analysis.analysis_timestamp.isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error getting market data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get market data: {str(e)}")

@app.post("/api/start-scraping", response_model=ScrapingResponse)
async def start_scraping(request: ScrapingRequest):
    """Start eBay scraping process"""
    try:
        start_time = datetime.now()
        
        # Initialize scraper
        await ebay_scraper.initialize()
        
        # Start scraping
        listings = await ebay_scraper.scrape_sports_cards(
            request.search_terms,
            request.max_pages
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ScrapingResponse(
            status="completed",
            total_listings=len(listings),
            successful_scrapes=ebay_scraper.scraping_stats['successful_scrapes'],
            failed_scrapes=ebay_scraper.scraping_stats['failed_scrapes'],
            processing_time=processing_time,
            message=f"Successfully scraped {len(listings)} listings"
        )
        
    except Exception as e:
        logger.error(f"Error starting scraping: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@app.get("/api/listings")
async def get_listings(
    limit: int = 100,
    offset: int = 0,
    underpriced_only: bool = False,
    min_profit_potential: float = 0.0
):
    """Get eBay listings with optional filters"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build query
        query = "SELECT * FROM ebay_listings WHERE 1=1"
        params = []
        
        if underpriced_only:
            query += " AND is_underpriced = true"
        
        if min_profit_potential > 0:
            query += " AND profit_potential >= %s"
            params.append(min_profit_potential)
        
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        listings = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "listings": [dict(listing) for listing in listings],
            "total": len(listings),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error getting listings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get listings: {str(e)}")

@app.get("/api/portfolio/{user_id}")
async def get_portfolio(user_id: str):
    """Get user portfolio"""
    try:
        # Mock portfolio data for now
        portfolio = {
            "user_id": user_id,
            "total_value": 125000.0,
            "total_cards": 45,
            "average_grade": 8.7,
            "favorites": 12,
            "cards": [
                {
                    "id": "1",
                    "name": "Michael Jordan 1986 Fleer Rookie #57",
                    "sport": "Basketball",
                    "year": 1986,
                    "grade": 9,
                    "price": 45000,
                    "image": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
                    "is_underpriced": True,
                    "profit_potential": 25,
                    "rarity": "Legendary"
                },
                {
                    "id": "2",
                    "name": "Patrick Mahomes 2017 Prizm Rookie #252",
                    "sport": "Football",
                    "year": 2017,
                    "grade": 10,
                    "price": 3200,
                    "image": "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
                    "is_underpriced": True,
                    "profit_potential": 40,
                    "rarity": "Ultra Rare"
                }
            ]
        }
        
        return portfolio
        
    except Exception as e:
        logger.error(f"Error getting portfolio: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    user_id = str(uuid.uuid4())
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}),
                    websocket
                )
            elif message.get("type") == "subscribe_market":
                # Subscribe to market updates
                await manager.send_personal_message(
                    json.dumps({"type": "subscribed", "channel": "market"}),
                    websocket
                )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)

# Background tasks
async def market_data_broadcaster():
    """Background task to broadcast market data updates"""
    while True:
        try:
            # Get latest market data
            analysis = await ebay_scraper.get_market_analysis()
            
            # Broadcast to all connected clients
            await manager.broadcast(json.dumps({
                "type": "market_update",
                "data": {
                    "total_listings": analysis.total_listings,
                    "average_price": analysis.average_price,
                    "price_trend": analysis.price_trend,
                    "timestamp": analysis.analysis_timestamp.isoformat()
                }
            }))
            
        except Exception as e:
            logger.error(f"Error broadcasting market data: {e}")
        
        # Wait 30 seconds before next update
        await asyncio.sleep(30)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting HypeFlow AI Pro API server...")
    
    # Start background tasks
    asyncio.create_task(market_data_broadcaster())
    
    logger.info("API server started successfully!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down HypeFlow AI Pro API server...")
    
    # Cleanup scraper
    await ebay_scraper.cleanup()
    
    logger.info("API server shutdown complete!")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
