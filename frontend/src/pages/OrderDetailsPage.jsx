import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../components/Toast.jsx";
import { api } from "../app/api.js";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const [o, p] = await Promise.all([api.getOrder(id), api.listProducts()]);
        setOrder(o);
        setProducts(p);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  return (
    <div className="card">
      <h2>Order Details</h2>
      <div className="muted" style={{ marginBottom: 10 }}>
        <Link to="/orders">← Back to orders</Link>
      </div>
      <Toast kind="error" message={error} />
      {!order ? (
        <div className="muted">Loading…</div>
      ) : (
        <div className="grid two">
          <div className="card">
            <h2>Summary</h2>
            <div className="row">
              <span className="pill ok">Order #{order.id}</span>
              <span className="pill">Customer #{order.customer_id}</span>
              <span className="pill">Total ${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
          <div className="card">
            <h2>Items</h2>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Line</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => {
                  const p = productById.get(it.product_id);
                  return (
                    <tr key={it.id}>
                      <td>
                        <div>{p?.name ?? `Product #${it.product_id}`}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {p?.sku ?? ""}
                        </div>
                      </td>
                      <td className="muted">{it.quantity}</td>
                      <td>${Number(it.unit_price).toFixed(2)}</td>
                      <td>${Number(it.line_total).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

