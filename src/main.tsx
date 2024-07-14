/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Buffer } from "buffer";
import { ErrorBoundary } from "react-error-boundary";

export const Fallback = ({ error }: any) => {
  return (
    <div>
      <h4>somethingWentWrong</h4>
      <p>{error?.message}</p>
    </div>
  );
};

import "./index.css";
(globalThis as any).Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary FallbackComponent={Fallback}>
    <App />
  </ErrorBoundary>
);
