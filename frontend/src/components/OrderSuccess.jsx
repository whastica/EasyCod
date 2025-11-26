import React from "react";
import { CheckCircle, Package } from "lucide-react";
import { Card, CardContent } from "./../components/ui/card";
import { Badge } from "./../components/ui/badge";
import { Button } from "./../components/ui/button";

export default function OrderSuccess({ order, onBackToHome }) {
  return (
    <Card className="w-full max-w-2xl mx-auto text-center">
      <CardContent className="p-8">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-lime-400" />
        <h2 className="text-2xl font-bold text-white mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-400 mb-6">Tu orden ha sido recibida.</p>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">Orden Detalles</h3>
          <p className="text-sm text-gray-400">ID Orden: <span className="text-white font-mono">{order.id}</span></p>
          <div className="text-sm text-gray-400">Estado: <Badge variant="secondary">{order.status}</Badge></div>
          <p className="text-sm text-gray-400">Total: <span className="text-lime-400 font-semibold">${order.cart.total_cod_price?.toFixed(2)}</span></p>
        </div>

        <Button onClick={onBackToHome} className="w-full h-12">
          Continua Comprando
        </Button>
      </CardContent>
    </Card>
  );
}
