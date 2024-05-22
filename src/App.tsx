/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { Buffer } from "buffer";
import { useEffect, useRef, useState } from "react";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
// import { v4 as uuidv4 } from "uuid";

import {
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from "@solana/spl-token";
const NETWORK =
  "https://broken-late-panorama.solana-mainnet.quiknode.pro/71a6fb542d7d3e0ae842f5804546b1ddeb0cbb70";

const DATA =
  "phantom_encryption_public_key=ArLe9x4enicNfP9ywnJxyDBZKMBvYg9H5ZShsWrxWoff&nonce=CrAgCDx8QcEQU9nz4Jtyu99N537Ch73St&data=8VNf5dZ92vuwmw52cSpXxrTxUMR15cX6hco2a4GaeAzgduu4Aygi1bmAioj9MoFvNa6uCcoRD4zEbTtpMzgVpeFCpNiu9qWTQzuQXcd48K5wLNDJQs8TjVbAZ6aB995vhD2rGmwuUwJSDZTyHzWbzsXB7nsQGpNyY7JXLC4GfWdSRQ2z7SfdEdMmhSQu1mPd5FjwuEdvnoPrbVt4rkx6yX458kzdfjyv2bMLnEBeXm2N5i2MZxvhSfvY8ErAfnDVDjx7YxwnwsQw3C1ho2vN2dapUamnNPaxycrcKQatzbFr7V9GMGZvAWVws5r521pCXhzX4XoYeHF9oB2XtxMgRuZ5JAeDeZwbw9bK8VuyCDscTYL92VEV1CqwcJG9gcztYmVoLf9D4ZtBmtrNDFLpEbt3AtR6YMxH6f27jPbu49FoZmCc";

const TRANSFER_DATA =
  "nonce=FKLxFTJEfjdEkuNYJxues1HFPkHhSX5PS&data=4VY8ZMpw7kBkpTWyQZ7mruJ7WFHQDRTt1FjnhVDH8BVyxpTGWGeXmbbopzt2pu5bnEiUj6Y62nN93rdG9zzg3gWFbGi5CLtAqcoPoff5bPr64gZ1gtub4GsT8pbtYa7M9i6WhJygdFftSEVmVdRhNTGpG89zjYq7cDsuXZpwYmMAu56X8c6wMLMdprCHgV3eGG2gaBpPNHce29ojtmSp2iiP5YgPgRR9EaqFGVkAMATExNVHLL8MK";

function initKeyPairs(): nacl.BoxKeyPair {
  const storedPublicKeyBase64 = localStorage.getItem("publicKey");
  const storedSecretKeyBase64 = localStorage.getItem("secretKey");
  if (storedPublicKeyBase64 && storedSecretKeyBase64) {
    const storedPublicKey = decodeBase64(storedPublicKeyBase64);
    const storedSecretKey = decodeBase64(storedSecretKeyBase64);
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

const pollingDataFromPhantomWallet = async (
  state: string,
  abortController: AbortController
) => {
  return new Promise<string>((resolve, reject) => {
    const _poll = async () => {
      try {
        const res = await fetch(
          `https://dev-api.telifi.xyz/accounts/phantom/polling/${state}`,
          {
            signal: abortController.signal,
          }
        );
        const data = await res.json();
        console.log("🚀 ~ const_poll= ~ data:", data);
        if (!data?.data) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return requestAnimationFrame(_poll);
        }
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    _poll();
  });
};
const Methods = {
  onConnect: "onConnect",
  onDisconnect: "onDisconnect",
  onSignAndSendTransaction: "onSignAndSendTransaction",
};
const POOLING_ID = "121212";

// const buildState = (method: string) => `${method}:${uuidv4()}`;
const buildState = (method: string) => `${method}:${POOLING_ID}`;

const DappConnect = () => {
  const connection = new Connection(NETWORK);
  const [dappKeyPair] = useState(() => initKeyPairs());
  const [session, setSession] = useState(() => storages.getSession());
  const [phantomPublicKey, setPhantomPublicKey] = useState(() =>
    storages.getPhanTomPublicKey()
  );
  const [poolingId, setPoolingId] = useState<string>("");
  const [sharedSecret, setSharedSecret] = useState<Uint8Array>();
  const pollingState = useRef(buildState(Methods.onConnect));
  const buildUrl = (path: string, params: URLSearchParams) =>
    `https://phantom.app/ul/v1/${path}?${params.toString()}`;

  const buildRedirectLink = (state: string) =>
    `https://dev-api.telifi.xyz/accounts/phantom/callback/${state}`;

  const onConnect = () => {
    setPoolingId(POOLING_ID);
    pollingState.current = buildState(Methods.onConnect);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: "mainnet-beta",
      app_url: "https://phantom.app",
      redirect_link: buildRedirectLink(pollingState.current),
    });
    // setPoolingId(uuidv4());
    const url = buildUrl("connect", params);
    console.log("url", url);
    (window as any)?.Telegram?.WebApp.openLink(url);
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
  async function checkIfTokenAccountExists(
    connection: any,
    receiverTokenAccountAddress: PublicKey
  ) {
    try {
      await getAccount(
        connection,
        receiverTokenAccountAddress,
        "confirmed",
        TOKEN_PROGRAM_ID
      );
      return true;
    } catch (error) {
      if ((error as Error).name === "TokenAccountNotFoundError") return false;
      throw error;
    }
  }
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
    const isTokenAccountAlreadyMade = await checkIfTokenAccountExists(
      connection,
      toTokenAccount
    );
    const transferTransaction = new Transaction();
    if (!isTokenAccountAlreadyMade) {
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        phantomPublicKey!,
        toTokenAccount,
        new PublicKey("9JMKSAKuz6amkRXnYdGj8AnpJGCrtVcPQSSkcYWcnDUd"),
        tokenMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      transferTransaction.add(createAccountInstruction);
    }
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
      setPoolingId(POOLING_ID);

      pollingState.current = buildState(Methods.onSignAndSendTransaction);
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
        // redirect_link: buildRedirectLink(pollingState.current),
        redirect_link: "https://www.google.com",
        payload: bs58.encode(encryptedPayload),
      });

      const url = buildUrl("signAndSendTransaction", params);
      localStorage.setItem("url", url);
      console.log("Sending transaction...", url);
      // setPoolingId(uuidv4());

      // window.open(url);
      (window as any)?.Telegram?.WebApp.openLink(url);
    } catch (error) {
      console.error("🚀 ~ signAndSendTransaction ~ error:", error);
    }
  };
  const signAndSendSLPTransaction = async () => {
    try {
      setPoolingId(POOLING_ID);
      pollingState.current = buildState(Methods.onSignAndSendTransaction);
      console.log("--------------------------------");
      const transaction = await buildSLPTransaction({
        tokenAddress: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
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
        redirect_link: buildRedirectLink(pollingState.current),
        payload: bs58.encode(encryptedPayload),
      });

      const url = buildUrl("signAndSendTransaction", params);
      localStorage.setItem("url", url);
      console.log("Sending transaction...", url);
      // setPoolingId(uuidv4());
      // window.open(url);
      (window as any)?.Telegram?.WebApp.openLink(url);
    } catch (error) {
      console.error("🚀 ~ signAndSendTransaction ~ error:", error);
    }
  };

  useEffect(() => {
    if (!poolingId) return;
    const abortController = new AbortController();
    async function getData() {
      const res = await pollingDataFromPhantomWallet(
        pollingState.current,
        abortController
      );
      console.log("🚀 ~ getData ~ res:", res);
      const params = new URLSearchParams(TRANSFER_DATA);
      console.log("🚀 ~ getData ~ params:", params);
      const phantom_encryption_public_key = params.get(
        "phantom_encryption_public_key"
      );
      console.log(
        "🚀 ~ onPaseConnectData ~ phantom_encryption_public_key:",
        phantom_encryption_public_key
      );
      const nonce = params.get("nonce");
      console.log("🚀 ~ getData ~ nonce:", nonce);
      const data = params.get("data");
      console.log("🚀 ~ getData ~ data:", data);
      if (/onConnect/.test(pollingState.current)) {
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
      } else if (/onSignAndSendTransaction/.test(pollingState.current)) {
        const signAndSendTransactionData = decryptPayload(
          params.get("data")!,
          params.get("nonce")!,
          sharedSecret
        );
        if (signAndSendTransactionData) {
          console.log("signAndSendTransactionData", signAndSendTransactionData);
        }
      }
    }

    getData();
    return () => abortController.abort();
  }, [poolingId]);

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
  const parseTransaction = () => {
    const params = new URLSearchParams(TRANSFER_DATA);

    const signAndSendTransactionData = decryptPayload(
      params.get("data")!,
      params.get("nonce")!,
      sharedSecret
    );
    if (signAndSendTransactionData) {
      console.log("signAndSendTransactionData", signAndSendTransactionData);
    }
  };
  return (
    <div>
      <button onClick={() => onConnect()}>Connect Phantom Wallet 1</button>
      <button onClick={() => signAndSendTransaction()}>Deposit Ton</button>
      <button onClick={() => onPaseConnectData()}>Parse</button>
      <button onClick={() => signAndSendSLPTransaction()}>
        Sign SLP Token
      </button>
      <button onClick={() => parseTransaction()}>Parse transaction</button>
    </div>
  );
};

const App = () => {
  return <DappConnect />;
};
export default App;
