import React, { useState } from "react";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import { Label } from "./../components/ui/label";
import { Separator } from "./../components/ui/separator";
import { CheckCircle } from "lucide-react";

export default function CheckoutForm({ cart, onOrderComplete, placeOrder }) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        cart,
        shipping: formData,
        payment_method: "COD",
      };

      const response = await placeOrder(orderData);
      onOrderComplete(response);
    } catch (err) {
      // placeOrder should handle toasts; rethrow if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Input id="address_line1" name="address_line1" value={formData.address_line1} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input id="address_line2" name="address_line2" value={formData.address_line2} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} required />
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

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.asin} className="flex justify-between">
              <span className="text-sm text-gray-400">{item.product.title.substring(0, 30)}... x{item.quantity}</span>
              <span className="text-sm text-white">${(item.product.cod_price * item.quantity).toFixed(2)}</span>
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
            <div className="inline-block bg-lime-500 text-black rounded px-2 py-1">Cash on Delivery (COD)</div>
            <p className="text-xs text-gray-400 mt-2">Pay when your order is delivered to your doorstep</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
