/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { Buffer } from "buffer";
import { useState } from "react";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
const NETWORK = clusterApiUrl("mainnet-beta");

const DATA =
  "phantom_encryption_public_key=64zdmwm7wDiz1HJjxkv67rqPvxJcA9xiX5jSJDM333b5&nonce=3nJ9Q25JHrCigaGBV28yPXhbzzVnhyS7c&data=ukMfUa7ghAUqzopNqpNkb1obw9npq5xh2L95Lw5g7kUNbRoCSvpQLd9MLvPoKEEWgVANZE9gVghpvG7VVJcKLd7BPEw5vTomabWn38g2bHY8QhxGR7SaL2e2HrdM9jxJe4TnHEdLuCiC1gBjUEDkXb1zSkKwEYV4hqbM66Cknby2ejb5Luh3Rt2ng1QupWW8CRDpxaGboPRZoCMDs71A3xSozn41aoD8eKWFPkXKHX7dZdq7mrUNDeC73PFhouch7CixabQTTaAaSSGS5XygMnfJVtYXWMv53c1Nn17mpdR4g3m9KqXh6w6SaCcdH8fhDszN8F8p86geFAVvqVwgzrEqjjxbqwSntqMkPyfuaC3K3a31XwAuo33ghdZBKPZsCoNkBfm35W2fekBbP6iFyTuWjEipgS6gwi3cx5Xo5kpnzv";

function initKeyPairs(): nacl.BoxKeyPair {
  const storedPublicKeyBase64 = localStorage.getItem("publicKey");
  const storedSecretKeyBase64 = localStorage.getItem("secretKey");
  if (storedPublicKeyBase64 && storedSecretKeyBase64) {
    const storedPublicKey = decodeBase64(storedPublicKeyBase64);
    const storedSecretKey = decodeBase64(storedSecretKeyBase64);
    // Kiểm tra khóa đã lấy có khớp với khóa ban đầu hay không

    return {
      publicKey: storedPublicKey,
      secretKey: storedSecretKey,
    };
  }

  const keypair = nacl.box.keyPair();

  const publicKeyBase64 = encodeBase64(keypair.publicKey);
  const secretKeyBase64 = encodeBase64(keypair.secretKey);
  localStorage.setItem("publicKey", publicKeyBase64);
  localStorage.setItem("secretKey", secretKeyBase64);

  const vstoredPublicKeyBase64 = localStorage.getItem("publicKey");
  const vstoredSecretKeyBase64 = localStorage.getItem("secretKey");

  const storedPublicKey = decodeBase64(vstoredPublicKeyBase64!);
  const storedSecretKey = decodeBase64(vstoredSecretKeyBase64!);

  console.log("-----1", nacl.verify(storedPublicKey, keypair.publicKey)); // true
  console.log("-----2", nacl.verify(storedSecretKey, keypair.secretKey)); // true
  return keypair;
}
const KEYS = {
  PHANTOM_PUBLIC_KEY: "PHANTOM_PUBLIC_KEY",
  PHANTOM_CONNECT_SECCTION: "PHANTOM_CONNECT_SECCTION",
};
const storages = {
  setPhanTomPublicKey: (v: string) => {
    localStorage.setItem(KEYS.PHANTOM_PUBLIC_KEY, v);
  },
  getPhanTomPublicKey: () => {
    const key = localStorage.getItem(KEYS.PHANTOM_PUBLIC_KEY);
    if (!key) return null;
    return new PublicKey(key!);
  },
  setSession: (v: string) => {
    return localStorage.setItem(KEYS.PHANTOM_CONNECT_SECCTION, v);
  },
  getSession: () => {
    return localStorage.getItem(KEYS.PHANTOM_CONNECT_SECCTION);
  },
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
  console.log("🚀 ~ DappConnect ~ decryptedData:", decryptedData);
  if (!decryptedData) {
    throw new Error("Unable to decrypt data");
  }
  return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};

const encryptPayload = (payload: any, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  return [nonce, encryptedPayload];
};

const DappConnect = () => {
  const connection = new Connection(NETWORK);
  const [dappKeyPair] = useState(() => initKeyPairs());
  const [session, setSession] = useState(() => storages.getSession());
  const [phantomPublicKey, setPhantomPublicKey] = useState(() =>
    storages.getPhanTomPublicKey()
  );
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();

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
  const createTransferTransaction = async () => {
    if (!phantomPublicKey) throw new Error("missing public key from user");
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: phantomPublicKey,
        toPubkey: new PublicKey("9JMKSAKuz6amkRXnYdGj8AnpJGCrtVcPQSSkcYWcnDUd"),
        lamports: 100,
      })
    );
    transaction.feePayer = phantomPublicKey;
    const anyTransaction: any = transaction;
    anyTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    return transaction;
  };
  const signAndSendTransaction = async () => {
    const transaction = await createTransferTransaction();

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: "https://www.google.com.vn",
      payload: bs58.encode(encryptedPayload),
    });

    const url = buildUrl("signAndSendTransaction", params);
    window.open(url);
  };

  const onPaseConnectData = () => {
    const params = new URLSearchParams(DATA);
    const phantom_encryption_public_key = params.get(
      "phantom_encryption_public_key"
    );
    console.log(
      "🚀 ~ onPaseConnectData ~ phantom_encryption_public_key:",
      phantom_encryption_public_key
    );
    const nonce = params.get("nonce");
    const data = params.get("data");
    const sharedSecretDapp = nacl.box.before(
      bs58.decode(phantom_encryption_public_key!),
      dappKeyPair.secretKey
    );

    const connectData = decryptPayload(data!, nonce!, sharedSecretDapp);

    setSharedSecret(sharedSecretDapp);
    setSession(connectData.session);
    const PhantomPublicKey = new PublicKey(connectData.public_key);
    setPhantomPublicKey(PhantomPublicKey);

    console.log("🚀 ~ onPaseConnectData ~ connectData:", connectData);
    storages.setSession(connectData.session);
    storages.setPhanTomPublicKey(connectData.public_key);
  };

  return (
    <div>
      <button onClick={() => onConnect()}>Connect Phantom Wallet 1</button>
      <button onClick={() => signAndSendTransaction()}>Deposit Ton</button>
      <button onClick={() => onPaseConnectData()}>Parse</button>
    </div>
  );
};

const App = () => {
  return <DappConnect />;
};
export default App;
