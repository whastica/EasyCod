import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

import useCart from "./hooks/useCart";
import useNavigation from "./hooks/useNavigation";

import ProductSearch from "./components/ProductSearch";
import ProductCard from "./components/ProductCard";
import CartView from "./components/CartView";
import CheckoutForm from "./components/CheckoutForm";
import OrderSuccess from "./components/OrderSuccess";

import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Package, Search as SearchIcon } from "lucide-react";

function App() {
  const { cart, addToCart, updateQuantity, removeFromCart, placeOrder } = useCart();
  const {
    currentView,
    setCurrentView,
    searchedProduct,
    handleProductFound,
    handleSampleProduct,
    completedOrder,
    setCompletedOrder,
    backToHome,
  } = useNavigation();

  const handleOrderComplete = (order) => {
    setCompletedOrder(order);
    setCurrentView("success");
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
                  <h1 className="text-2xl font-bold text-white">Kashly</h1>
                </div>

                <nav className="flex items-center gap-4">
                  <Button
                    variant={currentView === "search" || currentView === "product" ? "default" : "ghost"}
                    onClick={() => setCurrentView("search")}
                  >
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    variant={currentView === "cart" ? "default" : "ghost"}
                    onClick={() => setCurrentView("cart")}
                    className="relative"
                  >
                    <SearchIcon className="w-0 h-0" style={{ display: "none" }} />
                    Cart
                    {cart.items.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-lime-500 text-black">{cart.items.length}</Badge>
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
                    Pegue la URL de cualquier producto de Amazon olvidate de la logistica y recíbelo con pago contraentrega!
                  </p>
                </div>

                <ProductSearch onProductFound={handleProductFound} />

                <div className="text-center mt-12">
                  <h3 className="text-xl font-semibold text-white mb-6">Puedes intentar pegar ejemplos de productos:</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {["B08N5WRWNW", "B0C1SLD1PZ", "B0BDJ6M6JZ"].map((asin) => (
                      <Button key={asin} variant="outline" onClick={() => handleSampleProduct(asin)} className="text-sm">
                        Sample {asin}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentView === "product" && searchedProduct && <ProductCard product={searchedProduct} onAddToCart={addToCart} />}

            {currentView === "cart" && (
              <CartView cart={cart} onUpdateQuantity={updateQuantity} onRemoveItem={removeFromCart} onCheckout={() => setCurrentView("checkout")} />
            )}

            {currentView === "checkout" && <CheckoutForm cart={cart} onOrderComplete={handleOrderComplete} placeOrder={placeOrder} />}

            {currentView === "success" && completedOrder && <OrderSuccess order={completedOrder} onBackToHome={backToHome} />}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-800 bg-gray-900">
            <div className="container mx-auto px-4 py-8 text-center text-gray-400">
              <p>&copy; Cash on Delivery service.</p>
            </div>
          </footer>
        </div>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;