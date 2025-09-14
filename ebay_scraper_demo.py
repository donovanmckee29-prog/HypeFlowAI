#!/usr/bin/env python3
"""
HypeFlow AI Pro - eBay Scraper Demo
Simplified version that works without full backend setup
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import List, Dict
import re
from bs4 import BeautifulSoup

class EbayScraperDemo:
    """Simplified eBay scraper for demonstration"""
    
    def __init__(self):
        self.base_url = "https://www.ebay.com"
        self.search_url = "https://www.ebay.com/sch/i.html"
        self.session = None
        self.scraped_listings = []
    
    async def initialize(self):
        """Initialize the scraper"""
        connector = aiohttp.TCPConnector(limit=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        print("🔍 eBay Scraper initialized!")
    
    async def scrape_sports_cards(self, search_terms: List[str], max_pages: int = 3) -> List[Dict]:
        """Scrape sports cards from eBay"""
        all_listings = []
        
        print(f"🚀 Starting eBay scraping for {len(search_terms)} search terms...")
        
        for term in search_terms:
            print(f"📊 Scraping: '{term}'")
            
            for page in range(1, max_pages + 1):
                try:
                    listings = await self._scrape_search_page(term, page)
                    all_listings.extend(listings)
                    print(f"   Page {page}: Found {len(listings)} listings")
                    
                    # Be respectful - add delay
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    print(f"   Error on page {page}: {e}")
                    continue
        
        # Analyze listings
        analyzed_listings = self._analyze_listings(all_listings)
        
        print(f"✅ Scraping completed! Total listings: {len(analyzed_listings)}")
        return analyzed_listings
    
    async def _scrape_search_page(self, search_term: str, page: int) -> List[Dict]:
        """Scrape a single search page"""
        try:
            params = {
                '_nkw': search_term,
                '_pgn': page,
                '_sacat': '0',
                'LH_BIN': '1',
                'LH_Auction': '1',
                'rt': 'nc',
                '_sop': '10'
            }
            
            url = f"{self.search_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._parse_listings(html, search_term)
                else:
                    print(f"   HTTP {response.status} for page {page}")
                    return []
                    
        except Exception as e:
            print(f"   Error scraping page {page}: {e}")
            return []
    
    def _parse_listings(self, html: str, search_term: str) -> List[Dict]:
        """Parse listings from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        listings = []
        
        # Find listing containers
        listing_containers = soup.find_all('div', class_='s-item')
        
        for container in listing_containers:
            try:
                listing = self._parse_single_listing(container, search_term)
                if listing:
                    listings.append(listing)
            except Exception as e:
                continue
        
        return listings
    
    def _parse_single_listing(self, container, search_term: str) -> Dict:
        """Parse a single listing"""
        try:
            # Extract title
            title_elem = container.find('h3', class_='s-item__title')
            if not title_elem:
                return None
            
            title = title_elem.get_text(strip=True)
            
            # Extract price
            price_elem = container.find('span', class_='s-item__price')
            if not price_elem:
                return None
            
            price_text = price_elem.get_text(strip=True)
            price = self._extract_price(price_text)
            
            # Extract condition
            condition_elem = container.find('span', class_='SECONDARY_INFO')
            condition = condition_elem.get_text(strip=True) if condition_elem else "Unknown"
            
            # Extract seller
            seller_elem = container.find('span', class_='s-item__seller-info-text')
            seller = seller_elem.get_text(strip=True) if seller_elem else "Unknown"
            
            # Extract image
            img_elem = container.find('img', class_='s-item__image')
            image_url = img_elem.get('src') if img_elem else ""
            
            # Extract listing URL
            link_elem = container.find('a', class_='s-item__link')
            listing_url = link_elem.get('href') if link_elem else ""
            
            # Extract card info
            card_info = self._extract_card_info(title, search_term)
            
            return {
                'title': title,
                'price': price,
                'condition': condition,
                'seller': seller,
                'image_url': image_url,
                'listing_url': listing_url,
                'search_term': search_term,
                'player': card_info.get('player', ''),
                'year': card_info.get('year'),
                'grade': card_info.get('grade', ''),
                'set_name': card_info.get('set', ''),
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            return None
    
    def _extract_price(self, price_text: str) -> float:
        """Extract numeric price from text"""
        price_clean = re.sub(r'[^\d.,]', '', price_text)
        try:
            return float(price_clean.replace(',', ''))
        except:
            return 0.0
    
    def _extract_card_info(self, title: str, search_term: str) -> Dict:
        """Extract card-specific information"""
        card_info = {}
        
        # Extract year
        year_match = re.search(r'\b(19|20)\d{2}\b', title)
        if year_match:
            card_info['year'] = int(year_match.group())
        
        # Extract player name
        if 'jordan' in title.lower():
            card_info['player'] = 'Michael Jordan'
        elif 'mahomes' in title.lower():
            card_info['player'] = 'Patrick Mahomes'
        elif 'lebron' in title.lower():
            card_info['player'] = 'LeBron James'
        elif 'wembanyama' in title.lower():
            card_info['player'] = 'Victor Wembanyama'
        elif 'bedard' in title.lower():
            card_info['player'] = 'Connor Bedard'
        
        # Extract grade
        grade_match = re.search(r'\b(PSA|BGS|SGC)\s*(\d+(?:\.\d+)?)\b', title, re.IGNORECASE)
        if grade_match:
            card_info['grade'] = f"{grade_match.group(1)} {grade_match.group(2)}"
        
        # Extract set name
        if 'prizm' in title.lower():
            card_info['set'] = 'Prizm'
        elif 'fleer' in title.lower():
            card_info['set'] = 'Fleer'
        elif 'topps' in title.lower():
            card_info['set'] = 'Topps'
        elif 'chrome' in title.lower():
            card_info['set'] = 'Chrome'
        
        return card_info
    
    def _analyze_listings(self, listings: List[Dict]) -> List[Dict]:
        """Analyze listings for market opportunities"""
        analyzed_listings = []
        
        for listing in listings:
            # Simple analysis - in production this would use AI
            is_underpriced = False
            profit_potential = 0.0
            market_value = listing['price']
            
            # Mock analysis based on keywords
            if 'rookie' in listing['title'].lower():
                market_value = listing['price'] * 1.5
                if market_value > listing['price'] * 1.2:
                    is_underpriced = True
                    profit_potential = ((market_value - listing['price']) / listing['price']) * 100
            
            if 'psa 10' in listing['title'].lower():
                market_value = listing['price'] * 2.0
                if market_value > listing['price'] * 1.3:
                    is_underpriced = True
                    profit_potential = ((market_value - listing['price']) / listing['price']) * 100
            
            listing.update({
                'is_underpriced': is_underpriced,
                'profit_potential': round(profit_potential, 2),
                'market_value': round(market_value, 2),
                'confidence_score': 0.85 if is_underpriced else 0.5
            })
            
            analyzed_listings.append(listing)
        
        return analyzed_listings
    
    async def get_market_analysis(self) -> Dict:
        """Get market analysis summary"""
        underpriced_count = sum(1 for listing in self.scraped_listings if listing.get('is_underpriced', False))
        total_value = sum(listing['price'] for listing in self.scraped_listings)
        avg_price = total_value / len(self.scraped_listings) if self.scraped_listings else 0
        
        return {
            'total_listings': len(self.scraped_listings),
            'underpriced_opportunities': underpriced_count,
            'average_price': round(avg_price, 2),
            'total_value': round(total_value, 2),
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
        print("🧹 Scraper cleanup completed")

async def main():
    """Main function to run the scraper demo"""
    scraper = EbayScraperDemo()
    
    try:
        await scraper.initialize()
        
        # Define search terms
        search_terms = [
            "michael jordan rookie card",
            "patrick mahomes prizm",
            "lebron james rookie",
            "victor wembanyama rookie",
            "psa 10 basketball card"
        ]
        
        # Start scraping
        listings = await scraper.scrape_sports_cards(search_terms, max_pages=2)
        scraper.scraped_listings = listings
        
        # Get market analysis
        analysis = await scraper.get_market_analysis()
        
        print("\n" + "="*60)
        print("📊 MARKET ANALYSIS RESULTS")
        print("="*60)
        print(f"Total Listings: {analysis['total_listings']}")
        print(f"Underpriced Opportunities: {analysis['underpriced_opportunities']}")
        print(f"Average Price: ${analysis['average_price']}")
        print(f"Total Value: ${analysis['total_value']}")
        
        print("\n" + "="*60)
        print("🎯 TOP OPPORTUNITIES")
        print("="*60)
        
        # Show top opportunities
        opportunities = [l for l in listings if l.get('is_underpriced', False)]
        opportunities.sort(key=lambda x: x.get('profit_potential', 0), reverse=True)
        
        for i, listing in enumerate(opportunities[:5], 1):
            print(f"\n{i}. {listing['title'][:60]}...")
            print(f"   Price: ${listing['price']} | Market Value: ${listing['market_value']}")
            print(f"   Profit Potential: +{listing['profit_potential']}%")
            print(f"   Player: {listing['player']} | Grade: {listing['grade']}")
            print(f"   Seller: {listing['seller']}")
        
        # Save results to JSON
        with open('ebay_scraping_results.json', 'w') as f:
            json.dump({
                'listings': listings,
                'analysis': analysis,
                'scraped_at': datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n💾 Results saved to: ebay_scraping_results.json")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await scraper.cleanup()

if __name__ == "__main__":
    print("🚀 HypeFlow AI Pro - eBay Scraper Demo")
    print("="*50)
    asyncio.run(main())
