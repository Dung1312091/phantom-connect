import { useEffect, useState } from "react";
import { channel } from "./broadcastChannel";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const A = () => {
  const [receivedMessage, setReceivedMessage] = useState("");

  useEffect(() => {
    channel.onmessage = (event) => {
      setReceivedMessage(event.data);
    };

    return () => {
      channel.close();
    };
  }, []);
  return (
    <div>
      <p>A component: {receivedMessage}</p>
      <button
        onClick={() => {
          (window as any).Telegram.WebApp.openTelegramLink(
            "https://t.me/mpc_wallet_connect_bot/tobi_wallet"
          );
        }}
      >
        Open New App
      </button>
    </div>
  );
};
