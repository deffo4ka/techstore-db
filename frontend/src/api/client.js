import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export async function getProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function getProductSales(productId) {
  const { data } = await api.get(`/products/${productId}/sales`);
  return data;
}

export async function processPurchase(payload) {
  const { data } = await api.post('/purchase', payload);
  return data;
}

export async function getCheaperThanAvg() {
  const { data } = await api.get('/stats/cheaper-than-avg');
  return data;
}

export async function getMaxCheckByBrand(brandName) {
  const { data } = await api.get(
    `/stats/max-check/${encodeURIComponent(brandName)}`
  );
  return data;
}

export function getErrorMessage(err, fallback = 'Something went wrong') {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.details ||
    err?.message ||
    fallback
  );
}

export default api;
