import React from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card";
import { Separator } from "./../components/ui/separator";
import { Badge } from "./../components/ui/badge";

export default function CartView({ cart, onUpdateQuantity, onRemoveItem, onCheckout }) {
  if (!cart.items || cart.items.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">Tu carrito esta vacio</h3>
          <p className="text-gray-400">Busca productos y agregalos a tu carrito</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Carrtio de Compras ({cart.items.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.asin} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
            <img src={item.product.images[0]} alt={item.product.title} className="w-20 h-20 object-cover rounded-md" />
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-white line-clamp-2">{item.product.title}</h4>
              <p className="text-sm text-gray-400">ASIN: {item.product.asin}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(item.asin, item.quantity - 1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-white">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => onUpdateQuantity(item.asin, item.quantity + 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-lime-400">${(item.product.cod_price * item.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="sm" onClick={() => onRemoveItem(item.asin)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Separator />

        <div className="bg-gray-800 rounded-lg p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal (Amazon Prices):</span>
            <span className="text-white">${cart.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Comision Total:</span>
            <span className="text-orange-400">+${cart.total_commission?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Handling:</span>
            <span className="text-orange-400">+${cart.total_handling?.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">Precio EasyCOD:</span>
            <span className="text-lime-400">${cart.total_cod_price?.toFixed(2)}</span>
          </div>
          <Button onClick={onCheckout} className="w-full h-12 text-base font-semibold mt-4">
            <span className="inline-flex items-center">
              <span className="mr-2">Proceed to Checkout</span>
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
