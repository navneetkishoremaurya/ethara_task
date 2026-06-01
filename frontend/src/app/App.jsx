import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import CustomersPage from "../pages/CustomersPage.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import OrderDetailsPage from "../pages/OrderDetailsPage.jsx";

function Tab({ to, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `tab${isActive ? " active" : ""}`}>
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <div>
      <div className="nav">
        <div className="nav-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-text">
              <div className="brand-title">Ethara Inventory</div>
              <div className="brand-sub">Inventory & Orders</div>
            </div>
          </div>
          <div className="tabs">
            <Tab to="/" label="Dashboard" />
            <Tab to="/products" label="Products" />
            <Tab to="/customers" label="Customers" />
            <Tab to="/orders" label="Orders" />
          </div>
        </div>
      </div>

      <div className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
        </Routes>
      </div>
    </div>
  );
}
