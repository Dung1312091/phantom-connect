/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import bs58 from "bs58";
// import { Buffer } from "buffer";
// import { useState } from "react";
// import nacl from "tweetnacl";
// const DATA =
//   "phantom_encryption_public_key=JAgRqyJja9Y694ayFWc4HnbKiJPmMCbdpBoyYbg5CLTS&nonce=7XeUnuxFfeE9atnGrKw9q9qkZTG5njPrD&data=3tg1zW9sVraqXcoAo21tiSpLkscynYjLLhiVfzzJWBWPdNZXQrQM4rW1pVKgn8WctA4S7rALkMcwjuWoTXRaebbtcPnP74h5Xy9SRFS9tCftRFoZBAZq1dt3Q14DW7SxzzfhvFtiNwVLY1EnxDnCfSNeg4WJYRnMctDmQdWBwGw9dFNGwHrpdWLHGsLooZTtCS5gr1Y114zUeZQCvVKjxfXDdyUzj1eTxZLQjm4cps9nMWXwJYRpsDMgUFa8L5Hc7xcp6QH7uBfyvd5v5YYe9PxFhovxribmxisaQYyUVKFtira73rUNzkpFx2SxW4kYWPKU267cwGvgSQrCXnjuxigz49xZ6bVpVSoNWuqtqiQFm3iBvx7pnaMSLc1KPVGtK1fHvxAmWrn6QTm6mG6zB65eGcybbQCmPRSNEwCSS9awtumb&gfe_rd=mr&pli=1";
// // export const decodeBase64 = (b64: string) =>
// //   Uint8Array.from(atob(b64), (b) => b.charCodeAt(0));
// // export const encodeBase64 = (b: any) =>
// //   btoa(String.fromCodePoint.apply(null, b));

// // const KeyPair = {
// //   publicKey: "56os8hxWZGxbGIRqVOp8qUIoy+cdSrJLFjRer97sOmM=",
// //   secretKey: "nYnYQERbZQkKdKpiyRTcVIIoMsr1GNHUkqGvPnNCkwc=",
// // };

// const DappConnect = () => {
//   // const [dappKeyPair] = useState({
//   //   publicKey: decodeBase64(KeyPair.publicKey),
//   //   secretKey: decodeBase64(KeyPair.secretKey),
//   // });
//   const [dappKeyPair] = useState(nacl.box.keyPair());
//   // console.log("🚀 ~ DappConnect ~ dappKeyPair:", dappKeyPair);
//   // const publicKey = encodeBase64(dappKeyPair.publicKey);
//   // const secretKey = encodeBase64(dappKeyPair.secretKey);
//   // console.log("🚀 ~ DappConnect ~ secretKey:", secretKey);
//   // const xpublicKey = decodeBase64(publicKey);
//   // console.log("🚀 ~ DappConnect ~ xpublicKey:", xpublicKey);
//   // console.log("🚀 ~ DappConnect ~ xpublicKey:", xpublicKey);
//   // const xsecretKey = decodeBase64(secretKey);
//   // console.log("🚀 ~ DappConnect ~ xsecretKey:", xsecretKey);

//   const buildUrl = (path: string, params: URLSearchParams) =>
//     `https://phantom.app/ul/v1/${path}?${params.toString()}`;
//   const onConnect = () => {
//     const params = new URLSearchParams({
//       dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//       cluster: "mainnet-beta",
//       app_url: "https://phantom.app",
//       redirect_link: "https://www.google.com.vn",
//     });
//     const url = buildUrl("connect", params);
//     console.log("url", url);
//     window.open(url);
//   };
//   function openMetaMaskUrl(url: string) {
//     const a = document.createElement("a");
//     a.href = url;
//     a.target = "_self";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   }
//   const decryptPayload = (
//     data: string,
//     nonce: string,
//     sharedSecret?: Uint8Array
//   ) => {
//     if (!sharedSecret) throw new Error("missing shared secret");

