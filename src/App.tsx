/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import bs58 from "bs58";
import { Buffer } from "buffer";
import { useState } from "react";
import nacl from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";

const DATA =
  "phantom_encryption_public_key=Gb5eMKg5Y8yHeEu4nhKukJ8ZMQ2KfHavn6CQXVxUBPWp&nonce=77Q7aQ3zF6TpUt1Ruh4BLoUH2RC7zdzrX&data=AAauk53iHKThYHaUFi47L6Gm5BWqaMWqEdr7C1E6qGnxxDhrVJkrBdj9W7y6kpyFTuWeGf2tEQYqpVASmLUFDj9HdTASiUpbsL55i7nycNYXmkwhSixubfhCUhiE27WZAseLXXuMZ2dcnZhZEuDcTLmuKQjwzhawmWP5sUixy4yBdjQzZj83LW3VTLbqWX2niQFzTymRBwbhSasYaKW18xQG9tyXHEYE1jmkrFZCchzbTQK2pqZecdtWA4q7i2XJ4wvoG2UPx1NXbS8tbeeUGED7UUjQ1Mpu98gsKKEACNYGAjzP5zXY2nqpqa7W681LW8fnRVFwpt9keVaor7XH6wiS1RHE9yHYEd8k6o2zdhEuvFUPansV628HMGvBJsEGZFfPKPyE6Xp7XfsFWffNu2VBU8p95T1X6yPDxF8Ric3Lw5Ru";

function initKeyPairs(): nacl.BoxKeyPair {
  const storedPublicKeyBase64 =
    localStorage.getItem("publicKey") ||
    "o3H7SeSmanVBxdzCse2EJRBY/FvJAqguCWJxYX8gSXg=";
  const storedSecretKeyBase64 =
    localStorage.getItem("secretKey") ||
    "R75wNkFc2clRIhKiLMtP1tSjgVpwvUSadmSqS5kRKmE=";
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

const DappConnect = () => {
  const [dappKeyPair] = useState(() => initKeyPairs());

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
    console.log("🚀 ~ DappConnect ~ decryptedData:", decryptedData);
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

    console.log(
      "🚀 ~ onTransfer ~ phantom_encryption_public_key:",
      { phantom_encryption_public_key },
      { nonce },
      { data }
    );
    const sharedSecretDapp = nacl.box.before(
      bs58.decode(phantom_encryption_public_key!),
      dappKeyPair.secretKey
    );
    const connectData = decryptPayload(data!, nonce!, sharedSecretDapp);
    console.log("🚀 ~ onTransfer ~ connectData:", connectData);
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

    // setSharedSecret(sharedSecretDapp);
    // setSession(connectData.session);
    // setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
    console.log("🚀 ~ onPaseConnectData ~ connectData:", connectData);
  };

  return (
    <div>
      <button onClick={() => onConnect()}>Connect Phantom Wallet 1</button>
      <button onClick={() => onTransfer()}>Deposit Ton</button>
      <button onClick={() => onPaseConnectData()}>Parse</button>
    </div>
  );
};

const App = () => {
  return <DappConnect />;
};
export default App;
