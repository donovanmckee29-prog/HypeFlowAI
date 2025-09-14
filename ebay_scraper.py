import requests
import time
import json
import random
import threading
import hashlib
import pickle
import os
from typing import Optional, Dict, List, Tuple, Union, Any
from urllib.parse import urlencode, quote, urlparse
from urllib.robotparser import RobotFileParser
import logging
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timedelta
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import sqlite3
from contextlib import contextmanager
import socket
import ssl
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import base64
import hmac
import uuid
import sys

# Configure comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ebay_extractor.log'),
        logging.StreamHandler()
    ]
)

class APIMethod(Enum):
    BROWSE_API = "browse_api"
    FINDING_API = "finding_api"
    SHOPPING_API = "shopping_api"  
    SCRAPING_REQUESTS = "scraping_requests"
    SCRAPING_SELENIUM = "scraping_selenium"
    THIRD_PARTY_RAPIDAPI = "rapidapi"
    THIRD_PARTY_SCRAPFLY = "scrapfly"
    RSS_FEEDS = "rss_feeds"
    MOBILE_API = "mobile_api"
    PROXY_ROTATION = "proxy_rotation"

class ErrorSeverity(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

@dataclass
class EbayListing:
    item_id: str
    title: str
    price: str
    url: str
    image_url: Optional[str] = None
    condition: Optional[str] = None
    seller: Optional[str] = None
    location: Optional[str] = None
    shipping: Optional[str] = None
    watchers: Optional[int] = None
    bids: Optional[int] = None
    time_left: Optional[str] = None
    buy_it_now: Optional[bool] = None
    best_offer: Optional[bool] = None
    free_shipping: Optional[bool] = None
    returns_accepted: Optional[bool] = None
    source_method: Optional[str] = None
    extracted_at: Optional[str] = None
    confidence_score: float = 1.0

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
        
    def call(self, func, *args, **kwargs):
        if self.state == 'OPEN':
            if time.time() - self.last_failure_time > self.timeout:
                self.state = 'HALF_OPEN'
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            if self.state == 'HALF_OPEN':
                self.state = 'CLOSED'
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = 'OPEN'
            raise e

class RateLimiter:
    def __init__(self, max_calls: int, time_window: int):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
        self.lock = threading.Lock()
    
    def wait_if_needed(self):
        with self.lock:
            now = time.time()
            # Remove old calls outside the time window
            self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
            
            if len(self.calls) >= self.max_calls:
                oldest_call = min(self.calls)
                sleep_time = self.time_window - (now - oldest_call) + 0.1
                if sleep_time > 0:
                    time.sleep(sleep_time)
                    now = time.time()
            
            self.calls.append(now)

class ProxyRotator:
    def __init__(self):
        self.proxies = self._load_proxy_list()
        self.current_index = 0
        self.failed_proxies = set()
        
    def _load_proxy_list(self) -> List[Dict[str, str]]:
        # Free proxy sources (use with caution in production)
        return [
            {'http': None, 'https': None},  # Direct connection
            # Add your premium proxy list here
        ]
    
    def get_next_proxy(self) -> Optional[Dict[str, str]]:
        if not self.proxies:
            return None
            
        for _ in range(len(self.proxies)):
            proxy = self.proxies[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.proxies)
            
            proxy_key = str(proxy)
            if proxy_key not in self.failed_proxies:
                return proxy
                
        return None  # All proxies failed
    
    def mark_proxy_failed(self, proxy: Dict[str, str]):
        self.failed_proxies.add(str(proxy))

class CacheManager:
    def __init__(self, cache_dir: str = "ebay_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.db_path = os.path.join(cache_dir, "cache.db")
        self._init_db()
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS cache (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    expires_at REAL,
                    created_at REAL
                )
            ''')
    
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30)
        try:
            yield conn
        finally:
            conn.close()
    
    def get(self, key: str) -> Optional[Any]:
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(
                    'SELECT value, expires_at FROM cache WHERE key = ?', (key,)
                )
                row = cursor.fetchone()
                if row and (row[1] is None or time.time() < row[1]):
                    return pickle.loads(base64.b64decode(row[0]))
        except Exception as e:
            logging.error(f"Cache get error: {e}")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        try:
            expires_at = time.time() + ttl if ttl else None
            encoded_value = base64.b64encode(pickle.dumps(value)).decode()
            
            with self.get_connection() as conn:
                conn.execute(
                    'INSERT OR REPLACE INTO cache (key, value, expires_at, created_at) VALUES (?, ?, ?, ?)',
                    (key, encoded_value, expires_at, time.time())
                )
                conn.commit()
        except Exception as e:
            logging.error(f"Cache set error: {e}")

class UltraRobustEbayExtractor:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
        
        # Initialize all components
        self._init_credentials()
        self._init_session()
        self._init_components()
        self._init_fallback_configs()
        
        # State tracking
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.last_error = None
        self.start_time = time.time()
        
    def _init_credentials(self):
        """Initialize all possible API credentials"""
        self.credentials = {
            'ebay_app_id': self.config.get('ebay_app_id'),
            'ebay_cert_id': self.config.get('ebay_cert_id'),
            'ebay_dev_id': self.config.get('ebay_dev_id'),
            'ebay_user_token': self.config.get('ebay_user_token'),
            'ebay_client_id': self.config.get('ebay_client_id'),
            'ebay_client_secret': self.config.get('ebay_client_secret'),
            'rapidapi_key': self.config.get('rapidapi_key'),
            'scrapfly_key': self.config.get('scrapfly_key'),
            'proxy_username': self.config.get('proxy_username'),
            'proxy_password': self.config.get('proxy_password'),
        }
        
        self.access_token = None
        self.token_expires = 0
    
    def _init_session(self):
        """Initialize ultra-robust HTTP session"""
        self.session = requests.Session()
        
        # Configure retries
        retry_strategy = Retry(
            total=10,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504, 520, 521, 522, 523, 524],
            allowed_methods=["HEAD", "GET", "OPTIONS", "POST"],
            raise_on_status=False
        )
        
        adapter = HTTPAdapter(
            max_retries=retry_strategy,
            pool_connections=20,
            pool_maxsize=20,
            pool_block=True
        )
        
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set comprehensive headers
        self.session.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
    
    def _init_components(self):
        """Initialize all helper components"""
        self.cache = CacheManager()
        self.proxy_rotator = ProxyRotator()
        self.circuit_breakers = {
            method: CircuitBreaker() for method in APIMethod
        }
        self.rate_limiters = {
            'browse_api': RateLimiter(4000, 86400),  # 4000 per day (safety buffer)
            'scraping': RateLimiter(60, 3600),       # 60 per hour
            'third_party': RateLimiter(1000, 86400), # 1000 per day
        }
        
        # User agent rotation
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
        ]
    
    def _init_fallback_configs(self):
        """Initialize configurations for all fallback methods"""
        self.fallback_configs = {
            'max_retries_per_method': 5,
            'timeout_per_request': 30,
            'max_concurrent_requests': 10,
            'cache_ttl_seconds': 3600,
            'respect_robots_txt': True,
            'min_delay_between_requests': 1.0,
            'max_delay_between_requests': 5.0,
            'exponential_backoff_base': 2,
            'circuit_breaker_threshold': 5,
            'circuit_breaker_timeout': 300,
        }
    
    def _handle_error(self, error: Exception, method: str, severity: ErrorSeverity = ErrorSeverity.MEDIUM):
        """Comprehensive error handling and logging"""
        self.failed_requests += 1
        self.last_error = {
            'error': str(error),
            'method': method,
            'severity': severity.name,
            'timestamp': datetime.now().isoformat(),
            'traceback': sys.exc_info()
        }
        
        error_msg = f"[{severity.name}] {method}: {str(error)}"
        
        if severity == ErrorSeverity.CRITICAL:
            self.logger.critical(error_msg)
        elif severity == ErrorSeverity.HIGH:
            self.logger.error(error_msg)
        elif severity == ErrorSeverity.MEDIUM:
            self.logger.warning(error_msg)
        else:
            self.logger.info(error_msg)
    
    def _exponential_backoff(self, attempt: int, base_delay: float = 1.0) -> float:
        """Calculate exponential backoff delay"""
        max_delay = 60.0  # Cap at 1 minute
        delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
        return delay
    
    def _make_robust_request(self, url: str, method: str = "GET", **kwargs) -> Optional[requests.Response]:
        """Make an HTTP request with maximum robustness"""
        max_attempts = self.fallback_configs['max_retries_per_method']
        
        for attempt in range(max_attempts):
            try:
                # Rate limiting
                if 'scraping' in method.lower():
                    self.rate_limiters['scraping'].wait_if_needed()
                elif 'api' in method.lower():
                    self.rate_limiters['browse_api'].wait_if_needed()
                
                # Rotate user agent and proxy
                headers = kwargs.get('headers', {})
                headers['User-Agent'] = random.choice(self.user_agents)
                kwargs['headers'] = headers
                
                # Use proxy rotation
                proxy = self.proxy_rotator.get_next_proxy()
                if proxy:
                    kwargs['proxies'] = proxy
                
                # Add random delay to appear more human
                if attempt > 0:
                    delay = self._exponential_backoff(attempt)
                    time.sleep(delay)
                else:
                    time.sleep(random.uniform(
                        self.fallback_configs['min_delay_between_requests'],
                        self.fallback_configs['max_delay_between_requests']
                    ))
                
                # Make request
                kwargs['timeout'] = self.fallback_configs['timeout_per_request']
                
                if method.upper() == "GET":
                    response = self.session.get(url, **kwargs)
                elif method.upper() == "POST":
                    response = self.session.post(url, **kwargs)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                self.total_requests += 1
                
                # Check for success
                if response.status_code == 200:
                    self.successful_requests += 1
                    return response
                elif response.status_code == 429:  # Rate limited
                    retry_after = response.headers.get('Retry-After', '60')
                    sleep_time = min(int(retry_after), 300)  # Cap at 5 minutes
                    self.logger.warning(f"Rate limited, sleeping for {sleep_time} seconds")
                    time.sleep(sleep_time)
                    continue
                elif response.status_code in [403, 406]:  # Blocked
                    if proxy:
                        self.proxy_rotator.mark_proxy_failed(proxy)
                    continue
                else:
                    self.logger.warning(f"HTTP {response.status_code} for {url}")
                    continue
                    
            except (requests.RequestException, socket.timeout, ssl.SSLError) as e:
                self._handle_error(e, f"HTTP Request to {url}", ErrorSeverity.MEDIUM)
                if proxy:
                    self.proxy_rotator.mark_proxy_failed(proxy)
                continue
            except Exception as e:
                self._handle_error(e, f"Unexpected error for {url}", ErrorSeverity.HIGH)
                continue
        
        self.logger.error(f"All {max_attempts} attempts failed for {url}")
        return None
    
    def search_with_scraping(self, query: str, limit: int = 50) -> List[EbayListing]:
        """Advanced scraping with multiple strategies"""
        method_name = APIMethod.SCRAPING_REQUESTS.value
        
        try:
            return self.circuit_breakers[APIMethod.SCRAPING_REQUESTS].call(
                self._search_with_scraping_impl, query, limit
            )
        except Exception as e:
            self._handle_error(e, method_name, ErrorSeverity.MEDIUM)
            return []
    
    def _search_with_scraping_impl(self, query: str, limit: int) -> List[EbayListing]:
        """Internal scraping implementation"""
        # Check cache first
        cache_key = f"scraping_{hashlib.md5(f'{query}_{limit}'.encode()).hexdigest()}"
        cached_results = self.cache.get(cache_key)
        if cached_results:
            return cached_results
        
        # Multiple search strategies
        search_urls = self._generate_search_urls(query, limit)
        all_listings = []
        
        for search_url in search_urls:
            try:
                response = self._make_robust_request(search_url, "GET")
                if response:
                    listings = self._parse_search_html(response.text, query)
                    all_listings.extend(listings)
                    
                    if len(all_listings) >= limit:
                        break
                        
            except Exception as e:
                self._handle_error(e, f"Scraping {search_url}", ErrorSeverity.LOW)
                continue
        
        # Remove duplicates
        seen_ids = set()
        unique_listings = []
        for listing in all_listings:
            if listing.item_id not in seen_ids:
                seen_ids.add(listing.item_id)
                unique_listings.append(listing)
                if len(unique_listings) >= limit:
                    break
        
        # Cache results
        self.cache.set(cache_key, unique_listings, ttl=self.fallback_configs['cache_ttl_seconds'])
        
        return unique_listings
    
    def _generate_search_urls(self, query: str, limit: int) -> List[str]:
        """Generate multiple search URL variations"""
        base_params = {
            '_nkw': query,
            '_ipg': min(limit, 240),
            'LH_BIN': '1',  # Buy It Now
            '_sop': '15',   # Price + shipping: lowest first
        }
        
        urls = []
        
        # Standard search
        urls.append(f"https://www.ebay.com/sch/i.html?{urlencode(base_params)}")
        
        # Mobile version (sometimes less restrictive)
        mobile_params = base_params.copy()
        mobile_params['_mwBanner'] = '1'
        urls.append(f"https://m.ebay.com/sch/i.html?{urlencode(mobile_params)}")
        
        # Different sorting options
        for sort_option in ['12', '1', '7']:  # ending soonest, price+ship asc, newly listed
            sort_params = base_params.copy()
            sort_params['_sop'] = sort_option
            urls.append(f"https://www.ebay.com/sch/i.html?{urlencode(sort_params)}")
        
        return urls
    
    def _parse_search_html(self, html: str, query: str) -> List[EbayListing]:
        """Enhanced HTML parsing with multiple extraction methods"""
        listings = []
        
        try:
            # Method 1: JSON-LD extraction
            json_ld_listings = self._extract_from_json_ld(html)
            listings.extend(json_ld_listings)
            
            # Method 2: Regex-based extraction
            regex_listings = self._extract_with_regex(html)
            listings.extend(regex_listings)
            
            # Method 3: DOM-based extraction (simplified)
            dom_listings = self._extract_from_dom_patterns(html)
            listings.extend(dom_listings)
            
        except Exception as e:
            self._handle_error(e, "HTML Parsing", ErrorSeverity.MEDIUM)
        
        return listings
    
    def _extract_from_json_ld(self, html: str) -> List[EbayListing]:
        """Extract listings from JSON-LD structured data"""
        listings = []
        
        try:
            json_ld_pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
            json_matches = re.findall(json_ld_pattern, html, re.DOTALL | re.IGNORECASE)
            
            for json_str in json_matches:
                try:
                    data = json.loads(json_str)
                    if isinstance(data, list):
                        for item in data:
                            if item.get('@type') == 'Product':
                                listing = self._create_listing_from_json_ld(item)
                                if listing:
                                    listings.append(listing)
                    elif data.get('@type') == 'Product':
                        listing = self._create_listing_from_json_ld(data)
                        if listing:
                            listings.append(listing)
                except json.JSONDecodeError:
                    continue
                    
        except Exception as e:
            self._handle_error(e, "JSON-LD extraction", ErrorSeverity.LOW)
        
        return listings
    
    def _create_listing_from_json_ld(self, data: Dict) -> Optional[EbayListing]:
        """Create EbayListing from JSON-LD data"""
        try:
            # Extract item ID from URL or identifier
            item_id = None
            if 'url' in data:
                url_match = re.search(r'/itm/(\d+)', data['url'])
                if url_match:
                    item_id = url_match.group(1)
            
            if not item_id and 'identifier' in data:
                item_id = str(data['identifier'])
            
            if not item_id:
                return None
            
            price = 'N/A'
            if 'offers' in data and data['offers']:
                offer = data['offers'][0] if isinstance(data['offers'], list) else data['offers']
                price = offer.get('price', 'N/A')
            
            return EbayListing(
                item_id=item_id,
                title=data.get('name', 'No title'),
                price=str(price),
                url=data.get('url', f"https://www.ebay.com/itm/{item_id}"),
                image_url=data.get('image', {}).get('url') if isinstance(data.get('image'), dict) else data.get('image'),
                condition=data.get('itemCondition'),
                source_method='json_ld_scraping',
                extracted_at=datetime.now().isoformat(),
                confidence_score=0.8
            )
            
        except Exception as e:
            self._handle_error(e, "Create listing from JSON-LD", ErrorSeverity.LOW)
            return None
    
    def _extract_with_regex(self, html: str) -> List[EbayListing]:
        """Extract listings using regex patterns"""
        listings = []
        
        try:
            # Pattern for eBay item containers
            item_pattern = r'<div[^>]*class="[^"]*s-item[^"]*"[^>]*>(.*?)</div>'
            items = re.findall(item_pattern, html, re.DOTALL | re.IGNORECASE)
            
            for item_html in items:
                try:
                    # Extract item ID
                    item_id_match = re.search(r'href="[^"]*itm/(\d+)', item_html)
                    if not item_id_match:
                        continue
                    item_id = item_id_match.group(1)
                    
                    # Extract title
                    title_match = re.search(r'<h3[^>]*class="[^"]*s-item__title[^"]*"[^>]*>(.*?)</h3>', item_html, re.DOTALL)
                    title = title_match.group(1).strip() if title_match else 'No title'
                    title = re.sub(r'<[^>]+>', '', title)  # Remove HTML tags
                    
                    # Extract price
                    price_match = re.search(r'<span[^>]*class="[^"]*s-item__price[^"]*"[^>]*>(.*?)</span>', item_html)
                    price = price_match.group(1).strip() if price_match else 'N/A'
                    price = re.sub(r'<[^>]+>', '', price)  # Remove HTML tags
                    
                    # Extract image
                    img_match = re.search(r'<img[^>]*src="([^"]*)"[^>]*class="[^"]*s-item__image[^"]*"', item_html)
                    image_url = img_match.group(1) if img_match else None
                    
                    # Extract condition
                    condition_match = re.search(r'<span[^>]*class="[^"]*SECONDARY_INFO[^"]*"[^>]*>(.*?)</span>', item_html)
                    condition = condition_match.group(1).strip() if condition_match else None
                    condition = re.sub(r'<[^>]+>', '', condition) if condition else None
                    
                    # Extract shipping
                    shipping_match = re.search(r'<span[^>]*class="[^"]*s-item__shipping[^"]*"[^>]*>(.*?)</span>', item_html)
                    shipping = shipping_match.group(1).strip() if shipping_match else None
                    shipping = re.sub(r'<[^>]+>', '', shipping) if shipping else None
                    
                    listing = EbayListing(
                        item_id=item_id,
                        title=title,
                        price=price,
                        url=f"https://www.ebay.com/itm/{item_id}",
                        image_url=image_url,
                        condition=condition,
                        shipping=shipping,
                        source_method='regex_scraping',
                        extracted_at=datetime.now().isoformat(),
                        confidence_score=0.7
                    )
                    listings.append(listing)
                    
                except Exception as e:
                    self._handle_error(e, "Parse individual item", ErrorSeverity.LOW)
                    continue
                    
        except Exception as e:
            self._handle_error(e, "Regex extraction", ErrorSeverity.LOW)
        
        return listings
    
    def _extract_from_dom_patterns(self, html: str) -> List[EbayListing]:
        """Extract listings using DOM pattern matching"""
        listings = []
        
        try:
            # Look for common eBay listing patterns
            patterns = [
                r'data-view="[^"]*item[^"]*"[^>]*data-itemid="(\d+)"[^>]*>(.*?)</div>',
                r'class="[^"]*item[^"]*"[^>]*data-itemid="(\d+)"[^>]*>(.*?)</div>',
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)
                for item_id, item_html in matches:
                    try:
                        # Extract basic info
                        title_match = re.search(r'<[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)</[^>]*>', item_html, re.DOTALL)
                        title = title_match.group(1).strip() if title_match else 'No title'
                        title = re.sub(r'<[^>]+>', '', title)
                        
                        price_match = re.search(r'<[^>]*class="[^"]*price[^"]*"[^>]*>(.*?)</[^>]*>', item_html, re.DOTALL)
                        price = price_match.group(1).strip() if price_match else 'N/A'
                        price = re.sub(r'<[^>]+>', '', price)
                        
                        listing = EbayListing(
                            item_id=item_id,
                            title=title,
                            price=price,
                            url=f"https://www.ebay.com/itm/{item_id}",
                            source_method='dom_pattern_scraping',
                            extracted_at=datetime.now().isoformat(),
                            confidence_score=0.6
                        )
                        listings.append(listing)
                        
                    except Exception as e:
                        self._handle_error(e, "Parse DOM pattern item", ErrorSeverity.LOW)
                        continue
                        
        except Exception as e:
            self._handle_error(e, "DOM pattern extraction", ErrorSeverity.LOW)
        
        return listings
    
    def search_ebay(self, query: str, limit: int = 50) -> List[EbayListing]:
        """Main search method with fallback strategies"""
        all_listings = []
        
        # Try scraping first (most reliable for our use case)
        try:
            scraping_results = self.search_with_scraping(query, limit)
            all_listings.extend(scraping_results)
            self.logger.info(f"Scraping found {len(scraping_results)} listings")
        except Exception as e:
            self._handle_error(e, "Scraping search", ErrorSeverity.MEDIUM)
        
        # Remove duplicates and return
        seen_ids = set()
        unique_listings = []
        for listing in all_listings:
            if listing.item_id not in seen_ids:
                seen_ids.add(listing.item_id)
                unique_listings.append(listing)
                if len(unique_listings) >= limit:
                    break
        
        return unique_listings
    
    def get_stats(self) -> Dict[str, Any]:
        """Get extraction statistics"""
        uptime = time.time() - self.start_time
        success_rate = (self.successful_requests / max(self.total_requests, 1)) * 100
        
        return {
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'failed_requests': self.failed_requests,
            'success_rate': round(success_rate, 2),
            'uptime_seconds': round(uptime, 2),
            'last_error': self.last_error,
            'cache_size': len(os.listdir(self.cache.cache_dir)) if os.path.exists(self.cache.cache_dir) else 0
        }

# Flask API to serve the scraper
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize the scraper
scraper = UltraRobustEbayExtractor()

@app.route('/api/search', methods=['GET'])
def search_ebay():
    """API endpoint to search eBay"""
    try:
        query = request.args.get('q', '')
        limit = int(request.args.get('limit', 50))
        
        if not query:
            return jsonify({'error': 'Query parameter "q" is required'}), 400
        
        listings = scraper.search_ebay(query, limit)
        
        # Convert to JSON-serializable format
        results = []
        for listing in listings:
            results.append({
                'item_id': listing.item_id,
                'title': listing.title,
                'price': listing.price,
                'url': listing.url,
                'image_url': listing.image_url,
                'condition': listing.condition,
                'seller': listing.seller,
                'location': listing.location,
                'shipping': listing.shipping,
                'watchers': listing.watchers,
                'bids': listing.bids,
                'time_left': listing.time_left,
                'buy_it_now': listing.buy_it_now,
                'best_offer': listing.best_offer,
                'free_shipping': listing.free_shipping,
                'returns_accepted': listing.returns_accepted,
                'source_method': listing.source_method,
                'extracted_at': listing.extracted_at,
                'confidence_score': listing.confidence_score
            })
        
        return jsonify({
            'success': True,
            'query': query,
            'total_found': len(results),
            'listings': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """API endpoint to get scraper statistics"""
    try:
        stats = scraper.get_stats()
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Ultra Robust eBay Scraper API...")
    print("📊 Available endpoints:")
    print("   GET /api/search?q=query&limit=50")
    print("   GET /api/stats")
    print("🌐 Server starting on http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
