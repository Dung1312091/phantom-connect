/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Buffer } from "buffer";

import "./index.css";
(globalThis as any).Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
