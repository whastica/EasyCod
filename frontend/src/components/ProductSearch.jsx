import React, { useState } from "react";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import * as api from "../services/api";
import { MESSAGES } from "../constants/messages";

export default function ProductSearch({ onProductFound }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!url.trim()) {
      toast.error(MESSAGES.ENTER_URL);
      return;
    }

    setLoading(true);
    try {
      const product = await api.lookupProduct(url);
      onProductFound(product);
      toast.success(MESSAGES.PRODUCT_FOUND);
      setUrl("");
    } catch (error) {
      toast.error(error?.response?.data?.detail || MESSAGES.PRODUCT_NOT_FOUND);
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
        <Button onClick={handleSearch} disabled={loading} className="h-12 px-8">
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
}
