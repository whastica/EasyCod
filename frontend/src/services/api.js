import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

const client = axios.create({ baseURL: API_BASE });

export async function lookupProduct(url) {
  const resp = await client.post(`/amazon/lookup`, { url });
  return resp.data;
}

export async function getProduct(asin) {
  const resp = await client.get(`/products/${asin}`);
  return resp.data;
}

export async function updateCart(items) {
  const resp = await client.post(`/cart`, { items });
  return resp.data;
}

export async function placeOrder(orderData) {
  const resp = await client.post(`/orders`, orderData);
  return resp.data;
}

export default client;
