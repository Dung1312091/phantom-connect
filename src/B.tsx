/* eslint-disable @typescript-eslint/no-explicit-any */
import { channel } from "./broadcastChannel";
export const B = () => {
  return (
    <div>
      <p>B component</p>
      <button
        onClick={() => {
          channel.postMessage("Hello from Component B!");
        }}
      >
        Send event
      </button>
    </div>
  );
};
