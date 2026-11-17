import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import "./i18n";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import theme from "./app/MaterialTheme";
import ContextProvider from "./app/context/ContextProvider";
import { SocketProvider } from "./app/context/SocketContext";
import { ThemeModeProvider } from "./app/context/ThemeContext";
import { CartProvider } from "./app/context/CartContext";
import { ErrorBoundary } from "./app/ErrorBoundary";
import "./css/index.css";
import "./css/tokens.css";
import "./css/components.css";
import "./css/shell.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
      <ContextProvider>
        <ThemeModeProvider>
          <CartProvider>
            <SocketProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                  <ErrorBoundary>
                    <App />
                  </ErrorBoundary>
                </Router>
              </ThemeProvider>
            </SocketProvider>
          </CartProvider>
        </ThemeModeProvider>
      </ContextProvider>
  </React.StrictMode>
);

reportWebVitals();
