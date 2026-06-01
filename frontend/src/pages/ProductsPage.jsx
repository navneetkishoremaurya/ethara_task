import React, { useEffect, useMemo, useState } from "react";
import Toast from "../components/Toast.jsx";
import { api } from "../app/api.js";

function StockPill({ qty }) {
  const cls = qty === 0 ? "bad" : qty <= 5 ? "warn" : "ok";
  return <span className={`pill ${cls}`}>{qty}</span>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({ name: "", sku: "", price: "", quantity_in_stock: 0 });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    setOk("");
    try {
      setProducts(await api.listProducts());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock)
    };
    if (!payload.name || !payload.sku) return setError("Name and SKU are required");
    if (!Number.isFinite(payload.price) || payload.price <= 0) return setError("Price must be > 0");
    if (!Number.isInteger(payload.quantity_in_stock) || payload.quantity_in_stock < 0)
      return setError("Quantity must be a non-negative integer");

    try {
      if (editId) {
        await api.updateProduct(editId, {
          name: payload.name,
          price: payload.price,
          quantity_in_stock: payload.quantity_in_stock
        });
        setOk("Product updated");
      } else {
        await api.createProduct(payload);
        setOk("Product created");
      }
      setForm({ name: "", sku: "", price: "", quantity_in_stock: 0 });
      setEditId(null);
      await load();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, sku: p.sku, price: String(p.price), quantity_in_stock: p.quantity_in_stock });
    setOk("");
    setError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", sku: "", price: "", quantity_in_stock: 0 });
  };

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    setError("");
    setOk("");
    try {
      await api.deleteProduct(id);
      setOk("Product deleted");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => b.id - a.id);
  }, [products]);

  return (
    <div className="grid two">
      <div className="card">
        <h2>{editId ? `Edit Product #${editId}` : "Add Product"}</h2>
        <div className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
          Create products with unique SKUs. Stock is reduced automatically when orders are placed.
        </div>
        <form onSubmit={submit}>
          <div className="form-grid two">
            <div className="field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>SKU</label>
              <input
                value={form.sku}
                disabled={!!editId}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Price</label>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Quantity</label>
              <input
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="primary" type="submit">
              {editId ? "Save changes" : "Create product"}
            </button>
            {editId ? (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            ) : (
              <span className="muted" style={{ fontSize: 12 }}>
                Tip: keep SKU short and unique
              </span>
            )}
          </div>
        </form>
        <Toast kind="ok" message={ok} />
        <Toast kind="error" message={error} />
      </div>

      <div className="card">
        <h2>Products</h2>
        {loading ? (
          <div className="muted">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="muted">No products yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{p.sku}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <StockPill qty={p.quantity_in_stock} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <button onClick={() => startEdit(p)}>Edit</button>
                      <button className="danger" onClick={() => del(p.id)}>
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