//     const decryptedData = nacl.box.open.after(
//       bs58.decode(data),
//       bs58.decode(nonce),
//       sharedSecret
//     );
//     console.log("🚀 ~ DappConnect ~ decryptedData:", decryptedData);
//     if (!decryptedData) {
//       throw new Error("Unable to decrypt data");
//     }
//     return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
//   };
//   const onTransfer = () => {
//     const params = new URLSearchParams(DATA);
//     console.log("🚀 ~ onTransfer ~ params:", params);
//     const phantom_encryption_public_key = params.get(
//       "phantom_encryption_public_key"
//     );
//     const nonce = params.get("nonce");
//     const data = params.get("data");
//     const public_key = params.get("public_key");
//     const session = params.get("session");
//     console.log(
//       "🚀 ~ onTransfer ~ phantom_encryption_public_key:",
//       { phantom_encryption_public_key },
//       { nonce },
//       { data },
//       { public_key },
//       { session }
//     );
//     const sharedSecretDapp = nacl.box.before(
//       bs58.decode(params.get("phantom_encryption_public_key")!),
//       dappKeyPair.secretKey
//     );
//     const connectData = decryptPayload(data!, nonce!, sharedSecretDapp);
//     console.log("🚀 ~ onTransfer ~ connectData:", connectData);
//   };

//   return (
//     <div>
//       <button onClick={() => onConnect()}>Connect Phantom Wallet 1</button>
//       <button onClick={() => onTransfer()}>Deposit Ton</button>
//       <button onClick={() => openMetaMaskUrl("https://metamask.app.link/")}>
//         Open metamask
//       </button>
//     </div>
//   );
// };

// const App = () => {
//   return <DappConnect />;
// };
// export default App;

import { useEffect, useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { CoreUtil, EventsCtrl, ExplorerCtrl } from "@walletconnect/modal-core";
export const App = () => {
  // const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<any>(undefined);
  console.log("🚀 ~ App ~ provider:", provider);
  console.log("----------------session", provider?.session);
  const [uri, setUri] = useState("");
  // const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initProvider() {
      const provider = await EthereumProvider.init({
        projectId: "108fb42acd2ea6ecab66593e3e948204",
        chains: [1],
        methods: ["personal_sign", "eth_sendTransaction"],
        showQrModal: true,
        qrModalOptions: {
          themeMode: "light",
          themeVariables: {
            "--wcm-z-index": "100000",
          },
        },
        metadata: {
          name: "Tobi Token Bot",
          description: "Wallet for WalletConnect",
          url: "https://www.tobi.fun/",
          icons: ["https://app.tobiwallet.app/icons/favicon.png"],
        },
      });
      setProvider(provider);
      setIsInitializing(false);
    }
    initProvider();
  }, []);
  useEffect(() => {
    EventsCtrl.subscribe(async (event) => {
      console.log("event", event);
      const wallet = ExplorerCtrl.state?.recomendedWallets?.find(
        (wallet) => wallet.id === (event.data as any)?.walletId
      );
      console.log("wallet", wallet);
      const walletUrl = wallet?.mobile?.universal;
      const name = wallet?.name;
      if (walletUrl) {
        const href = CoreUtil.formatUniversalUrl(walletUrl, uri, name!);
        (window as any).Telegram.webApp.openLink(href);
      }
    });
  }, [uri]);
  useEffect(() => {
    if (!provider) return;
    provider.on("display_uri", (uri: string) => {
      console.log("🚀 ~ provider.on ~ uri:", uri);
      setUri(uri);
      // setIsConnecting(false);
    });
  }, [provider]);

  useEffect(() => {
    if (!provider) return;
    provider.on("accountsChanged", (account: any) => {
      console.log("on account change", account);
    });
  }, [provider]);

  async function onConnect() {
    try {
      // setIsConnecting(true);
      await provider.connect();
      // setOpenDepositEvmAssets(true);
    } catch (error) {
      console.log("onConnect error:", error);
      throw new Error("providerClient is not initialized");
    } finally {
      // setIsConnecting(false);
      // setUri("");
    }
  }

  async function handleDisconnect() {
    try {
      // setIsDisconnecting(true);
      await provider.disconnect();
    } catch (error) {
      console.error("disconnect error", error);
    } finally {
      console.log("disconnect");
      // setIsDisconnecting(false);
    }
  }
  console.log("isInitializing", isInitializing);
  return (
    <div>
      <button
        onClick={() => {
          if (isInitializing) return;
          if (!provider?.accounts[0] && !provider?.session) {
            onConnect();
          } else {
            handleDisconnect();
            console.log("provider", provider);
          }
        }}
      >
        Onclick
      </button>
    </div>
  );
};
export default App;
