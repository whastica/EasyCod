import requests
import sys
import json
from datetime import datetime

class AmazonCODAPITester:
    def __init__(self, base_url="https://easy-cod.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({"name": name, "success": success, "details": details})
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Message: {data.get('message', 'N/A')}"
            return self.log_test("API Root", success, details)
        except Exception as e:
            return self.log_test("API Root", False, f"Error: {str(e)}")

    def test_product_lookup_by_asin(self):
        """Test product lookup by ASIN"""
        test_asin = "B08N5WRWNW"  # Echo Dot
        try:
            response = requests.post(
                f"{self.api_url}/amazon/lookup",
                json={"asin": test_asin},
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                # Verify required fields
                required_fields = ["asin", "title", "amazon_price", "cod_price", "commission", "handling_fee"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details += f" | Missing fields: {missing_fields}"
                else:
                    # Verify pricing calculation
                    expected_commission = round(data["amazon_price"] * 0.10, 2)
                    expected_handling = 5.00
                    expected_cod = round(data["amazon_price"] + expected_commission + expected_handling, 2)
                    
                    pricing_correct = (
                        abs(data["commission"] - expected_commission) < 0.01 and
                        abs(data["handling_fee"] - expected_handling) < 0.01 and
                        abs(data["cod_price"] - expected_cod) < 0.01
                    )
                    
                    if pricing_correct:
                        details += f" | Title: {data['title'][:30]}... | COD: ${data['cod_price']}"
                    else:
                        success = False
                        details += f" | Pricing calculation error"
            
            return self.log_test("Product Lookup by ASIN", success, details)
        except Exception as e:
            return self.log_test("Product Lookup by ASIN", False, f"Error: {str(e)}")

    def test_product_lookup_by_url(self):
        """Test product lookup by Amazon URL"""
        test_url = "https://www.amazon.com/dp/B0C1SLD1PZ"  # AirPods Pro
        try:
            response = requests.post(
                f"{self.api_url}/amazon/lookup",
                json={"url": test_url},
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f" | ASIN: {data.get('asin', 'N/A')} | Title: {data.get('title', 'N/A')[:30]}..."
            
            return self.log_test("Product Lookup by URL", success, details)
        except Exception as e:
            return self.log_test("Product Lookup by URL", False, f"Error: {str(e)}")

    def test_get_product_direct(self):
        """Test direct product retrieval"""
        test_asin = "B0BDJ6M6JZ"  # Kindle
        try:
            response = requests.get(f"{self.api_url}/products/{test_asin}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f" | Title: {data.get('title', 'N/A')[:30]}..."
            
            return self.log_test("Direct Product Retrieval", success, details)
        except Exception as e:
            return self.log_test("Direct Product Retrieval", False, f"Error: {str(e)}")

    def test_cart_calculation(self):
        """Test cart calculation with multiple items"""
        cart_data = {
            "items": [
                {"asin": "B08N5WRWNW", "quantity": 2},  # Echo Dot x2
                {"asin": "B0C1SLD1PZ", "quantity": 1}   # AirPods Pro x1
            ]
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/cart",
                json=cart_data,
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                # Verify cart structure
                required_fields = ["items", "subtotal", "total_commission", "total_handling", "total_cod_price"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details += f" | Missing fields: {missing_fields}"
                else:
                    details += f" | Items: {len(data['items'])} | Total COD: ${data['total_cod_price']}"
                    
                    # Verify calculation logic
                    if len(data['items']) == 2:
                        # Check if quantities are correct
                        quantities = [item['quantity'] for item in data['items']]
                        if 2 in quantities and 1 in quantities:
                            details += " | Quantities correct"
                        else:
                            success = False
                            details += " | Quantity mismatch"
            
            return self.log_test("Cart Calculation", success, details)
        except Exception as e:
            return self.log_test("Cart Calculation", False, f"Error: {str(e)}")

    def test_order_creation(self):
        """Test order creation"""
        # First get cart data
        cart_data = {
            "items": [
                {"asin": "B08N5WRWNW", "quantity": 1}
            ]
        }
        
        try:
            # Get cart calculation
            cart_response = requests.post(f"{self.api_url}/cart", json=cart_data, timeout=10)
            if cart_response.status_code != 200:
                return self.log_test("Order Creation", False, "Failed to get cart data")
            
            cart = cart_response.json()
            
            # Create order
            order_data = {
                "cart": cart,
                "shipping": {
                    "full_name": "Test User",
                    "phone": "+1234567890",
                    "address_line1": "123 Test Street",
                    "city": "Test City",
                    "state": "TS",
                    "postal_code": "12345",
                    "country": "US"
                },
                "payment_method": "COD"
            }
            
            response = requests.post(
                f"{self.api_url}/orders",
                json=order_data,
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                order_id = data.get('id')
                if order_id:
                    details += f" | Order ID: {order_id[:8]}... | Status: {data.get('status', 'N/A')}"
                    # Store order ID for later tests
                    self.test_order_id = order_id
                else:
                    success = False
                    details += " | No order ID returned"
            
            return self.log_test("Order Creation", success, details)
        except Exception as e:
            return self.log_test("Order Creation", False, f"Error: {str(e)}")

    def test_order_retrieval(self):
        """Test order retrieval by ID"""
        if not hasattr(self, 'test_order_id'):
            return self.log_test("Order Retrieval", False, "No test order ID available")
        
        try:
            response = requests.get(f"{self.api_url}/orders/{self.test_order_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f" | Order ID: {data.get('id', 'N/A')[:8]}... | Status: {data.get('status', 'N/A')}"
            
            return self.log_test("Order Retrieval", success, details)
        except Exception as e:
            return self.log_test("Order Retrieval", False, f"Error: {str(e)}")

    def test_invalid_asin(self):
        """Test handling of invalid ASIN"""
        try:
            response = requests.post(
                f"{self.api_url}/amazon/lookup",
                json={"asin": "INVALID123"},
                timeout=10
            )
            success = response.status_code == 404  # Should return 404 for invalid ASIN
            details = f"Status: {response.status_code} (Expected 404)"
            
            return self.log_test("Invalid ASIN Handling", success, details)
        except Exception as e:
            return self.log_test("Invalid ASIN Handling", False, f"Error: {str(e)}")

    def test_all_sample_products(self):
        """Test all sample products mentioned in the app"""
        sample_asins = ["B08N5WRWNW", "B0C1SLD1PZ", "B0BDJ6M6JZ", "B0B2XZSTZ8", "B09G9FPHY6"]
        all_success = True
        
        for asin in sample_asins:
            try:
                response = requests.get(f"{self.api_url}/products/{asin}", timeout=10)
                success = response.status_code == 200
                if not success:
                    all_success = False
                    print(f"  ❌ {asin}: Status {response.status_code}")
                else:
                    data = response.json()
                    print(f"  ✅ {asin}: {data.get('title', 'N/A')[:40]}...")
            except Exception as e:
                all_success = False
                print(f"  ❌ {asin}: Error {str(e)}")
        
        return self.log_test("All Sample Products", all_success, f"Tested {len(sample_asins)} products")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Amazon COD Backend API Tests")
        print("=" * 60)
        
        # Run all tests
        self.test_api_root()
        self.test_product_lookup_by_asin()
        self.test_product_lookup_by_url()
        self.test_get_product_direct()
        self.test_cart_calculation()
        self.test_order_creation()
        self.test_order_retrieval()
        self.test_invalid_asin()
        self.test_all_sample_products()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return 0
        else:
            print("⚠️  Some backend tests failed. Check the details above.")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed Tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
            return 1

def main():
    tester = AmazonCODAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())