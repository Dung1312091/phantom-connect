/* eslint-disable @typescript-eslint/no-explicit-any */
import { CoreUtil } from "@walletconnect/modal-core";
import { useEffect, useState } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

CoreUtil.isAndroid = (): boolean => {
  return false;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
CoreUtil.openHref = (href: string, target: "_blank" | "_self") => {
  (window as any).Telegram.WebApp.openLink(href);
};

const App = () => {
  const [provider, setProvider] = useState<any>(undefined);
  async function onConnect() {
    try {
      await provider.connect();
      setTimeout(() => {
        CoreUtil.isAndroid = (): boolean => {
          return true;
        };
      }, 5000);
    } catch (error) {
      console.log("onConnect error:", error);
      throw new Error("providerClient is not initialized");
    }
  }
  useEffect(() => {
    async function initProvider() {
      const provider = await EthereumProvider.init({
        projectId: "1f9dcc93c364e7e3347f29c20507b3f9",
        chains: [1],
        optionalChains: [1, 42161, 137, 10, 43114, 56] as number[],
        methods: ["personal_sign", "eth_sendTransaction"],
        showQrModal: true,
        qrModalOptions: {
          themeMode: "light",
          themeVariables: {
            "--wcm-z-index": "100000",
          },
          explorerExcludedWalletIds: [
            "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
          ],
          explorerRecommendedWalletIds: [
            "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
            "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
            "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f",
            "c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a",
            "ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18",
            "ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef",
            "bc949c5d968ae81310268bf9193f9c9fb7bb4e1283e1284af8f2bd4992535fd6",
          ],
        },
        metadata: {
          name: "Tobi Token Bot",
          description: "Wallet for WalletConnect",
          url: "https://app.tobiwallet.app/",
          icons: ["https://app.tobiwallet.app/icons/favicon.png"],
        },
      });
      setProvider(provider);
    }
    initProvider();
  }, []);
  return (
    <div>
      <h2>Testing</h2>
      <button
        onClick={() => {
          onConnect();
        }}
      >
        Connect 1
      </button>
      <button
        style={{
          marginLeft: 30,
        }}
        onClick={() => {
          window.open("https://metamask.app.link");
        }}
      >
        Metamask
      </button>
      <button
        style={{
          marginLeft: 30,
        }}
        onClick={() => {
          window.open(
            "metamask://wc?uri=wc%3A322375f5a3fff20f1fecd5963c8b353579c2aaec5ef34c1d1c5de4b2de221c55%402%3FexpiryTimestamp%3D1719503597%26relay-protocol%3Dirn%26symKey%3Df0d40dcb19366c40efb7d0f84f82232388604fee843c0420078234e624583816"
          );
        }}
      >
        Metamask uri
      </button>
    </div>
  );
};
export default App;
