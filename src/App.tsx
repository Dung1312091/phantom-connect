/* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { useEffect, useState } from "react";
import nacl from "tweetnacl";

const DappConnect = () => {
  useEffect(() => {
    console.log(
      "----------------------------------------------------------------"
    );
    console.log("start app", (window as any)?.Telegram);
  }, []);
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const buildUrl = (path: string, params: URLSearchParams) =>
    `https://phantom.app/ul/v1/${path}?${params.toString()}`;
  const onConnect = () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "mainnet-beta",
      app_url: "https://phantom.app",
      redirect_link: " https://t.me/mpc_wallet_connect_bot/tobi_wallet",
    });
    const url = buildUrl("connect", params);
    console.log("url", url);
    window.open(url);
  };
  return <button onClick={() => onConnect()}>Connect Phantom Wallet</button>;
};

const App = () => {
  return <DappConnect />;
};
export default App;
