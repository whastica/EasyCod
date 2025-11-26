import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "./../components/ui/button";
import { Card, CardContent } from "./../components/ui/card";
import { Separator } from "./../components/ui/separator";

export default function ProductCard({ product, onAddToCart }) {
  const savings = ((product.cod_price - product.amazon_price) / product.amazon_price * 100).toFixed(1);

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
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
                <p className="text-xs text-gray-400 mt-2">Only {savings}% markup for Cash on Delivery convenience</p>
              </div>
            </div>

            <Button onClick={() => onAddToCart(product)} className="w-full h-12 text-base font-semibold">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

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
}
