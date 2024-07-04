/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createWeb3Modal,
  defaultConfig,
  // useWeb3ModalAccount,
  // useWeb3ModalProvider,
} from "@web3modal/ethers/react";
// import { BrowserProvider } from "ethers";
// import { useEffect } from "react";

// 1. Get projectId
const projectId = "a518d882993da1eeef8b6c65fab4cfcb";

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

// 3. Create a metadata object
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});
export function ConnectButton() {
  return <w3m-button />;
}
// function Test() {
//   const { address, chainId } = useWeb3ModalAccount();
//   console.log("🚀 ~ Test ~ chainId:", chainId);
//   console.log("🚀 ~ Test ~ address:", address);
//   const { walletProvider } = useWeb3ModalProvider();
//   useEffect(() => {
//     if (!walletProvider) return;

//     const ethersProvider = new BrowserProvider(walletProvider as any);

//     if (!ethersProvider) return;

//     ethersProvider.on("display_uri", (uri) => {
//       console.log("🚀 ~ ethersProvider.on ~ uri:", uri);
//     });
//   }, [walletProvider]);

//   async function getBalance() {
//     // if (!isConnected) throw Error("User disconnected");
//     // const signer = await ethersProvider.getSigner();
//     // const balance = await signer.getAddress();
//     // const x = await ethersProvider.getBalance(address as any);
//     // console.log("🚀 ~ getBalance ~ x:", x);
//     // console.log("🚀 ~ getBalance ~ balance:", balance);
//     // // The Contract object
//   }

//   return <button onClick={getBalance}>Get User Balance</button>;
// }
export default function App() {
  return (
    <div>
      <div>
        <ConnectButton />
        {/* <Test /> */}
      </div>
    </div>
  );
}
