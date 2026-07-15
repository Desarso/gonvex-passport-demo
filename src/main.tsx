import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GonvexClient } from "../gonvex/_generated/client";
import { GonvexAuthProvider } from "../gonvex/auth";
import App from "./App";
import "./styles.css";

const gonvexURL = import.meta.env.VITE_GONVEX_WS_URL ?? "ws://localhost:8080/ws";
const gonvex = new GonvexClient(gonvexURL);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GonvexAuthProvider client={gonvex}>
      <App runtimeURL={gonvexURL} />
    </GonvexAuthProvider>
  </StrictMode>,
);
