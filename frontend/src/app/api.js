import { getApiBaseUrl } from "./config.js";

async function request(path, options = {}) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  let data = null;
  if (text) {
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
  }

  if (!res.ok) {
    const message = data?.detail || (text && text.slice(0, 200)) || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data ?? (text ? { raw: text } : null);
}

export const api = {
  dashboard: (threshold) => request(`/dashboard?low_stock_threshold=${threshold ?? 5}`),

  listProducts: () => request("/products"),
  createProduct: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  listCustomers: () => request("/customers"),
  createCustomer: (payload) => request("/customers", { method: "POST", body: JSON.stringify(payload) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),

  listOrders: () => request("/orders"),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" })
};
