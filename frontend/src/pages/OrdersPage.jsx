import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast.jsx";
import { api } from "../app/api.js";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);

  const load = async () => {
    setLoading(true);
    setError("");
    setOk("");
    try {
      const [o, p, c] = await Promise.all([api.listOrders(), api.listProducts(), api.listCustomers()]);
      setOrders(o);
      setProducts(p);
      setCustomers(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addLine = () => setLines([...lines, { product_id: "", quantity: 1 }]);
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  const updateLine = (idx, patch) => {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const cid = Number(customerId);
    if (!cid) return setError("Customer is required");

    const items = lines
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }))
      .filter((i) => i.product_id && i.quantity);
    if (items.length === 0) return setError("At least one order item is required");
    for (const it of items) {
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) return setError("Quantities must be positive integers");
    }

    try {
      const created = await api.createOrder({ customer_id: cid, items });
      setOk(`Order #${created.id} created`);
      setCustomerId("");
      setLines([{ product_id: "", quantity: 1 }]);
      await load();
      navigate(`/orders/${created.id}`);
    } catch (e2) {
      setError(e2.message);
    }
  };

  const del = async (id) => {
    if (!confirm("Cancel/Delete this order?")) return;
    setError("");
    setOk("");
    try {
      await api.deleteOrder(id);
      setOk("Order deleted");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const sorted = useMemo(() => [...orders].sort((a, b) => b.id - a.id), [orders]);

  return (
    <div className="grid two">
      <div className="card">
        <h2>Create Order</h2>
        <div className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
          Totals are calculated by the backend. Orders are blocked if inventory is insufficient.
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
              Items
            </div>
            {lines.map((l, idx) => (
              <div key={idx} className="card" style={{ padding: 12, marginBottom: 10 }}>
                <div className="form-grid two">
                  <div className="field">
                    <label>Product</label>
                    <select value={l.product_id} onChange={(e) => updateLine(idx, { product_id: e.target.value })}>
                      <option value="">Select…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.sku} (stock {p.quantity_in_stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={l.quantity}
                      onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Line {idx + 1}
                  </span>
                  <button
                    type="button"
                    className="danger"
                    disabled={lines.length === 1}
                    onClick={() => removeLine(idx)}
                  >
                    Remove item
                  </button>
                </div>
              </div>
            ))}
            <div className="form-actions">
              <button type="button" onClick={addLine}>
                Add another item
              </button>
              <button className="primary" type="submit">
                Create order
              </button>
            </div>
          </div>
        </form>
        <Toast kind="ok" message={ok} />
        <Toast kind="error" message={error} />
      </div>

      <div className="card">
        <h2>Orders</h2>
        {loading ? (
          <div className="muted">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="muted">No orders yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Items</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/orders/${o.id}`}>#{o.id}</Link>
                  </td>
                  <td className="muted">Customer #{o.customer_id}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td className="muted">{o.items?.length ?? 0}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <Link to={`/orders/${o.id}`}>
                        <button>View</button>
                      </Link>
                      <button className="danger" onClick={() => del(o.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
