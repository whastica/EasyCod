from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import re
from urllib.parse import urlparse, parse_qs
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Product(BaseModel):
    asin: str
    title: str
    images: List[str]
    amazon_price: float
    cod_price: float
    commission: float
    handling_fee: float
    rating: Optional[float] = None
    review_count: Optional[int] = None
    seller: Optional[str] = None
    availability: str = "In Stock"
    description: Optional[str] = None

class ProductLookup(BaseModel):
    url: Optional[str] = None
    asin: Optional[str] = None

class CartItem(BaseModel):
    asin: str
    quantity: int
    product: Product

class Cart(BaseModel):
    items: List[CartItem]
    subtotal: float
    total_commission: float
    total_handling: float
    total_cod_price: float

class ShippingInfo(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "US"

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    cart: Cart
    shipping: ShippingInfo
    payment_method: str = "COD"
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    cart: Cart
    shipping: ShippingInfo
    payment_method: str = "COD"

class OrderUpdate(BaseModel):
    status: str

# Mock Amazon product data
MOCK_PRODUCTS = {
    "B08N5WRWNW": {
        "asin": "B08N5WRWNW",
        "title": "Echo Dot (4th Gen) | Smart speaker with Alexa | Charcoal",
        "images": [
            "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"
        ],
        "amazon_price": 49.99,
        "rating": 4.7,
        "review_count": 45230,
        "seller": "Amazon.com",
        "description": "Meet the all-new Echo Dot - Our most compact smart speaker that fits perfectly into small spaces."
    },
    "B0C1SLD1PZ": {
        "asin": "B0C1SLD1PZ",
        "title": "Apple AirPods Pro (2nd Generation) Wireless Earbuds",
        "images": [
            "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop"
        ],
        "amazon_price": 249.99,
        "rating": 4.4,
        "review_count": 12890,
        "seller": "Apple",
        "description": "Active Noise Cancellation reduces unwanted background noise."
    },
    "B0BDJ6M6JZ": {
        "asin": "B0BDJ6M6JZ",
        "title": "Kindle Paperwhite (11th Generation) - 6.8\" display, 8GB",
        "images": [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=500&h=500&fit=crop"
        ],
        "amazon_price": 139.99,
        "rating": 4.6,
        "review_count": 8920,
        "seller": "Amazon.com",
        "description": "The thinnest, lightest Kindle Paperwhite yet, with a 6.8\" display and adjustable warm light."
    },
    "B0B2XZSTZ8": {
        "asin": "B0B2XZSTZ8",
        "title": "SAMSUNG 32\" Odyssey G7 Gaming Monitor, 4K UHD",
        "images": [
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&h=500&fit=crop"
        ],
        "amazon_price": 799.99,
        "rating": 4.3,
        "review_count": 2340,
        "seller": "Samsung",
        "description": "32\" 4K UHD gaming monitor with 144Hz refresh rate and HDR600."
    },
    "B09G9FPHY6": {
        "asin": "B09G9FPHY6",
        "title": "Fire TV Stick 4K Max streaming device, Wi-Fi 6",
        "images": [
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop",
            "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=500&fit=crop"
        ],
        "amazon_price": 54.99,
        "rating": 4.5,
        "review_count": 15670,
        "seller": "Amazon.com",
        "description": "Streaming stick with 40% more power, Wi-Fi 6 support, and Dolby Vision."
    }
}

def extract_asin_from_url(url: str) -> Optional[str]:
    """Extract ASIN from Amazon URL"""
    try:
        # Common Amazon URL patterns
        patterns = [
            r'/dp/([A-Z0-9]{10})',
            r'/product/([A-Z0-9]{10})',
            r'/gp/product/([A-Z0-9]{10})',
            r'asin=([A-Z0-9]{10})',
            r'/([A-Z0-9]{10})/',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    except Exception:
        return None

def calculate_cod_pricing(amazon_price: float) -> Dict[str, float]:
    """Calculate COD pricing with 10% commission + $5 handling fee"""
    commission = round(amazon_price * 0.10, 2)  # 10% commission
    handling_fee = 5.00  # Fixed $5 handling fee
    cod_price = round(amazon_price + commission + handling_fee, 2)
    
    return {
        "commission": commission,
        "handling_fee": handling_fee,
        "cod_price": cod_price
    }

def prepare_for_mongo(data):
    """Convert data for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
    return data

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Amazon COD API", "version": "1.0.0"}

@api_router.post("/amazon/lookup", response_model=Product)
async def lookup_product(lookup: ProductLookup):
    """Look up Amazon product by URL or ASIN"""
    asin = lookup.asin
    
    if lookup.url and not asin:
        asin = extract_asin_from_url(lookup.url)
        
    if not asin:
        raise HTTPException(status_code=400, detail="Could not extract ASIN from URL or invalid ASIN provided")
        
    # Check if product exists in mock data
    if asin not in MOCK_PRODUCTS:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product_data = MOCK_PRODUCTS[asin].copy()
    pricing = calculate_cod_pricing(product_data["amazon_price"])
    
    product_data.update(pricing)
    
    return Product(**product_data)

@api_router.get("/products/{asin}", response_model=Product)
async def get_product(asin: str):
    """Get cached product by ASIN"""
    if asin not in MOCK_PRODUCTS:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product_data = MOCK_PRODUCTS[asin].copy()
    pricing = calculate_cod_pricing(product_data["amazon_price"])
    
    product_data.update(pricing)
    
    return Product(**product_data)

@api_router.post("/cart", response_model=Cart)
async def calculate_cart(cart_data: Dict[str, Any]):
    """Calculate cart totals with COD pricing"""
    items = cart_data.get("items", [])
    cart_items = []
    subtotal = 0
    total_commission = 0
    total_handling = 0
    
    for item in items:
        asin = item.get("asin")
        quantity = item.get("quantity", 1)
        
        if asin not in MOCK_PRODUCTS:
            continue
            
        product_data = MOCK_PRODUCTS[asin].copy()
        pricing = calculate_cod_pricing(product_data["amazon_price"])
        product_data.update(pricing)
        
        product = Product(**product_data)
        cart_item = CartItem(asin=asin, quantity=quantity, product=product)
        cart_items.append(cart_item)
        
        subtotal += product.amazon_price * quantity
        total_commission += product.commission * quantity
        total_handling += product.handling_fee * quantity
    
    total_cod_price = subtotal + total_commission + total_handling
    
    return Cart(
        items=cart_items,
        subtotal=subtotal,
        total_commission=total_commission,
        total_handling=total_handling,
        total_cod_price=total_cod_price
    )

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Create a new COD order"""
    order = Order(**order_data.dict())
    
    # Prepare data for MongoDB
    order_dict = prepare_for_mongo(order.dict())
    
    # Insert into database
    result = await db.orders.insert_one(order_dict)
    
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create order")
        
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    """Get all orders (admin endpoint)"""
    orders = await db.orders.find().to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get order by ID"""
    order = await db.orders.find_one({"id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return Order(**order)

@api_router.patch("/orders/{order_id}", response_model=Order)
async def update_order_status(order_id: str, update: OrderUpdate):
    """Update order status (admin endpoint)"""
    order = await db.orders.find_one({"id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update the order
    update_data = {
        "status": update.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.orders.update_one(
        {"id": order_id}, 
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update order")
    
    # Return updated order
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()