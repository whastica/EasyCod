import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Search, ShoppingCart, Package, Star, Plus, Minus, Trash2, CheckCircle } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Label } from "./components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Product Search Component
const ProductSearch = ({ onProductFound }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!url.trim()) {
      toast.error("Please enter an Amazon product URL");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/amazon/lookup`, { url });
      onProductFound(response.data);
      toast.success("Product found successfully!");
      setUrl("");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="Paste Amazon product URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="h-12 px-8"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Search className="w-5 h-5 mr-2" />
          )}
          Search
        </Button>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart }) => {
  const savings = ((product.cod_price - product.amazon_price) / product.amazon_price * 100).toFixed(1);

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.slice(1, 4).map((img, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    <img src={img} alt={`${product.title} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{product.title}</h2>
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-300">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-400">({product.review_count?.toLocaleString()} reviews)</span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Amazon Price:</span>
                  <span className="text-lg font-semibold text-white">${product.amazon_price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Commission (10%):</span>
                  <span className="text-sm text-orange-400">+${product.commission}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Handling Fee:</span>
                  <span className="text-sm text-orange-400">+${product.handling_fee}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">COD Price:</span>
                  <span className="text-2xl font-bold text-lime-400">${product.cod_price}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Only {savings}% markup for Cash on Delivery convenience
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <Button 
              onClick={() => onAddToCart(product)} 
              className="w-full h-12 text-base font-semibold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            {/* Product Info */}
            <div className="text-sm text-gray-400 space-y-1">
              <p><span className="font-medium">ASIN:</span> {product.asin}</p>
              <p><span className="font-medium">Seller:</span> {product.seller}</p>
              <p><span className="font-medium">Availability:</span> <span className="text-green-400">{product.availability}</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Shopping Cart Component
const CartView = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  if (!cart.items || cart.items.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
          <p className="text-gray-400">Search for products to add them to your cart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Shopping Cart ({cart.items.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        {cart.items.map((item) => (
          <div key={item.asin} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
            <img 
              src={item.product.images[0]} 
              alt={item.product.title}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-white line-clamp-2">{item.product.title}</h4>
              <p className="text-sm text-gray-400">ASIN: {item.product.asin}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.asin, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-white">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.asin, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-lime-400">
                    ${(item.product.cod_price * item.quantity).toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.asin)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Separator />

        {/* Cart Summary */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal (Amazon Prices):</span>
            <span className="text-white">${cart.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Commission:</span>
            <span className="text-orange-400">+${cart.total_commission?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Handling:</span>
            <span className="text-orange-400">+${cart.total_handling?.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Total COD Price:</span>
            <span className="text-lime-400">${cart.total_cod_price?.toFixed(2)}</span>
          </div>
          <Button onClick={onCheckout} className="w-full h-12 text-base font-semibold mt-4">
            <Package className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Checkout Form Component
const CheckoutForm = ({ cart, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US"
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        cart,
        shipping: formData,
        payment_method: "COD"
      };

      const response = await axios.post(`${API}/orders`, orderData);
      toast.success("Order placed successfully!");
      onOrderComplete(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* Shipping Form */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input
                id="address_line1"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold">
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Place COD Order
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.asin} className="flex justify-between">
              <span className="text-sm text-gray-400">
                {item.product.title.substring(0, 30)}... x{item.quantity}
              </span>
              <span className="text-sm text-white">
                ${(item.product.cod_price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">${cart.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commission:</span>
              <span className="text-orange-400">+${cart.total_commission?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Handling:</span>
              <span className="text-orange-400">+${cart.total_handling?.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total COD:</span>
              <span className="text-lime-400">${cart.total_cod_price?.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-white mb-2">Payment Method</h4>
            <Badge variant="secondary" className="bg-lime-500 text-black">
              Cash on Delivery (COD)
            </Badge>
            <p className="text-xs text-gray-400 mt-2">
              Pay when your order is delivered to your doorstep
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Order Success Component
const OrderSuccess = ({ order, onBackToHome }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto text-center">
      <CardContent className="p-8">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-lime-400" />
        <h2 className="text-2xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-400 mb-6">
          Your order has been received and will be processed soon.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">Order Details</h3>
          <p className="text-sm text-gray-400">Order ID: <span className="text-white font-mono">{order.id}</span></p>
          <div className="text-sm text-gray-400">Status: <Badge variant="secondary">{order.status}</Badge></div>
          <p className="text-sm text-gray-400">Total: <span className="text-lime-400 font-semibold">${order.cart.total_cod_price?.toFixed(2)}</span></p>
        </div>

        <Button onClick={onBackToHome} className="w-full h-12">
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState("search");
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [cart, setCart] = useState({ items: [], subtotal: 0, total_commission: 0, total_handling: 0, total_cod_price: 0 });
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleProductFound = (product) => {
    setSearchedProduct(product);
    setCurrentView("product");
  };

  const handleSampleProduct = async (asin) => {
    try {
      const response = await axios.get(`${API}/products/${asin}`);
      handleProductFound(response.data);
      toast.success("Sample product loaded!");
    } catch (error) {
      toast.error("Failed to load sample product");
    }
  };

  const addToCart = async (product) => {
    try {
      const existingItem = cart.items.find(item => item.asin === product.asin);
      
      let newItems;
      if (existingItem) {
        newItems = cart.items.map(item =>
          item.asin === product.asin
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...cart.items, { asin: product.asin, quantity: 1 }];
      }

      const response = await axios.post(`${API}/cart`, { items: newItems });
      setCart(response.data);
      toast.success("Product added to cart!");
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const updateQuantity = async (asin, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(asin);
      return;
    }

    try {
      const newItems = cart.items.map(item =>
        item.asin === asin
          ? { ...item, quantity: newQuantity }
          : item
      );

      const response = await axios.post(`${API}/cart`, { items: newItems });
      setCart(response.data);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const removeFromCart = async (asin) => {
    try {
      const newItems = cart.items.filter(item => item.asin !== asin);
      const response = await axios.post(`${API}/cart`, { items: newItems });
      setCart(response.data);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleOrderComplete = (order) => {
    setCompletedOrder(order);
    setCurrentView("success");
    setCart({ items: [], subtotal: 0, total_commission: 0, total_handling: 0, total_cod_price: 0 });
  };

  const backToHome = () => {
    setCurrentView("search");
    setSearchedProduct(null);
    setCompletedOrder(null);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Header */}
          <header className="border-b border-gray-800">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-lime-400" />
                  <h1 className="text-2xl font-bold text-white">Amazon COD</h1>
                </div>
                
                <nav className="flex items-center gap-4">
                  <Button
                    variant={currentView === "search" || currentView === "product" ? "default" : "ghost"}
                    onClick={() => setCurrentView("search")}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    variant={currentView === "cart" ? "default" : "ghost"}
                    onClick={() => setCurrentView("cart")}
                    className="relative"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {cart.items.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-lime-500 text-black">
                        {cart.items.length}
                      </Badge>
                    )}
                  </Button>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {currentView === "search" && (
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Shop Amazon with <span className="text-lime-400">Cash on Delivery</span>
                  </h2>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Paste any Amazon product URL and get it delivered with COD payment option
                  </p>
                </div>
                <ProductSearch onProductFound={handleProductFound} />
                
                {/* Sample products for demo */}
                <div className="text-center mt-12">
                  <h3 className="text-xl font-semibold text-white mb-6">Try these sample products:</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {["B08N5WRWNW", "B0C1SLD1PZ", "B0BDJ6M6JZ"].map(asin => (
                      <Button
                        key={asin}
                        variant="outline"
                        onClick={() => handleSampleProduct(asin)}
                        className="text-sm"
                      >
                        Sample {asin}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentView === "product" && searchedProduct && (
              <ProductCard product={searchedProduct} onAddToCart={addToCart} />
            )}

            {currentView === "cart" && (
              <CartView
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={() => setCurrentView("checkout")}
              />
            )}

            {currentView === "checkout" && (
              <CheckoutForm cart={cart} onOrderComplete={handleOrderComplete} />
            )}

            {currentView === "success" && completedOrder && (
              <OrderSuccess order={completedOrder} onBackToHome={backToHome} />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-800 bg-gray-900">
            <div className="container mx-auto px-4 py-8 text-center text-gray-400">
              <p>&copy; 2024 Amazon COD. Not affiliated with Amazon.com. Cash on Delivery service.</p>
            </div>
          </footer>
        </div>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;