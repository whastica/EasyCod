import { useState } from "react";
import * as api from "../services/api";
import { toast } from "sonner";
import { MESSAGES } from "../constants/messages";

export default function useNavigation() {
  const [currentView, setCurrentView] = useState("search");
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleProductFound = (product) => {
    setSearchedProduct(product);
    setCurrentView("product");
  };

  const handleSampleProduct = async (asin) => {
    try {
      const product = await api.getProduct(asin);
      handleProductFound(product);
      toast.success(MESSAGES.SAMPLE_LOAD_SUCCESS);
    } catch (err) {
      toast.error(MESSAGES.SAMPLE_LOAD_FAIL);
    }
  };

  const backToHome = () => {
    setCurrentView("search");
    setSearchedProduct(null);
    setCompletedOrder(null);
  };

  return {
    currentView,
    setCurrentView,
    searchedProduct,
    handleProductFound,
    handleSampleProduct,
    completedOrder,
    setCompletedOrder,
    backToHome,
  };
}
