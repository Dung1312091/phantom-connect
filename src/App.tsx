import { useState } from "react";

const App = () => {
  const [value, setValue] = useState(
    "wc:5eb4f61704d2240171a55c9384925aeef1bf7f485e9b69281bff27855888fb72@2?relay-protocol=irn&symKey=d7d1f1ede0d85b4f8b343bc19b9dc98ee666bc09a2471bb2a707cdaaa948e81b"
  );
  return (
    <div>
      <h2>Testing</h2>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
      <button
        onClick={() => {
          window.open(
            `https://backend-proxy-dev-asia-southeast1-ca53qqytra-as.a.run.app/accounts/wallet-connect/redirect/wc?uri=${value}`
          );
        }}
      >
        Click
      </button>
    </div>
  );
};
export default App;
