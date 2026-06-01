import React, { useEffect, useMemo, useState } from "react";
import Toast from "../components/Toast.jsx";
import { api } from "../app/api.js";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [threshold, setThreshold] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    setError("");
    setOk("");
    try {
      const n = threshold === "" ? 5 : Number(threshold);
      const res = await api.dashboard(Number.isFinite(n) ? n : 5);
      setData(res);
      setOk("Loaded dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Total products", value: data.total_products },
      { label: "Total customers", value: data.total_customers },
      { label: "Total orders", value: data.total_orders }
    ];
  }, [data]);

  return (
    <div className="grid two">
      <div className="hero card">
        <div className="hero-inner">
          <div>
            <div className="hero-kicker">Ethara Inventory Assignment</div>
            <h1 className="hero-title">Manage products, customers, and orders — fast.</h1>
            <div className="hero-sub">
              Built for clean workflows: inventory validation, automatic stock reduction, and backend-calculated totals.
            </div>
            <div className="hero-actions">
              <a className="btn primary" href="/products">
                Add products
              </a>
              <a className="btn" href="/orders">
                Create an order
              </a>
            </div>
          </div>

          <div className="hero-stats">
            <div className="mini">
              <div className="mini-label">Products</div>
              <div className="mini-value">{data?.total_products ?? "—"}</div>
            </div>
            <div className="mini">
              <div className="mini-label">Customers</div>
              <div className="mini-value">{data?.total_customers ?? "—"}</div>
            </div>
            <div className="mini">
              <div className="mini-label">Orders</div>
              <div className="mini-value">{data?.total_orders ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Overview</h2>
        <div className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
          Quick snapshot of products, customers, and orders.
        </div>
        <div className="grid four">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value ?? "—"}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }} className="row">
          <div className="field" style={{ maxWidth: 220 }}>
            <label>Low stock threshold</label>
            <input
              type="number"
              min="0"
              placeholder="5"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button className="primary" onClick={load}>
              Refresh
            </button>
          </div>
        </div>
        <Toast kind="ok" message={ok} />
        <Toast kind="error" message={error} />
      </div>

      <div className="card">
        <h2>Low Stock Products</h2>
        {!data ? (
          <div className="muted">Loading…</div>
        ) : data.low_stock_products.length === 0 ? (
          <div className="muted">No low-stock products.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{p.sku}</td>
                  <td>
                    <span className={`pill ${p.quantity_in_stock === 0 ? "bad" : "warn"}`}>
                      {p.quantity_in_stock}
                    </span>
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
