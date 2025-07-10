import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // ← this line brings in your Tailwind build

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* BrowserRouter must sit *inside* ReactDOM.render and wrap App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
