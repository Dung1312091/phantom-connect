import { useEffect, useState } from "react";

const Test = () => {
  useEffect(() => {
    localStorage.setItem("test", "1");
    return () => localStorage.removeItem("test");
  }, []);
  return (
    <div>
      <button
        onClick={() =>
          (window as any).Telegram.WebApp.openTelegramLink(
            "https://t.me/mpc_wallet_connect_bot/tobi_wallet?start_app=1"
          )
        }
      >
        Click
      </button>
    </div>
  );
};
const App = () => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <h3>App</h3>
      <div>{localStorage.getItem("test")}</div>
      <button onClick={() => setShow(!show)}>Click show</button>
      {show && <Test />}
    </div>
  );
};
export default App;
