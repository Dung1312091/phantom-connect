/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { Buffer } from "buffer";
import { useState } from "react";
import nacl from "tweetnacl";
const DATA =
  "phantom_encryption_public_key=6uB6ETL7Une1w3qKmEgFaNUhpzwh3NFspStVNQ7EKVom&nonce=NASDKXnjwVEZPkABDBsjrK3wBK6Y3nk8d&data=6AwEGT3zCQ72DHRXmxVpNrThANwu6MjJ4iWYA3Lv5ovKXkAuPEquHBbrYuFRKFcFQbsa6ALjsLoEccjzz8ZkCFFm26W9VtjHQXDPx2yB5Y2Fz8prMApkBDLfBXNCZFqkWwywJLhue58jJzeLCubm6ywDoDoXmjVMy8CwwCgsoDYejz6XXKuVmJzDxFGppmgMA9avcTn8cqizDi2CE6PGrier89b3HxbpyeHZUunPJqPpnCZwZ3BgMZG6kDpGtyWpxvzDDef5bV2dx4RjngoacEe2WXAC2LBvc7LzbFdduF7HGHTE5rpxWHofVfhQN5pszCktEqRbk8JuW2D8X3TxrPibywTa6T358WBJRH8kNisq9zfam8VHECceTUwCJgLCh2foaEo8TmjNdb3KfXSkSjRK8ZSvkFk9KAtXpswmHykBnaez&gfe_rd=mr&pli=1";
export const decodeBase64 = (b64: string) =>
  Uint8Array.from(atob(b64), (b) => b.charCodeAt(0));
export const encodeBase64 = (b: any) =>
  btoa(String.fromCodePoint.apply(null, b));

const KeyPair = {
  publicKey: "56os8hxWZGxbGIRqVOp8qUIoy+cdSrJLFjRer97sOmM=",
  secretKey: "nYnYQERbZQkKdKpiyRTcVIIoMsr1GNHUkqGvPnNCkwc=",
};

const DappConnect = () => {
  const [dappKeyPair] = useState({
    publicKey: decodeBase64(KeyPair.publicKey),
    secretKey: decodeBase64(KeyPair.secretKey),
  });

  const buildUrl = (path: string, params: URLSearchParams) =>
    `https://phantom.app/ul/v1/${path}?${params.toString()}`;
  const onConnect = () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "mainnet-beta",
      app_url: "https://phantom.app",
      redirect_link: "https://www.google.com.vn",
    });
    const url = buildUrl("connect", params);
    console.log("url", url);
    window.open(url);
  };
  const decryptPayload = (
    data: string,
    nonce: string,
    sharedSecret?: Uint8Array
  ) => {
    if (!sharedSecret) throw new Error("missing shared secret");

    const decryptedData = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      sharedSecret
    );
    if (!decryptedData) {
      throw new Error("Unable to decrypt data");
    }
    return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
  };
  const onTransfer = () => {
    const params = new URLSearchParams(DATA);
    console.log("🚀 ~ onTransfer ~ params:", params);
    const phantom_encryption_public_key = params.get(
      "phantom_encryption_public_key"
    );
    const nonce = params.get("nonce");
    const data = params.get("data");
    const public_key = params.get("public_key");
    const session = params.get("session");
    console.log(
      "🚀 ~ onTransfer ~ phantom_encryption_public_key:",
      { phantom_encryption_public_key },
      { nonce },
      { data },
      { public_key },
      { session }
    );
    const sharedSecretDapp = nacl.box.before(
      bs58.decode(params.get("phantom_encryption_public_key")!),
      dappKeyPair.secretKey
    );
    const connectData = decryptPayload(
      params.get("data")!,
      params.get("nonce")!,
      sharedSecretDapp
    );
    console.log("🚀 ~ onTransfer ~ connectData:", connectData);
  };

  return (
    <div>
      <button onClick={() => onConnect()}>Connect Phantom Wallet 1</button>
      <button onClick={() => onTransfer()}>Deposit Ton</button>
    </div>
  );
};

const App = () => {
  return <DappConnect />;
};
export default App;
