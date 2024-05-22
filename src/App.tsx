/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { Buffer } from "buffer";
import { useState } from "react";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  createTransferInstruction,
  // TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  // createAssociatedTokenAccountInstruction,
  // ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
const NETWORK =
  "https://broken-late-panorama.solana-mainnet.quiknode.pro/71a6fb542d7d3e0ae842f5804546b1ddeb0cbb70";

const DATA =
  "phantom_encryption_public_key=ArLe9x4enicNfP9ywnJxyDBZKMBvYg9H5ZShsWrxWoff&nonce=CrAgCDx8QcEQU9nz4Jtyu99N537Ch73St&data=8VNf5dZ92vuwmw52cSpXxrTxUMR15cX6hco2a4GaeAzgduu4Aygi1bmAioj9MoFvNa6uCcoRD4zEbTtpMzgVpeFCpNiu9qWTQzuQXcd48K5wLNDJQs8TjVbAZ6aB995vhD2rGmwuUwJSDZTyHzWbzsXB7nsQGpNyY7JXLC4GfWdSRQ2z7SfdEdMmhSQu1mPd5FjwuEdvnoPrbVt4rkx6yX458kzdfjyv2bMLnEBeXm2N5i2MZxvhSfvY8ErAfnDVDjx7YxwnwsQw3C1ho2vN2dapUamnNPaxycrcKQatzbFr7V9GMGZvAWVws5r521pCXhzX4XoYeHF9oB2XtxMgRuZ5JAeDeZwbw9bK8VuyCDscTYL92VEV1CqwcJG9gcztYmVoLf9D4ZtBmtrNDFLpEbt3AtR6YMxH6f27jPbu49FoZmCc";

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

  function openWalletWithDeepLink(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_self";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const onConnect = () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "mainnet-beta",
      app_url: "https://phantom.app",
      redirect_link: "https://www.google.com.vn",
    });
    const url = buildUrl("connect", params);
    console.log("url", url);
    // window.open(url);
    openWalletWithDeepLink(url);
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

  async function buildSLPTransaction({
    tokenAddress,
  }: {
    tokenAddress: string;
  }) {
    const tokenMint = new PublicKey(tokenAddress);
    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      phantomPublicKey!
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      new PublicKey("9JMKSAKuz6amkRXnYdGj8AnpJGCrtVcPQSSkcYWcnDUd")
    );
    // const isTokenAccountAlreadyMade = await checkIfTokenAccountExists(connection, toTokenAccount);
    const transferTransaction = new Transaction();
    // if (!isTokenAccountAlreadyMade) {
    //   const createAccountInstruction = createAssociatedTokenAccountInstruction(
    //     fromPubKey,
    //     toTokenAccount,
    //     new PublicKey(sendData.to),
    //     tokenMint,
    //     TOKEN_PROGRAM_ID,
    //     ASSOCIATED_TOKEN_PROGRAM_ID,
    //   );
    //   transferTransaction.add(createAccountInstruction);
    // }
    // const amountTransfer = getSolCoinTransferBalance(sendData.amount, sendData.token.decimals);
    const transferInstruction = await createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      phantomPublicKey!,
      100n
    );

    transferTransaction.add(transferInstruction);
    transferTransaction.feePayer = phantomPublicKey!;
    const anyTransaction: any = transferTransaction;
    anyTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    return transferTransaction;
  }
  const signAndSendTransaction = async () => {
    try {
      console.log("--------------------------------");
      const transaction = await createTransferTransaction();
      console.log("🚀 ~ signAndSendTransaction ~ transaction:", transaction);

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
      localStorage.setItem("url", url);
      console.log("Sending transaction...", url);

      // window.open(url);
      (window as any)?.Telegram?.WebApp.openLink(url);
    } catch (error) {
      console.error("🚀 ~ signAndSendTransaction ~ error:", error);
    }
  };
  const signAndSendSLPTransaction = async () => {
    try {
      console.log("--------------------------------");
      const transaction = await buildSLPTransaction({
        tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      });
      console.log("🚀 ~ signAndSendTransaction ~ transaction:", transaction);

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
      localStorage.setItem("url", url);
      console.log("Sending transaction...", url);

      // window.open(url);
      (window as any)?.Telegram?.WebApp.openLink(url);
    } catch (error) {
      console.error("🚀 ~ signAndSendTransaction ~ error:", error);
    }
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
      <button onClick={() => signAndSendSLPTransaction()}>
        Sign SLP Token
      </button>
    </div>
  );
};

const App = () => {
  return <DappConnect />;
};
export default App;
