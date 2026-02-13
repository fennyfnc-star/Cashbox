import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PrimeReactProvider } from "primereact/api";
// PrimeReactContext

const rootEl = document.getElementById("react-root");

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </StrictMode>,
  );
}
