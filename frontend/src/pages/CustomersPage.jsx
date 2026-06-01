import React, { useEffect, useMemo, useState } from "react";
import Toast from "../components/Toast.jsx";
import { api } from "../app/api.js";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    setOk("");
    try {
      setCustomers(await api.listCustomers());
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
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim()
    };
    if (!payload.full_name) return setError("Full name is required");
    if (!payload.email.includes("@")) return setError("Valid email is required");
    if (payload.phone.length < 3) return setError("Phone is required");

    try {
      await api.createCustomer(payload);
      setOk("Customer created");
      setForm({ full_name: "", email: "", phone: "" });
      await load();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this customer?")) return;
    setError("");
    setOk("");
    try {
      await api.deleteCustomer(id);
      setOk("Customer deleted");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const sorted = useMemo(() => [...customers].sort((a, b) => b.id - a.id), [customers]);

  return (
    <div className="grid two">
      <div className="card">
        <h2>Add Customer</h2>
        <div className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
          Emails are unique and validated by the backend.
        </div>
        <form onSubmit={submit}>
          <div className="form-grid two">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Full name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="form-actions">
            <button className="primary" type="submit">
              Create customer
            </button>
          </div>
        </form>
        <Toast kind="ok" message={ok} />
        <Toast kind="error" message={error} />
      </div>

      <div className="card">
        <h2>Customers</h2>
        {loading ? (
          <div className="muted">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="muted">No customers yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td className="muted">{c.email}</td>
                  <td className="muted">{c.phone}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="danger" onClick={() => del(c.id)}>
                      Delete
                    </button>
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
