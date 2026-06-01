import React from "react";

export default function Toast({ kind, message }) {
  if (!message) return null;
  return <div className={`toast ${kind === "error" ? "err" : "ok"}`}>{message}</div>;
}

