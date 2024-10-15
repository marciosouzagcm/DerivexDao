import React from "react"; // Use 'import' em vez de 'importar'
import ReactDOM from "react-dom/client"; // Use 'import' em vez de 'importar'
import App from "./App"; // Certifique-se de que App.tsx existe

const rootElement = document.getElementById("root"); // Use 'root' em vez de 'raiz'
if (!rootElement) {
  throw new Error("O elemento root não foi encontrado.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
